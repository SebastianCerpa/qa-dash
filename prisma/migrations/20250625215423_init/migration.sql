-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'BLOCKER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'TESTING', 'RESOLVED', 'CLOSED', 'REOPENED', 'DUPLICATE', 'WONT_FIX');

-- CreateEnum
CREATE TYPE "TestExecutionStatus" AS ENUM ('PASSED', 'FAILED', 'SKIPPED', 'FLAKY');

-- CreateEnum
CREATE TYPE "TestCasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TestCaseType" AS ENUM ('FUNCTIONAL', 'INTEGRATION', 'PERFORMANCE', 'SECURITY', 'USABILITY', 'REGRESSION');

-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('NOT_EXECUTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "uploaded_by" TEXT,
    "project_id" TEXT,
    "uploaded_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT,
    "author_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT DEFAULT 'to-do',
    "priority" TEXT,
    "assignee_id" TEXT,
    "project_id" TEXT,
    "cycle_id" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "test_plan_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TestCasePriority" NOT NULL DEFAULT 'MEDIUM',
    "type" "TestCaseType" NOT NULL DEFAULT 'FUNCTIONAL',
    "preconditions" TEXT,
    "steps" JSONB NOT NULL,
    "expected_result" TEXT,
    "status" "TestCaseStatus" NOT NULL DEFAULT 'NOT_EXECUTED',
    "ticket_id" TEXT,
    "tags" TEXT,
    "last_executed" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cycles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "project_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_teams" (
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "user_teams_pkey" PRIMARY KEY ("user_id","team_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT DEFAULT 'active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "BugStatus" NOT NULL DEFAULT 'OPEN',
    "environment" TEXT,
    "steps_to_reproduce" TEXT,
    "expected_behavior" TEXT,
    "actual_behavior" TEXT,
    "browser_info" TEXT,
    "os_info" TEXT,
    "device_info" TEXT,
    "is_regression" BOOLEAN NOT NULL DEFAULT false,
    "original_bug_id" TEXT,
    "regression_count" INTEGER NOT NULL DEFAULT 0,
    "test_case_link" TEXT,
    "automation_test_id" TEXT,
    "ci_pipeline_url" TEXT,
    "build_number" TEXT,
    "reporter_id" TEXT NOT NULL,
    "assignee_id" TEXT,
    "project_id" TEXT,
    "tags" TEXT,
    "labels" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_attachments" (
    "id" TEXT NOT NULL,
    "bug_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" TEXT NOT NULL,

    CONSTRAINT "bug_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_screenshots" (
    "id" TEXT NOT NULL,
    "bug_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "annotations" JSONB,
    "description" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bug_screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_comments" (
    "id" TEXT NOT NULL,
    "bug_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_activities" (
    "id" TEXT NOT NULL,
    "bug_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bug_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_executions" (
    "id" TEXT NOT NULL,
    "test_suite_id" TEXT NOT NULL,
    "test_case_name" TEXT NOT NULL,
    "status" "TestExecutionStatus" NOT NULL,
    "duration" INTEGER NOT NULL,
    "error_message" TEXT,
    "stack_trace" TEXT,
    "screenshots" TEXT,
    "build_id" TEXT NOT NULL,
    "pipeline_url" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commit_hash" TEXT NOT NULL,
    "is_flaky" BOOLEAN NOT NULL DEFAULT false,
    "flaky_score" DOUBLE PRECISION,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_bug_id" TEXT,

    CONSTRAINT "test_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_bugs" INTEGER NOT NULL DEFAULT 0,
    "new_bugs" INTEGER NOT NULL DEFAULT 0,
    "resolved_bugs" INTEGER NOT NULL DEFAULT 0,
    "critical_bugs" INTEGER NOT NULL DEFAULT 0,
    "avg_resolution_time" DOUBLE PRECISION,
    "resolution_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bug_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bug_analytics_date_key" ON "bug_analytics"("date");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "test_cycles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_test_plan_id_fkey" FOREIGN KEY ("test_plan_id") REFERENCES "test_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "test_cycles" ADD CONSTRAINT "test_cycles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_teams" ADD CONSTRAINT "user_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_teams" ADD CONSTRAINT "user_teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_attachments" ADD CONSTRAINT "bug_attachments_bug_id_fkey" FOREIGN KEY ("bug_id") REFERENCES "bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_screenshots" ADD CONSTRAINT "bug_screenshots_bug_id_fkey" FOREIGN KEY ("bug_id") REFERENCES "bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_bug_id_fkey" FOREIGN KEY ("bug_id") REFERENCES "bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_comments" ADD CONSTRAINT "bug_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_activities" ADD CONSTRAINT "bug_activities_bug_id_fkey" FOREIGN KEY ("bug_id") REFERENCES "bug_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_activities" ADD CONSTRAINT "bug_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_executions" ADD CONSTRAINT "test_executions_created_bug_id_fkey" FOREIGN KEY ("created_bug_id") REFERENCES "bug_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
