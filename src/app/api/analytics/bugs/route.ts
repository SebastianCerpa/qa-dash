import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const projectId = searchParams.get("projectId");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const whereClause: Prisma.bug_reportsWhereInput = {
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (projectId) {
      whereClause.project_id = projectId;
    }

    // Get basic metrics
    const [totalBugs, newBugs, resolvedBugs, criticalBugs] = await Promise.all([
      prisma.bug_reports.count({ where: whereClause }),
      prisma.bug_reports.count({ where: whereClause }),
      prisma.bug_reports.count({
        where: {
          ...whereClause,
          status: { in: ["RESOLVED", "CLOSED"] },
        },
      }),
      prisma.bug_reports.count({
        where: {
          ...whereClause,
          severity: { in: ["CRITICAL", "BLOCKER"] },
          status: { notIn: ["RESOLVED", "CLOSED"] },
        },
      }),
    ]);

    // Calculate resolution rate
    const resolutionRate =
      totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;

    // Calculate average resolution time
    const resolvedBugsWithTime = await prisma.bug_reports.findMany({
      where: {
        ...whereClause,
        status: { in: ["RESOLVED", "CLOSED"] },
        resolved_at: { not: null },
      },
      select: {
        created_at: true,
        resolved_at: true,
      },
    });

    const avgResolutionTime =
      resolvedBugsWithTime.length > 0
        ? Math.round(
            resolvedBugsWithTime.reduce((acc, bug) => {
              const resolutionTime =
                (new Date(bug.resolved_at!).getTime() -
                  new Date(bug.created_at).getTime()) /
                (1000 * 60 * 60); // hours
              return acc + resolutionTime;
            }, 0) / resolvedBugsWithTime.length
          )
        : 0;

    // Get trend data (daily counts)
    const trendData = await getTrendData(
      startDate,
      endDate,
      projectId || undefined
    );

    // Get severity distribution
    const severityData = await getSeverityDistribution(whereClause);

    // Get status distribution
    const statusData = await getStatusDistribution(whereClause);

    // Get top reporters and assignees
    const topReporters = await getTopReporters(whereClause);
    const topAssignees = await getTopAssignees(whereClause);

    // Get flaky tests data
    const flakyTests = await getFlakyTestsData();

    // Get test execution metrics
    const testMetrics = await getTestExecutionMetrics(startDate, endDate);

    return NextResponse.json({
      summary: {
        totalBugs,
        newBugs,
        resolvedBugs,
        criticalBugs,
        resolutionRate,
        avgResolutionTime,
      },
      trendData,
      severityData,
      statusData,
      topReporters,
      topAssignees,
      flakyTests,
      testMetrics,
      dateRange: {
        start: startDate,
        end: endDate,
        range,
      },
    });
  } catch (error) {
    console.error("Error fetching bug analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function getTrendData(
  startDate: Date,
  endDate: Date,
  projectId?: string
) {
  try {
    const whereClause: Prisma.bug_reportsWhereInput = {
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (projectId) {
      whereClause.project_id = projectId;
    }

    // Get daily bug counts using proper query construction
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as opened,
        COUNT(CASE WHEN status IN ('RESOLVED', 'CLOSED') THEN 1 END) as resolved
      FROM bug_reports 
      WHERE created_at >= $1 AND created_at <= $2`;

    const params: (Date | string)[] = [startDate, endDate];

    if (projectId) {
      query += ` AND project_id = $3`;
      params.push(projectId);
    }

    query += `
      GROUP BY DATE(created_at)
      ORDER BY date`;

    const dailyBugs = (await prisma.$queryRawUnsafe(query, ...params)) as {
      date: Date | string;
      opened: number | bigint;
      resolved: number | bigint;
    }[];

    return {
      labels: dailyBugs.map((d) => {
        const date = new Date(d.date);
        return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      }),
      opened: dailyBugs.map((d) => Number(d.opened)),
      resolved: dailyBugs.map((d) => Number(d.resolved)),
    };
  } catch (error) {
    console.error("Error in getTrendData:", error);
    return {
      labels: [],
      opened: [],
      resolved: [],
    };
  }
}

async function getSeverityDistribution(
  whereClause: Prisma.bug_reportsWhereInput
) {
  const severityCount = await prisma.bug_reports.groupBy({
    by: ["severity"],
    where: whereClause,
    _count: true,
  });

  const severityOrder = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "BLOCKER"];
  return severityOrder.map((severity) => {
    const found = severityCount.find((s) => s.severity === severity);
    return found ? found._count : 0;
  });
}

async function getStatusDistribution(
  whereClause: Prisma.bug_reportsWhereInput
) {
  const statusCount = await prisma.bug_reports.groupBy({
    by: ["status"],
    where: whereClause,
    _count: true,
  });

  return statusCount.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);
}

async function getTopReporters(whereClause: Prisma.bug_reportsWhereInput) {
  const topReporters = await prisma.bug_reports.groupBy({
    by: ["reporter_id"],
    where: whereClause,
    _count: true,
    orderBy: {
      _count: {
        reporter_id: "desc",
      },
    },
    take: 5,
  });

  // Get user details
  const reporterIds = topReporters.map((r) => r.reporter_id);
  const users = await prisma.users.findMany({
    where: { id: { in: reporterIds } },
    select: { id: true, name: true, email: true, avatar_url: true },
  });

  return topReporters.map((reporter) => {
    const user = users.find((u) => u.id === reporter.reporter_id);
    return {
      user: user || null,
      count: reporter._count,
    };
  });
}

async function getTopAssignees(whereClause: Prisma.bug_reportsWhereInput) {
  const topAssignees = await prisma.bug_reports.groupBy({
    by: ["assignee_id"],
    where: {
      ...whereClause,
      assignee_id: { not: null },
    },
    _count: true,
    orderBy: {
      _count: {
        assignee_id: "desc",
      },
    },
    take: 5,
  });

  // Get user details
  const assigneeIds = topAssignees
    .map((a) => a.assignee_id)
    .filter(Boolean) as string[];
  const users = await prisma.users.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true, email: true, avatar_url: true },
  });

  return topAssignees.map((assignee) => {
    const user = users.find((u) => u.id === assignee.assignee_id);
    return {
      user: user || null,
      count: assignee._count,
    };
  });
}

async function getFlakyTestsData() {
  const flakyTests = await prisma.test_executions.findMany({
    where: {
      is_flaky: true,
      executed_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    select: {
      test_case_name: true,
      flaky_score: true,
      test_suite_id: true,
    },
    distinct: ["test_case_name"],
    orderBy: {
      flaky_score: "desc",
    },
    take: 10,
  });

  return flakyTests;
}

async function getTestExecutionMetrics(startDate: Date, endDate: Date) {
  const testExecutions = await prisma.test_executions.findMany({
    where: {
      executed_at: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalTests = testExecutions.length;
  const passedTests = testExecutions.filter(
    (t) => t.status === "PASSED"
  ).length;
  const failedTests = testExecutions.filter(
    (t) => t.status === "FAILED"
  ).length;
  const flakyTests = testExecutions.filter((t) => t.is_flaky).length;

  const passRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const avgDuration =
    totalTests > 0
      ? Math.round(
          testExecutions.reduce((acc, t) => acc + t.duration, 0) / totalTests
        )
      : 0;

  return {
    totalTests,
    passedTests,
    failedTests,
    flakyTests,
    passRate,
    avgDuration,
  };
}
