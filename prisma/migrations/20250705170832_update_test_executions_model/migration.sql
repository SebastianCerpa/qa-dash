/*
  Warnings:

  - You are about to drop the column `branch` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `build_id` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `commit_hash` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `error_message` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `executed_at` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `flaky_score` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `is_flaky` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `pipeline_url` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `screenshots` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `stack_trace` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `test_case_name` on the `test_executions` table. All the data in the column will be lost.
  - You are about to drop the column `test_suite_id` on the `test_executions` table. All the data in the column will be lost.
  - Added the required column `executed_by` to the `test_executions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `test_case_id` to the `test_executions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `test_executions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "test_executions" DROP COLUMN "branch",
DROP COLUMN "build_id",
DROP COLUMN "commit_hash",
DROP COLUMN "duration",
DROP COLUMN "error_message",
DROP COLUMN "executed_at",
DROP COLUMN "flaky_score",
DROP COLUMN "is_flaky",
DROP COLUMN "pipeline_url",
DROP COLUMN "screenshots",
DROP COLUMN "stack_trace",
DROP COLUMN "test_case_name",
DROP COLUMN "test_suite_id",
ADD COLUMN     "executed_by" TEXT NOT NULL,
ADD COLUMN     "execution_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "test_case_id" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;
