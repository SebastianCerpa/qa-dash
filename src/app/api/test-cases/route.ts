import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { Prisma, TestCasePriority, TestCaseType, TestCaseStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

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
      steps: testCase.steps ? JSON.parse(testCase.steps as string) : [],
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

// Helper function to convert form values to enum values
const convertToEnumValue = (value: string, enumType: 'priority' | 'type' | 'status'): string => {
  if (!value) return value;
  
  const upperValue = value.toUpperCase();
  
  // Map form values to enum values
  const mappings: Record<string, Record<string, string>> = {
    priority: {
      'LOW': 'LOW',
      'MEDIUM': 'MEDIUM', 
      'HIGH': 'HIGH',
      'CRITICAL': 'CRITICAL'
    },
    type: {
      'MANUAL': 'FUNCTIONAL',
      'AUTOMATED': 'INTEGRATION',
      'EXPLORATORY': 'USABILITY',
      'REGRESSION': 'REGRESSION',
      'FUNCTIONAL': 'FUNCTIONAL',
      'INTEGRATION': 'INTEGRATION',
      'PERFORMANCE': 'PERFORMANCE',
      'SECURITY': 'SECURITY',
      'USABILITY': 'USABILITY'
    },
    status: {
      'NOT EXECUTED': 'NOT_EXECUTED',
      'NOT_EXECUTED': 'NOT_EXECUTED',
      'PASSED': 'PASSED',
      'FAILED': 'FAILED',
      'BLOCKED': 'BLOCKED',
      'SKIPPED': 'SKIPPED',
      'IN PROGRESS': 'IN_PROGRESS',
      'IN_PROGRESS': 'IN_PROGRESS'
    }
  };
  
  return mappings[enumType][upperValue] || upperValue;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to create test cases" },
        { status: 401 }
      );
    }

    // Get user from database using email (like in test-plans route)
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found in database:', session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('User found in database:', user.id);
    const body = await req.json();
    console.log('Received test case data:', body);
    const { title, description, priority, type, status, steps, expected_result, preconditions, tags, test_plan_id, ticket_id } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    console.log('Original values before conversion:', {
      priority,
      type,
      status
    });

    // Convert form values to enum values
    const convertedPriority = convertToEnumValue(priority, 'priority') as TestCasePriority;
    const convertedType = convertToEnumValue(type, 'type') as TestCaseType;
    const convertedStatus = convertToEnumValue(status || 'NOT_EXECUTED', 'status') as TestCaseStatus;

    console.log('Creating test case with converted values:', {
      priority: `${priority} -> ${convertedPriority}`,
      type: `${type} -> ${convertedType}`,
      status: `${status} -> ${convertedStatus}`
    });

    // Validate converted values
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const validTypes = ['FUNCTIONAL', 'INTEGRATION', 'PERFORMANCE', 'SECURITY', 'USABILITY', 'REGRESSION'];
    const validStatuses = ['NOT_EXECUTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'IN_PROGRESS'];

    if (!validPriorities.includes(convertedPriority)) {
      console.error('Invalid priority after conversion:', convertedPriority);
      return NextResponse.json(
        { error: `Invalid priority: ${convertedPriority}. Valid values: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validTypes.includes(convertedType)) {
      console.error('Invalid type after conversion:', convertedType);
      return NextResponse.json(
        { error: `Invalid type: ${convertedType}. Valid values: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(convertedStatus)) {
      console.error('Invalid status after conversion:', convertedStatus);
      return NextResponse.json(
        { error: `Invalid status: ${convertedStatus}. Valid values: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const testCase = await prisma.test_cases.create({
      data: {
        title,
        description,
        priority: convertedPriority,
        type: convertedType,
        status: convertedStatus,
        steps: Array.isArray(steps) ? JSON.stringify(steps) : steps,
        expected_result,
        preconditions,
        tags: tags ? JSON.stringify(tags) : null,
        test_plan_id,
        ticket_id,
        created_by: user.id,
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

    // Process test case to handle JSON fields
    const processedTestCase = {
      ...testCase,
      steps: testCase.steps ? JSON.parse(testCase.steps as string) : [],
      tags: testCase.tags ? JSON.parse(testCase.tags as string) : [],
    };

    return NextResponse.json(processedTestCase);
  } catch (error) {
    console.error("Error creating test case:", error);
    return NextResponse.json(
      { error: "Failed to create test case" },
      { status: 500 }
    );
  }
}
