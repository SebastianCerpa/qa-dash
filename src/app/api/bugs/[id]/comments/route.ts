import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await prisma.bug_comments.findMany({
      where: { bug_id: id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      where: { id },
    });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const comment = await prisma.bug_comments.create({
      data: {
        bug_id: id,
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
        bug_id: id,
        user_id: user.id,
        action: "commented",
        description: `Added a comment: ${content.substring(0, 100)}${
          content.length > 100 ? "..." : ""
        }`,
      },
    });

    // Notifications removed

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating bug comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
