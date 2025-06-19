/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bug = await prisma.bug_reports.findUnique({
      where: { id: params.id },
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
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar_url: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar_url: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
        test_executions: {
          orderBy: { executed_at: "desc" },
          take: 10,
        },
      },
    });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json(bug);
  } catch (error) {
    console.error("Error fetching bug:", error);
    return NextResponse.json({ error: "Failed to fetch bug" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();

    // Get current bug to track changes
    const currentBug = await prisma.bug_reports.findUnique({
      where: { id: params.id },
    });

    if (!currentBug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const updatedBug = await prisma.bug_reports.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        priority: data.priority,
        status: data.status,
        environment: data.environment,
        steps_to_reproduce: data.stepsToReproduce,
        expected_behavior: data.expectedBehavior,
        actual_behavior: data.actualBehavior,
        browser_info: data.browserInfo,
        os_info: data.osInfo,
        device_info: data.deviceInfo,
        tags: data.tags,
        labels: data.labels,
        assignee_id: data.assigneeId,
        project_id: data.projectId,
        resolved_at:
          data.status === "RESOLVED" || data.status === "CLOSED"
            ? new Date()
            : null,
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

    // Track changes and create activity logs
    const changes = [];
    if (currentBug.title !== data.title)
      changes.push({ field: "title", old: currentBug.title, new: data.title });
    if (currentBug.severity !== data.severity)
      changes.push({
        field: "severity",
        old: currentBug.severity,
        new: data.severity,
      });
    if (currentBug.priority !== data.priority)
      changes.push({
        field: "priority",
        old: currentBug.priority,
        new: data.priority,
      });
    if (currentBug.status !== data.status)
      changes.push({
        field: "status",
        old: currentBug.status,
        new: data.status,
      });
    if (currentBug.assignee_id !== data.assigneeId)
      changes.push({
        field: "assignee",
        old: currentBug.assignee_id,
        new: data.assigneeId,
      });

    // Create activity logs for each change
    for (const change of changes) {
      await prisma.bug_activities.create({
        data: {
          bug_id: params.id,
          user_id: user.id,
          action: "updated",
          field: change.field,
          old_value: change.old?.toString(),
          new_value: change.new?.toString(),
          description: `${change.field} changed from ${change.old} to ${change.new}`,
        },
      });
    }

    // Send notifications for critical changes
    if (
      changes.some(
        (c) =>
          c.field === "severity" &&
          (c.new === "CRITICAL" || c.new === "BLOCKER")
      )
    ) {
      await sendCriticalBugAlert(updatedBug);
    }

    return NextResponse.json(updatedBug);
  } catch (error) {
    console.error("Error updating bug:", error);
    return NextResponse.json(
      { error: "Failed to update bug" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has permission to delete (admin or bug reporter)
    const bug = await prisma.bug_reports.findUnique({
      where: { id: params.id },
    });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    if (
      bug.reporter_id !== user.id &&
      !user.role.includes("Admin") &&
      !user.role.includes("Manager")
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await prisma.bug_reports.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Bug deleted successfully" });
  } catch (error) {
    console.error("Error deleting bug:", error);
    return NextResponse.json(
      { error: "Failed to delete bug" },
      { status: 500 }
    );
  }
}

// Helper function for critical bug alerts
async function sendCriticalBugAlert(bug: any) {
  try {
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
  } catch (error) {
    console.error("Error sending critical bug alert:", error);
  }
}
