"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TestTypeChart from "@/components/dashboard/TestTypeChart";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import { useStore } from "@/store/useStore";
import { formatDistanceToNow } from "date-fns";
import { ChartBarIcon, CheckCircleIcon, XCircleIcon, ArchiveBoxIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tasks } = useStore();

  // Calculate stats from existing data
  const stats = {
    totalTests: tasks.length,
    passedTests: tasks.filter((task) => task.status === "Done").length,
    failedTests: tasks.filter((task) => task.status === "Todo").length,
    coverage:
      tasks.length > 0
        ? Math.round(
            (tasks.filter((task) => task.status === "Done").length /
              tasks.length) *
              100
          )
        : 0,
    testsChange: { value: 12, type: "increase" as const },
    passedChange: { value: 8, type: "increase" as const },
    failedChange: { value: 3, type: "decrease" as const },
    coverageChange: { value: 5, type: "increase" as const },
  };

  // Generate recent activity from tasks
  const recentActivity = tasks
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      action: `Task "${task.title}" updated`,
      timestamp: new Date(task.updatedAt),
      status: task.status,
    }));

  // Generate upcoming tasks
  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) > new Date() &&
        task.status !== "Done"
    )
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: new Date(task.dueDate!),
      testType: task.testType,
      priority: task.priority,
    }));

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            title="Total Tests"
            value={stats.totalTests}
            change={stats.testsChange}
            icon={<ChartBarIcon className="w-5 h-5" />}
            color="blue"
            variant="minimal"
          />
          <StatCard
            title="Passed Tests"
            value={stats.passedTests}
            change={stats.passedChange}
            icon={<CheckCircleIcon className="w-5 h-5" />}
            color="green"
            variant="minimal"
          />
          <StatCard
            title="Failed Tests"
            value={stats.failedTests}
            change={stats.failedChange}
            icon={<XCircleIcon className="w-5 h-5" />}
            color="red"
            variant="minimal"
          />
          <StatCard
            title="Test Coverage"
            value={`${stats.coverage}%`}
            change={stats.coverageChange}
            icon={<ArchiveBoxIcon className="w-5 h-5" />}
            color="purple"
            variant="minimal"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
            <h3 className="text-base font-semibold mb-3 text-slate-800 text-title">
              Test Types Distribution
            </h3>
            <div className="h-52">
              <TestTypeChart />
            </div>
          </Card>
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
            <h3 className="text-base font-semibold mb-3 text-slate-800 text-title">
              Task Status Overview
            </h3>
            <div className="h-52">
              <TaskStatusChart />
            </div>
          </Card>
        </div>

        {/* Recent Activity & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
            <h3 className="text-base font-semibold mb-3 text-slate-800 text-title">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-2.5 bg-slate-50/60 rounded-lg hover:bg-slate-100/60 transition-all duration-150"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/90 shadow-sm">
                    {activity.status === "Done" ? (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    ) : activity.status === "In Progress" ? (
                      <ArrowPathIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 text-body">
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 text-caption">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
            <h3 className="text-base font-semibold mb-3 text-slate-800 text-title">
              Upcoming Tasks
            </h3>
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-lg hover:bg-slate-100/60 transition-all duration-150"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 text-body">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 text-caption mt-1">
                      Due:{" "}
                      {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-blue-100/70 text-blue-700 rounded-full font-medium text-caption">
                        {task.testType}
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full font-medium ${
                          task.priority === "High"
                            ? "bg-red-100/80 text-red-800"
                            : task.priority === "Medium"
                            ? "bg-yellow-100/80 text-yellow-800"
                            : "bg-green-100/80 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
