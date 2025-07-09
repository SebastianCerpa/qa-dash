import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { Prisma, TestCasePriority, TestCaseType, TestCaseStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const priority = searchParams.get("priority") as TestCasePriority | null;
    const type = searchParams.get("type") as TestCaseType | null;
    const status = searchParams.get("status") as TestCaseStatus | null;
    const testPlanId = searchParams.get("testPlanId") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {};

    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (status) where.status = status;
    if (testPlanId) where.test_plan_id = testPlanId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [testCases, total] = await Promise.all([
      prisma.test_cases.findMany({
        where,
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
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.test_cases.count({ where }),
    ]);

    // Process test cases to handle JSON fields
    const processedTestCases = testCases.map(testCase => ({
      ...testCase,
      steps: Array.isArray(testCase.steps) ? testCase.steps : [],
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
    console.error("Error fetching test cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch test cases" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Reuse existing implementation in route.ts
  const response = await fetch(`${req.nextUrl.origin}/api/test-cases`, {
    method: 'POST',
    headers: req.headers,
    body: req.body
  });
  
  return response;
}