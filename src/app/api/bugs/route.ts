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

    const where: any = {};

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
        is_regression: false,
        regression_count: 0,
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

    // No auto-assignment or notifications

    return NextResponse.json(bug, { status: 201 });
  } catch (error) {
    console.error("Error creating bug:", error);
    return NextResponse.json(
      { error: "Failed to create bug" },
      { status: 500 }
    );
  }
}

// Helper functions removed
