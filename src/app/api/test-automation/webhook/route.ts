import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// Define interfaces for type safety
interface WebhookPayload {
  testSuiteId: string;
  testCaseName: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  duration?: number;
  errorMessage?: string;
  stackTrace?: string;
  screenshots?: string[];
  buildId: string; // Required
  pipelineUrl: string; // Required
  branch: string; // Required
  commitHash: string; // Required
}

// Define a simplified interface for test execution results
interface TestExecutionResult {
  id: string;
  test_case_id: string;
  status: string;
  notes: string | null;
  created_bug_id: string | null;
  executed_by: string;
  execution_date: Date;
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token for security
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;

    if (
      !authHeader ||
      !expectedToken ||
      authHeader !== `Bearer ${expectedToken}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: WebhookPayload = await req.json();

    // Validate required fields (including schema required fields)
    if (
      !payload.testSuiteId ||
      !payload.testCaseName ||
      !payload.status ||
      !payload.buildId ||
      !payload.pipelineUrl ||
      !payload.branch ||
      !payload.commitHash
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: testSuiteId, testCaseName, status, buildId, pipelineUrl, branch, commitHash",
        },
        { status: 400 }
      );
    }

    // Find a test case by name or create a bug directly
    // Since the test_executions model has changed, we need to find the test case first
    // to get its ID, or create a bug directly if we can't find a matching test case
    
    // Find a system user for the execution
    const systemUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: "system@qa-dashboard.com" },
          { role: { contains: "Admin" } },
        ],
      },
    });
    
    if (!systemUser) {
      return NextResponse.json(
        { error: "No system user found for recording test execution" },
        { status: 500 }
      );
    }
    
    // Store execution details in notes for bug creation
    const executionNotes = `Test Suite: ${payload.testSuiteId}\nBuild: ${payload.buildId}\nBranch: ${payload.branch}\nCommit: ${payload.commitHash}\nDuration: ${payload.duration ?? 'N/A'}\n\nError: ${payload.errorMessage ?? 'None'}\n\nStack Trace: ${payload.stackTrace ?? 'None'}`;
    
    // We'll create a bug directly without creating a test execution record
    // since we don't have a direct mapping from testCaseName to test_case_id

    let createdBugId: string | null = null;

    // Auto-create bug for failed tests
    if (payload.status === "FAILED") {
      const bug = await createBugFromFailedTest(payload, executionNotes, systemUser.id);
      if (bug) {
        createdBugId = bug.id;
      }
    }

    // Check for flaky tests
    await updateFlakyTestScore(payload.testCaseName);

    // Update analytics
    await updateTestAnalytics(payload);

    return NextResponse.json({
      success: true,
      createdBugId: createdBugId,
    });
  } catch (error) {
    console.error("Error processing test webhook:", error);
    return NextResponse.json(
      { error: "Failed to process test results" },
      { status: 500 }
    );
  }
}

async function createBugFromFailedTest(
  payload: WebhookPayload,
  executionNotes: string,
  systemUserId: string
) {
  try {
    // Check if a bug already exists for this test case in the last 24 hours
    const existingBug = await prisma.bug_reports.findFirst({
      where: {
        automation_test_id: payload.testCaseName,
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
    });

    if (existingBug) {
      // Update existing bug with new execution info
      await prisma.bug_reports.update({
        where: { id: existingBug.id },
        data: {
          ci_pipeline_url: payload.pipelineUrl ?? null,
          build_number: payload.buildId ?? null,
          regression_count: { increment: 1 },
          is_regression: true,
        },
      });

      return existingBug;
    }

    // We already have the system user ID from the parameter

    // Create new bug from failed test
    const bug = await prisma.bug_reports.create({
      data: {
        title: `Automated Test Failure: ${payload.testCaseName}`,
        description: `Automated test failed in CI/CD pipeline.\n\n${executionNotes}\n\n**Error Message:**\n${
          payload.errorMessage ?? "No error message provided"
        }\n\n**Stack Trace:**\n${
          payload.stackTrace ?? "No stack trace available"
        }`,
        severity: "HIGH",
        priority: "HIGH",
        status: "OPEN",
        environment: "CI/CD",
        tags: JSON.stringify(["automated-test", "ci-cd", payload.branch]),
        labels: JSON.stringify(["automation", "test-failure"]),
        reporter_id: systemUserId,
        automation_test_id: payload.testCaseName,
        ci_pipeline_url: payload.pipelineUrl,
        build_number: payload.buildId,
      },
    });

    // Create activity log
    await prisma.bug_activities.create({
      data: {
        bug_id: bug.id,
        user_id: systemUserId,
        action: "created",
        description: `Auto-created from failed test: ${payload.testCaseName}`,
      },
    });

    // Auto-assign to QA team removed

    return bug;
  } catch (error) {
    console.error("Error creating bug from failed test:", error);
    return null;
  }
}

async function updateFlakyTestScore(testCaseName: string) {
  // Flaky test detection removed
  return;
}

// Flaky test alert function removed

async function updateTestAnalytics(payload: WebhookPayload) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update or create daily analytics
    await prisma.bug_analytics.upsert({
      where: { date: today },
      update: {},
      create: {
        date: today,
        total_bugs: 0,
        new_bugs: 0,
        resolved_bugs: 0,
        critical_bugs: 0,
      },
    });

    // If test failed and bug was created, increment new_bugs
    if (payload.status === "FAILED") {
      await prisma.bug_analytics.update({
        where: { date: today },
        data: { new_bugs: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error("Error updating test analytics:", error);
  }
}

