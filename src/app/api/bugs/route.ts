/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { Prisma, Severity, BugStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const severity = searchParams.get("severity") as Severity | null;
    const status = searchParams.get("status") as BugStatus | null;
    const assigneeId = searchParams.get("assigneeId") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: Prisma.bug_reportsWhereInput = {};

    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (assigneeId) where.assignee_id = assigneeId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [bugs, total] = await Promise.all([
      prisma.bug_reports.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          project: { select: { id: true, name: true } },
          attachments: true,
          screenshots: true,
          _count: {
            select: {
              comments: true,
              activities: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bug_reports.count({ where }),
    ]);

    return NextResponse.json({
      bugs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bugs:", error);
    return NextResponse.json(
      { error: "Failed to fetch bugs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();

    // Check for regression by looking for similar resolved bugs
    const isRegression = await checkForRegression(data.title, data.description);

    const bug = await prisma.bug_reports.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity || "MEDIUM",
        priority: data.priority || "MEDIUM",
        environment: data.environment,
        steps_to_reproduce: data.stepsToReproduce,
        expected_behavior: data.expectedBehavior,
        actual_behavior: data.actualBehavior,
        browser_info: data.browserInfo,
        os_info: data.osInfo,
        device_info: data.deviceInfo,
        tags: data.tags || [],
        labels: data.labels || [],
        reporter_id: user.id,
        assignee_id: data.assigneeId,
        project_id: data.projectId,
        is_regression: isRegression,
        regression_count: isRegression ? 1 : 0,
        test_case_link: data.testCaseLink,
        automation_test_id: data.automationTestId,
        ci_pipeline_url: data.ciPipelineUrl,
        build_number: data.buildNumber,
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        project: { select: { id: true, name: true } },
      },
    });

    // Create activity log
    await prisma.bug_activities.create({
      data: {
        bug_id: bug.id,
        user_id: user.id,
        action: "created",
        description: `Bug report created: ${bug.title}`,
      },
    });

    // Auto-assign based on labels if no assignee specified
    if (!data.assigneeId && data.labels?.length > 0) {
      await autoAssignBug(bug.id, data.labels);
    }

    // Send notifications for critical bugs
    if (bug.severity === "CRITICAL" || bug.severity === "BLOCKER") {
      await sendCriticalBugAlert(bug);
    }

    return NextResponse.json(bug, { status: 201 });
  } catch (error) {
    console.error("Error creating bug:", error);
    return NextResponse.json(
      { error: "Failed to create bug" },
      { status: 500 }
    );
  }
}

// Helper functions
async function checkForRegression(
  title: string,
  description: string
): Promise<boolean> {
  try {
    // Look for similar resolved bugs using text similarity
    const resolvedBugs = await prisma.bug_reports.findMany({
      where: {
        status: { in: ["RESOLVED", "CLOSED"] },
        OR: [
          { title: { contains: title.split(" ")[0] } },
          {
            description: {
              contains: description.substring(0, 50),
            },
          },
        ],
      },
      take: 5,
    });

    return resolvedBugs.length > 0;
  } catch (error) {
    console.error("Error checking for regression:", error);
    return false;
  }
}

async function autoAssignBug(bugId: string, labels: string[]) {
  try {
    const assignmentRules = [
      { labels: ["frontend", "ui", "css"], role: "Frontend Developer" },
      { labels: ["backend", "api", "database"], role: "Backend Developer" },
      { labels: ["mobile", "ios", "android"], role: "Mobile Developer" },
      { labels: ["performance", "optimization"], role: "Performance Engineer" },
    ];

    for (const rule of assignmentRules) {
      if (labels.some((label) => rule.labels.includes(label.toLowerCase()))) {
        // Find available team member with matching role
        const assignee = await prisma.users.findFirst({
          where: {
            role: { contains: rule.role },
            status: "active",
          },
        });

        if (assignee) {
          await prisma.bug_reports.update({
            where: { id: bugId },
            data: { assignee_id: assignee.id },
          });

          // Log the auto-assignment
          await prisma.bug_activities.create({
            data: {
              bug_id: bugId,
              user_id: assignee.id,
              action: "assigned",
              description: `Auto-assigned based on labels: ${labels.join(
                ", "
              )}`,
            },
          });

          break;
        }
      }
    }
  } catch (error) {
    console.error("Error auto-assigning bug:", error);
  }
}

async function sendCriticalBugAlert(bug: any) {
  try {
    // Create notification for QA leads
    const qaLeads = await prisma.users.findMany({
      where: {
        role: { in: ["QA Lead", "QA Manager"] },
        status: "active",
      },
    });

    for (const lead of qaLeads) {
      await prisma.notifications.create({
        data: {
          user_id: lead.id,
          message: `🚨 Critical Bug Alert: ${bug.title} (${bug.severity})`,
          is_read: false,
        },
      });
    }

    // In a real implementation, you would also send Slack/email notifications here
    console.log(`Critical bug alert sent for: ${bug.title}`);
  } catch (error) {
    console.error("Error sending critical bug alert:", error);
  }
}
