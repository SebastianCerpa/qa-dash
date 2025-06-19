"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TestTypeChart from "@/components/dashboard/TestTypeChart";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import { useStore } from "@/store/useStore";
import { formatDistanceToNow } from "date-fns";

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
      icon:
        task.status === "Done"
          ? "✅"
          : task.status === "In Progress"
          ? "🔄"
          : "📝",
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
      <div className="space-y-5">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          <StatCard
            title="Total Tests"
            value={stats.totalTests}
            change={stats.testsChange}
            icon={<span className="text-2xl">📊</span>}
            color="blue"
          />
          <StatCard
            title="Passed Tests"
            value={stats.passedTests}
            change={stats.passedChange}
            icon={<span className="text-2xl">✅</span>}
            color="green"
          />
          <StatCard
            title="Failed Tests"
            value={stats.failedTests}
            change={stats.failedChange}
            icon={<span className="text-2xl">❌</span>}
            color="red"
          />
          <StatCard
            title="Test Coverage"
            value={`${stats.coverage}%`}
            change={stats.coverageChange}
            icon={<span className="text-2xl">🎯</span>}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Test Types Distribution
            </h3>
            <TestTypeChart />
          </Card>
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Task Status Overview
            </h3>
            <TaskStatusChart />
          </Card>
        </div>

        {/* Recent Activity & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                >
                  <div className="text-lg">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Upcoming Tasks
            </h3>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Due:{" "}
                      {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100/80 text-blue-800 rounded-full font-medium">
                        {task.testType}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
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
