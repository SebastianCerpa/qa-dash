/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {};

    // status does not exist in test_plans model, this condition is omitted
    if (projectId) where.project_id = projectId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [testPlans, total] = await Promise.all([
      prisma.test_plans.findMany({
        where,
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
              status: true,
              priority: true,
              type: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.test_plans.count({ where }),
    ]);

    // Process test plans to include execution summary
    const processedTestPlans = testPlans.map(testPlan => {
      const testCases = testPlan.test_cases || [];
      const totalTests = testCases.length;
      const passed = testCases.filter(tc => tc.status === "PASSED").length;
      const failed = testCases.filter(tc => tc.status === "FAILED").length;
      const blocked = testCases.filter(tc => tc.status === "BLOCKED").length;
      const skipped = testCases.filter(tc => tc.status === "SKIPPED").length;
      const executionRate = totalTests > 0 ?
        ((passed + failed + blocked + skipped) / totalTests) * 100 : 0;

      return {
        ...testPlan,
        executionSummary: {
          totalTests,
          passed,
          failed,
          blocked,
          skipped,
          executionRate,
        },
      };
    });

    return NextResponse.json({
      testPlans: processedTestPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching test plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch test plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/test-plans - Starting request');
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);

    if (!session?.user?.email) {
      console.log('No session or email found, returning 401');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('User authenticated:', session.user.email);

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found in database:', session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('User found in database:', user.id);
    const data = await req.json();
    console.log('Request body data:', JSON.stringify(data, null, 2));
    console.log('Data.title value:', data.title);
    console.log('Data.title type:', typeof data.title);

    // Validate required fields
    if (!data.title) {
      console.log('Title is missing from request data');
      console.log('All data keys:', Object.keys(data));
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    console.log('Creating test plan with data:', data);

    const testPlan = await prisma.test_plans.create({
      data: {
        title: data.title,
        description: data.description,
        project_id: data.project_id,
        objectives: data.objectives,
        scope: data.scope,
        test_strategy: data.test_strategy,
        environment: data.environment,
        acceptance_criteria: data.acceptance_criteria,
        risk_management: data.risk_management,
        resources: data.resources,
        schedule: data.schedule,
        deliverables: data.deliverables,
        created_by: user.id,
        created_at: new Date(),
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

    console.log('Test plan created successfully:', testPlan.id);

    // If test case IDs are provided, associate them with the test plan
    if (data.testCaseIds && Array.isArray(data.testCaseIds) && data.testCaseIds.length > 0) {
      await Promise.all(
        data.testCaseIds.map((testCaseId: string) =>
          prisma.test_cases.update({
            where: { id: testCaseId },
            data: { test_plan_id: testPlan.id },
          })
        )
      );
    }

    // Fetch the test plan with associated test cases
    const testPlanWithTestCases = await prisma.test_plans.findUnique({
      where: { id: testPlan.id },
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
            status: true,
            priority: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(testPlanWithTestCases, { status: 201 });
  } catch (error) {
    console.error("Error creating test plan:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Error message:", error instanceof Error ? error.message : String(error));

    // Check if it's a Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
      console.error("Prisma error meta:", error.meta);
    }

    return NextResponse.json(
      {
        error: "Failed to create test plan",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
