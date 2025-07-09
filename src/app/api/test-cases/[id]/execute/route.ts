/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Extract the ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // Get the ID from the path
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate that the ID is valid
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "Invalid test case ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, bug_report, notes } = body;

    // Validate the provided status
    if (!status || !['PASSED', 'FAILED', 'BLOCKED', 'NOT_EXECUTED'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid State. Must be one of: PASSED, FAILED, BLOCKED, NOT_EXECUTED" },
        { status: 400 }
      );
    }

    // Verify that the test case exists
    const testCase = await prisma.test_cases.findUnique({
      where: { id },
    });

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    // Update the test case status
    const updatedTestCase = await prisma.test_cases.update({
      where: { id },
      data: {
        status,
        last_executed: new Date(),
        last_executed_by: session.user.email,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        test_plans: {
          select: { id: true, title: true },
        },
        linked_task: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    // Create an execution record
    await prisma.test_executions.create({
      data: {
        test_case_id: id,
        executed_by: session.user.email,
        status,
        execution_date: new Date(),
        notes: body.notes || null,
      },
    });

    // If the test case failed and an error report was requested, create it
    if (status === 'FAILED' && bug_report) {
      try {
        // Get user by email
        const user = await prisma.users.findUnique({
          where: { email: session.user.email },
        });

        if (!user) {
          console.error("User not found to create error report");
        } else {
          await prisma.bug_reports.create({
            data: {
              title: bug_report.title || `Bug in test case: ${testCase.title}`,
              description: bug_report.description || '',
              status: 'OPEN',
              priority: 'MEDIUM',
              reporter_id: user.id,
              test_case_link: id,
            },
          });
        }
      } catch (bugError) {
        console.error("Error creating bug report:", bugError);
        // Continue even if error report creation fails
      }
    }

    // Process JSON fields before returning response
    try {
      // Get test case executions
      const testExecutions = await prisma.test_executions.findMany({
        where: { test_case_id: id },
        orderBy: { execution_date: 'desc' },
        include: {
          created_bug: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

      const processedTestCase = {
        ...updatedTestCase,
        steps: updatedTestCase.steps ? (typeof updatedTestCase.steps === 'string' ? JSON.parse(updatedTestCase.steps) : updatedTestCase.steps) : [],
        tags: updatedTestCase.tags ? (typeof updatedTestCase.tags === 'string' ? JSON.parse(updatedTestCase.tags) : []) : [],
        test_executions: testExecutions,
      };

      return NextResponse.json(processedTestCase);
    } catch (parseError) {
      console.error("Error parsing JSON fields:", parseError);
      return NextResponse.json(
        { error: "Error processing test case data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error executing test case:", error);
    return NextResponse.json(
      { error: "Error executing test case" },
      { status: 500 }
    );
  }
}