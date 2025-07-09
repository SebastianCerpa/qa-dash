/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";

// Get all test cases associated with a test plan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Check if test plan exists
    const testPlan = await prisma.test_plans.findUnique({
      where: { id },
    });

    if (!testPlan) {
      return NextResponse.json(
        { error: "Test plan not found" },
        { status: 404 }
      );
    }

    // Get test cases associated with the test plan
    const [testCases, total] = await Promise.all([
      prisma.test_cases.findMany({
        where: { test_plan_id: id },
        include: {
          users: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          linked_task: {
            select: { id: true, title: true, status: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.test_cases.count({ where: { test_plan_id: id } }),
    ]);

    // Process test cases to handle JSON fields
    const processedTestCases = testCases.map(testCase => ({
      ...testCase,
      steps: testCase.steps as any,
      tags: testCase.tags ? JSON.parse(testCase.tags as string) : [],
    }));

    return NextResponse.json({
      testCases: processedTestCases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching test cases for test plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch test cases" },
      { status: 500 }
    );
  }
}

// Add or remove test cases from a test plan
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

    // Check if test plan exists
    const testPlan = await prisma.test_plans.findUnique({
      where: { id },
    });

    if (!testPlan) {
      return NextResponse.json(
        { error: "Test plan not found" },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { testCaseIds, action } = data;

    if (!testCaseIds || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
      return NextResponse.json(
        { error: "Test case IDs are required" },
        { status: 400 }
      );
    }

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: "Action must be either 'add' or 'remove'" },
        { status: 400 }
      );
    }

    // Add or remove test cases from the test plan
    if (action === 'add') {
      await Promise.all(
        testCaseIds.map((testCaseId: string) =>
          prisma.test_cases.update({
            where: { id: testCaseId },
            data: { test_plan_id: id },
          })
        )
      );
    } else {
      await Promise.all(
        testCaseIds.map((testCaseId: string) =>
          prisma.test_cases.update({
            where: { id: testCaseId, test_plan_id: id },
            data: { test_plan_id: null },
          })
        )
      );
    }

    // Get updated test cases associated with the test plan
    const updatedTestCases = await prisma.test_cases.findMany({
      where: { test_plan_id: id },
      include: {
        users: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        linked_task: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    // Process test cases to handle JSON fields
    const processedTestCases = updatedTestCases.map(testCase => ({
      ...testCase,
      steps: testCase.steps as any,
      tags: testCase.tags ? JSON.parse(testCase.tags as string) : [],
    }));

    // Calculate execution summary
    const totalTests = processedTestCases.length;
    const passed = processedTestCases.filter(tc => tc.status === "PASSED").length;
    const failed = processedTestCases.filter(tc => tc.status === "FAILED").length;
    const blocked = processedTestCases.filter(tc => tc.status === "BLOCKED").length;
    const skipped = processedTestCases.filter(tc => tc.status === "SKIPPED").length;
    const executionRate = totalTests > 0 ? 
      ((passed + failed + blocked + skipped) / totalTests) * 100 : 0;

    return NextResponse.json({
      testCases: processedTestCases,
      executionSummary: {
        totalTests,
        passed,
        failed,
        blocked,
        skipped,
        executionRate,
      },
      message: `Successfully ${action === 'add' ? 'added' : 'removed'} ${testCaseIds.length} test case(s) ${action === 'add' ? 'to' : 'from'} the test plan`,
    });
  } catch (error) {
    console.error("Error updating test cases for test plan:", error);
    return NextResponse.json(
      { error: "Failed to update test cases" },
      { status: 500 }
    );
  }
}