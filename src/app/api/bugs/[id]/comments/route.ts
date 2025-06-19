import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.bug_comments.findMany({
      where: { bug_id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching bug comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Verify bug exists
    const bug = await prisma.bug_reports.findUnique({
      where: { id: params.id },
    });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const comment = await prisma.bug_comments.create({
      data: {
        bug_id: params.id,
        author_id: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
      },
    });

    // Create activity log
    await prisma.bug_activities.create({
      data: {
        bug_id: params.id,
        user_id: user.id,
        action: "commented",
        description: `Added a comment: ${content.substring(0, 100)}${
          content.length > 100 ? "..." : ""
        }`,
      },
    });

    // Send notification to bug assignee and reporter (if different from commenter)
    // 👇 Asegura que los elementos del Set son string
    const notificationUserIds = new Set<string>();

    if (bug.assignee_id && bug.assignee_id !== user.id) {
      notificationUserIds.add(bug.assignee_id);
    }
    if (bug.reporter_id !== user.id) {
      notificationUserIds.add(bug.reporter_id);
    }

    for (const userId of notificationUserIds) {
      await prisma.notifications.create({
        data: {
          user_id: userId,
          message: `${user.name} commented on bug: ${bug.title}`,
          is_read: false,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating bug comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
