/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if test plan exists
    const existingTestPlan = await prisma.test_plans.findUnique({
      where: { id },
      include: {
        test_cases: true,
      },
    });

    if (!existingTestPlan) {
      return NextResponse.json(
        { error: "Test plan not found" },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { status, testCaseResults } = data;

    // Validate status
    if (!status || !['DRAFT', 'ACTIVE', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: DRAFT, ACTIVE, COMPLETED" },
        { status: 400 }
      );
    }

    // Get the test plan (no need to update status as it doesn't exist in the schema)
    const updatedTestPlan = await prisma.test_plans.findUnique({
      where: { id },
    });

    // If test case results are provided, update each test case
    if (testCaseResults && Array.isArray(testCaseResults) && testCaseResults.length > 0) {
      await Promise.all(
        testCaseResults.map(async (result: any) => {
          if (!result.id) return;

          // Validate test case status
          const testCaseStatus = result.status;
          if (!testCaseStatus || !['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'NOT_EXECUTED'].includes(testCaseStatus)) {
            console.warn(`Invalid status for test case ${result.id}: ${testCaseStatus}`);
            return;
          }

          // Update the test case
          await prisma.test_cases.update({
            where: { id: result.id },
            data: {
              status: testCaseStatus,
              last_executed: testCaseStatus !== 'NOT_EXECUTED' ? new Date() : undefined,
              steps: result.steps || undefined,
              updated_at: new Date(),
            },
          });

          // If test case was executed, create a test execution record
          if (testCaseStatus !== 'NOT_EXECUTED') {
            const testCase = await prisma.test_cases.findUnique({
              where: { id: result.id },
              select: { title: true },
            });

            await prisma.test_executions.create({
              data: {
                test_case_id: result.id,
                executed_by: user.id,
                status: testCaseStatus === 'PASSED' ? 'PASSED' : testCaseStatus === 'FAILED' ? 'FAILED' : 'SKIPPED',
                notes: testCaseStatus === 'FAILED' ? (result.errorMessage || null) : null,
                execution_date: new Date(),
              },
            });

            // If test case failed and createBugReport is true, create a bug report
            if (testCaseStatus === 'FAILED' && result.createBugReport) {
              await prisma.bug_reports.create({
                data: {
                  title: `Test Case Failure: ${testCase?.title || `Test Case ${result.id}`}`,
                  description: `Test case execution failed with the following details:\n\n${result.errorMessage || 'No error message provided'}`,
                  severity: 'MEDIUM',
                  priority: 'MEDIUM',
                  status: 'OPEN',
                  steps_to_reproduce: result.steps ? JSON.stringify(result.steps) : null,
                  expected_behavior: result.expectedResult || null,
                  actual_behavior: result.actualResult || 'Test case execution failed',
                  reporter_id: user.id,
                  test_case_link: result.id,
                  is_regression: false,
                },
              });
            }
          }
        })
      );
    }

    // Fetch the updated test plan with associated test cases
    const testPlanWithTestCases = await prisma.test_plans.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        projects: {
          select: { id: true, name: true },
        },
        test_cases: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            type: true,
            steps: true,
            expected_result: true,
            preconditions: true,
            tags: true,
            last_executed: true,
          },
        },
      },
    });

    // Process test cases to handle JSON fields
    const processedTestCases = testPlanWithTestCases?.test_cases.map(testCase => ({
      ...testCase,
      steps: testCase.steps as any,
      tags: testCase.tags ? JSON.parse(testCase.tags as string) : [],
    })) || [];

    // Calculate execution summary
    const totalTests = processedTestCases.length;
    const passed = processedTestCases.filter(tc => tc.status === "PASSED").length;
    const failed = processedTestCases.filter(tc => tc.status === "FAILED").length;
    const blocked = processedTestCases.filter(tc => tc.status === "BLOCKED").length;
    const skipped = processedTestCases.filter(tc => tc.status === "SKIPPED").length;
    const executionRate = totalTests > 0 ? 
      ((passed + failed + blocked + skipped) / totalTests) * 100 : 0;

    const processedTestPlan = {
      ...testPlanWithTestCases,
      test_cases: processedTestCases,
      executionSummary: {
        totalTests,
        passed,
        failed,
        blocked,
        skipped,
        executionRate,
      },
    };

    return NextResponse.json({
      testPlan: processedTestPlan,
      message: `Test plan executed successfully with status: ${status}`,
    });
  } catch (error) {
    console.error("Error executing test plan:", error);
    return NextResponse.json(
      { error: "Failed to execute test plan" },
      { status: 500 }
    );
  }
}