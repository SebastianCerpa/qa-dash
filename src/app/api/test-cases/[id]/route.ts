/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { TestCasePriority, TestCaseType, TestCaseStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

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

export async function GET(req: NextRequest) {
  try {
    // Extract the ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Get the ID from the path
    
    // Validate that the ID is valid
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "Invalid test case ID" },
        { status: 400 }
      );
    }
    
    const testCase = await prisma.test_cases.findUnique({
      where: { id },
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

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    // Process the test case to handle JSON fields
    try {
      const processedTestCase = {
        ...testCase,
        steps: (() => {
          if (!testCase.steps) return [];
          if (typeof testCase.steps === 'string') {
            try {
              const parsed = JSON.parse(testCase.steps);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return Array.isArray(testCase.steps) ? testCase.steps : [];
        })(),
        tags: testCase.tags ? (typeof testCase.tags === 'string' ? JSON.parse(testCase.tags) : []) : [],
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
    console.error("Error fetching test case:", error);
    return NextResponse.json(
      { error: "Error fetching test case" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Extract the ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Get the ID from the path
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Check if test case exists
    const existingTestCase = await prisma.test_cases.findUnique({
      where: { id },
    });

    if (!existingTestCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    // Convert form values to enum values
    const convertedPriority = data.priority ? convertToEnumValue(data.priority, 'priority') as TestCasePriority : existingTestCase.priority;
    const convertedType = data.type ? convertToEnumValue(data.type, 'type') as TestCaseType : existingTestCase.type;
    const convertedStatus = data.status ? convertToEnumValue(data.status, 'status') as TestCaseStatus : existingTestCase.status;

    console.log('Updating test case with converted values:', {
      priority: `${data.priority} -> ${convertedPriority}`,
      type: `${data.type} -> ${convertedType}`,
      status: `${data.status} -> ${convertedStatus}`
    });

    // Ensure steps is a valid JSON string
    const steps = data.steps !== undefined
      ? (Array.isArray(data.steps) ? JSON.stringify(data.steps) : data.steps)
      : existingTestCase.steps;
    
    // Ensure tags is a valid JSON string
    const tags = data.tags !== undefined
      ? (Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags)
      : existingTestCase.tags;

    const updatedTestCase = await prisma.test_cases.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existingTestCase.title,
        description: data.description !== undefined ? data.description : existingTestCase.description,
        priority: convertedPriority,
        type: convertedType,
        preconditions: data.preconditions !== undefined ? data.preconditions : existingTestCase.preconditions,
        steps: steps,
        expected_result: data.expectedResult !== undefined ? data.expectedResult : existingTestCase.expected_result,
        status: convertedStatus,
        ticket_id: data.ticketId !== undefined ? data.ticketId : existingTestCase.ticket_id,
        tags: tags,
        test_plan_id: data.testPlanId !== undefined ? data.testPlanId : existingTestCase.test_plan_id,
        updated_at: new Date(),
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

    // Process the test case to handle JSON fields
    const processedTestCase = {
      ...updatedTestCase,
      steps: (() => {
        if (!updatedTestCase.steps) return [];
        if (typeof updatedTestCase.steps === 'string') {
          try {
            const parsed = JSON.parse(updatedTestCase.steps);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return Array.isArray(updatedTestCase.steps) ? updatedTestCase.steps : [];
      })(),
      tags: updatedTestCase.tags ? JSON.parse(updatedTestCase.tags as string) : [],
    };

    return NextResponse.json(processedTestCase);
  } catch (error) {
    console.error("Error updating test case:", error);
    return NextResponse.json(
      { error: "Failed to update test case" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Extract the ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Get the ID from the path
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if test case exists
    const existingTestCase = await prisma.test_cases.findUnique({
      where: { id },
    });

    if (!existingTestCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    // Delete the test case
    await prisma.test_cases.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Test case deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting test case:", error);
    return NextResponse.json(
      { error: "Failed to delete test case" },
      { status: 500 }
    );
  }
}