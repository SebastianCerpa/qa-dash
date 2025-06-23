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

interface TestExecution {
  id: string;
  test_suite_id: string;
  test_case_name: string;
  status: "PASSED" | "FAILED" | "SKIPPED" | "FLAKY";
  duration: number; // Required field in schema
  error_message: string | null;
  stack_trace: string | null;
  screenshots: string | null; // JSON string in schema
  build_id: string; // Required field in schema
  pipeline_url: string; // Required field in schema
  branch: string; // Required field in schema
  commit_hash: string; // Required field in schema
  created_bug_id: string | null;
  executed_at: Date;
  is_flaky: boolean;
  flaky_score: number | null;
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

    // Process test execution results
    const testExecution = await prisma.test_executions.create({
      data: {
        test_suite_id: payload.testSuiteId,
        test_case_name: payload.testCaseName,
        status: payload.status,
        duration: payload.duration ?? 0, // Default to 0 if not provided
        error_message: payload.errorMessage ?? null,
        stack_trace: payload.stackTrace ?? null,
        screenshots: payload.screenshots
          ? JSON.stringify(payload.screenshots)
          : null,
        build_id: payload.buildId,
        pipeline_url: payload.pipelineUrl,
        branch: payload.branch,
        commit_hash: payload.commitHash,
      },
    });

    let createdBugId: string | null = null;

    // Auto-create bug for failed tests
    if (payload.status === "FAILED") {
      const bug = await createBugFromFailedTest(testExecution, payload);

      if (bug) {
        // Update test execution with created bug
        await prisma.test_executions.update({
          where: { id: testExecution.id },
          data: { created_bug_id: bug.id },
        });
        createdBugId = bug.id;
      }
    }

    // Check for flaky tests
    await updateFlakyTestScore(payload.testCaseName);

    // Update analytics
    await updateTestAnalytics(payload);

    return NextResponse.json({
      success: true,
      testExecutionId: testExecution.id,
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
  testExecution: TestExecution,
  payload: WebhookPayload
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

    // Find a default reporter (system user or first admin)
    const systemUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: "system@qa-dashboard.com" },
          { role: { contains: "Admin" } },
        ],
      },
    });

    if (!systemUser) {
      console.error("No system user found for auto-bug creation");
      return null;
    }

    // Create new bug from failed test
    const bug = await prisma.bug_reports.create({
      data: {
        title: `Automated Test Failure: ${payload.testCaseName}`,
        description: `Automated test failed in CI/CD pipeline.\n\n**Test Suite:** ${
          payload.testSuiteId
        }\n**Branch:** ${payload.branch}\n**Commit:** ${
          payload.commitHash
        }\n\n**Error Message:**\n${
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
        reporter_id: systemUser.id,
        automation_test_id: payload.testCaseName,
        ci_pipeline_url: payload.pipelineUrl,
        build_number: payload.buildId,
      },
    });

    // Create activity log
    await prisma.bug_activities.create({
      data: {
        bug_id: bug.id,
        user_id: systemUser.id,
        action: "created",
        description: `Auto-created from failed test: ${payload.testCaseName}`,
      },
    });

    // Auto-assign to QA team
    const qaEngineer = await prisma.users.findFirst({
      where: {
        role: { contains: "QA" },
        status: "active",
      },
    });

    if (qaEngineer) {
      await prisma.bug_reports.update({
        where: { id: bug.id },
        data: { assignee_id: qaEngineer.id },
      });

      // Send notification
      await prisma.notifications.create({
        data: {
          user_id: qaEngineer.id,
          message: `Auto-assigned bug from failed test: ${payload.testCaseName}`,
          is_read: false,
        },
      });
    }

    return bug;
  } catch (error) {
    console.error("Error creating bug from failed test:", error);
    return null;
  }
}

async function updateFlakyTestScore(testCaseName: string) {
  try {
    const recentExecutions = await prisma.test_executions.findMany({
      where: {
        test_case_name: testCaseName,
        executed_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { executed_at: "desc" },
      take: 50,
    });

    if (recentExecutions.length < 10) return; // Need minimum executions

    const failureRate =
      recentExecutions.filter((e) => e.status === "FAILED").length /
      recentExecutions.length;
    const isFlaky = failureRate > 0.1 && failureRate < 0.9; // 10-90% failure rate

    if (isFlaky) {
      await prisma.test_executions.updateMany({
        where: { test_case_name: testCaseName },
        data: {
          is_flaky: true,
          flaky_score: failureRate,
        },
      });

      // Send flaky test alert
      await sendFlakyTestAlert(testCaseName, failureRate);
    }
  } catch (error) {
    console.error("Error updating flaky test score:", error);
  }
}

async function sendFlakyTestAlert(testCaseName: string, failureRate: number) {
  try {
    const qaLeads = await prisma.users.findMany({
      where: {
        role: { in: ["QA Lead", "QA Manager"] },
        status: "active",
      },
    });

    for (const lead of qaLeads) {
      await prisma.notifications.create({
        data: {
          user_id: lead.id,
          message: `⚠️ Flaky Test Detected: ${testCaseName} (${Math.round(
            failureRate * 100
          )}% failure rate)`,
          is_read: false,
        },
      });
    }
  } catch (error) {
    console.error("Error sending flaky test alert:", error);
  }
}

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
