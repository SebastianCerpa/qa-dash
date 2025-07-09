/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testPlan = await prisma.test_plans.findUnique({
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
          },
        },
      },
    });

    if (!testPlan) {
      return NextResponse.json(
        { error: "Test plan not found" },
        { status: 404 }
      );
    }

    // Process test cases to handle JSON fields
    const processedTestCases = testPlan.test_cases.map((testCase: {
      id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      type: string;
      steps: any;
      expected_result: string | null;
      preconditions: string | null;
      tags: string | null;
    }) => ({
      ...testCase,
      steps: testCase.steps as any,
      tags: testCase.tags ? JSON.parse(testCase.tags as string) : [],
    }));

    // Calculate execution summary
    const totalTests = processedTestCases.length;
    const passed = processedTestCases.filter((tc: { status: string }) => tc.status === "PASSED").length;
    const failed = processedTestCases.filter((tc: { status: string }) => tc.status === "FAILED").length;
    const blocked = processedTestCases.filter((tc: { status: string }) => tc.status === "BLOCKED").length;
    const skipped = processedTestCases.filter((tc: { status: string }) => tc.status === "NOT_EXECUTED").length;
    const inProgress = processedTestCases.filter((tc: { status: string }) => tc.status === "IN_PROGRESS").length;
    const executionRate = totalTests > 0 ? 
      ((passed + failed + blocked) / totalTests) * 100 : 0;

    const processedTestPlan = {
      ...testPlan,
      test_cases: processedTestCases,
      executionSummary: {
        totalTests,
        passed,
        failed,
        blocked,
        skipped,
        inProgress,
        executionRate,
      },
    };

    return NextResponse.json(processedTestPlan);
  } catch (error) {
    console.error("Error fetching test plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch test plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data = await req.json();

    // Check if test plan exists
    const existingTestPlan = await prisma.test_plans.findUnique({
      where: { id },
    });

    if (!existingTestPlan) {
      return NextResponse.json(
        { error: "Test plan not found" },
        { status: 404 }
      );
    }

    // Update the test plan
    const updatedTestPlan = await prisma.test_plans.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existingTestPlan.title,
        description: data.description !== undefined ? data.description : existingTestPlan.description,
        project_id: data.projectId !== undefined ? data.projectId : existingTestPlan.project_id,
        objectives: data.objectives !== undefined ? data.objectives : existingTestPlan.objectives,
        scope: data.scope !== undefined ? data.scope : existingTestPlan.scope,
        test_strategy: data.test_strategy !== undefined ? data.test_strategy : existingTestPlan.test_strategy,
        environment: data.environment !== undefined ? data.environment : existingTestPlan.environment,
        acceptance_criteria: data.acceptance_criteria !== undefined ? data.acceptance_criteria : existingTestPlan.acceptance_criteria,
        risk_management: data.risk_management !== undefined ? data.risk_management : existingTestPlan.risk_management,
        resources: data.resources !== undefined ? data.resources : existingTestPlan.resources,
        schedule: data.schedule !== undefined ? data.schedule : existingTestPlan.schedule,
        deliverables: data.deliverables !== undefined ? data.deliverables : existingTestPlan.deliverables,
        created_by: data.createdBy !== undefined ? data.createdBy : existingTestPlan.created_by,
        created_at: data.createdAt ? new Date(data.createdAt) : existingTestPlan.created_at,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        projects: {
          select: { id: true, name: true },
        },
      },
    });

    // Handle test case associations if provided
    if (data.testCaseIds && Array.isArray(data.testCaseIds)) {
      // First, remove the test plan ID from all test cases currently associated with this plan
      await prisma.test_cases.updateMany({
        where: { test_plan_id: id },
        data: { test_plan_id: null },
      });

      // Then, associate the new test cases with the test plan
      if (data.testCaseIds.length > 0) {
        await Promise.all(
          data.testCaseIds.map((testCaseId: string) =>
            prisma.test_cases.update({
              where: { id: testCaseId },
              data: { test_plan_id: id },
            })
          )
        );
      }
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
          },
        },
      },
    });

    // Process test cases to handle JSON fields
    const processedTestCases = testPlanWithTestCases?.test_cases.map((testCase: {
      id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      type: string;
      steps: any;
      expected_result: string | null;
      preconditions: string | null;
      tags: string | null;
    }) => ({
      ...testCase,
      steps: testCase.steps as any,
      tags: testCase.tags ? JSON.parse(testCase.tags as string) : [],
    })) || [];

    // Calculate execution summary
    const totalTests = processedTestCases.length;
    const passed = processedTestCases.filter((tc: { status: string }) => tc.status === "PASSED").length;
    const failed = processedTestCases.filter((tc: { status: string }) => tc.status === "FAILED").length;
    const blocked = processedTestCases.filter((tc: { status: string }) => tc.status === "BLOCKED").length;
    const skipped = processedTestCases.filter((tc: { status: string }) => tc.status === "NOT_EXECUTED").length;
    const inProgress = processedTestCases.filter((tc: { status: string }) => tc.status === "IN_PROGRESS").length;
    const executionRate = totalTests > 0 ? 
      ((passed + failed + blocked) / totalTests) * 100 : 0;

    const processedTestPlan = {
      ...testPlanWithTestCases,
      test_cases: processedTestCases,
      executionSummary: {
        totalTests,
        passed,
        failed,
        blocked,
        skipped,
        inProgress,
        executionRate,
      },
    };

    return NextResponse.json(processedTestPlan);
  } catch (error) {
    console.error("Error updating test plan:", error);
    return NextResponse.json(
      { error: "Failed to update test plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const existingTestPlan = await prisma.test_plans.findUnique({
      where: { id },
    });

    if (!existingTestPlan) {
      return NextResponse.json(
        { error: "Test plan not found" },
        { status: 404 }
      );
    }

    // Update all associated test cases to remove the test plan ID
    await prisma.test_cases.updateMany({
      where: { test_plan_id: id },
      data: { test_plan_id: null },
    });

    // Delete the test plan
    await prisma.test_plans.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Test plan deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting test plan:", error);
    return NextResponse.json(
      { error: "Failed to delete test plan" },
      { status: 500 }
    );
  }
}