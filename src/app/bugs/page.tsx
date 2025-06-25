"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "../../components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Plus,
  Search,
  Download,
  AlertTriangle,
  Bug,
  User,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import BugReportForm, { BugReportData } from "@/components/BugReportForm";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "BLOCKER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
  project_id: string;
  reporter_id: string;
  assignee_id?: string;
  environment?: string;
  browser?: string;
  os?: string;
  labels: string[];
  is_regression: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  project: { id: string; name: string };
  reporter: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string };
  _count: {
    bug_comments: number;
    bug_attachments: number;
    bug_screenshots: number;
  };
}

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TestCase {
  id: string;
  name: string;
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [showRegressionOnly, setShowRegressionOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBugs, setTotalBugs] = useState(0);
  const itemsPerPage = 20;

  // Declarar fetchBugs antes de useEffect
  const fetchBugs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProject !== "all" && { project_id: selectedProject }),
        ...(selectedSeverity !== "all" && { severity: selectedSeverity }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(selectedAssignee !== "all" && { assignee_id: selectedAssignee }),
        ...(showRegressionOnly && { is_regression: "true" }),
      });

      const response = await fetch(`/api/bugs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch bugs");

      const data = await response.json();
      setBugs(data.bugs);
      setTotalBugs(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error("Error fetching bugs:", error);
      toast.error("Failed to load bugs");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    selectedProject,
    selectedSeverity,
    selectedStatus,
    selectedAssignee,
    showRegressionOnly,
  ]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const fetchInitialData = async () => {
    try {
      const [projectsRes, usersRes, testCasesRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/users"),
        fetch("/api/test-cases"),
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (testCasesRes.ok) {
        const testCasesData = await testCasesRes.json();
        setTestCases(testCasesData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data");
    }
  };

  const handleCreateBug = async (bugData: BugReportData) => {
    try {
      const formData = new FormData();

      // Add basic bug data
      Object.keys(bugData).forEach((key) => {
        if (key !== "attachments" && key !== "screenshots") {
          const value = bugData[key as keyof typeof bugData];
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        }
      });

      // Add files
      bugData.attachments?.forEach((file: File) => {
        formData.append("attachments", file);
      });
      bugData.screenshots?.forEach((file: File) => {
        formData.append("screenshots", file);
      });

      const response = await fetch("/api/bugs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create bug");

      toast.success("Bug report created successfully!");
      setShowCreateForm(false);
      fetchBugs();
    } catch (error) {
      console.error("Error creating bug:", error);
      toast.error("Failed to create bug report");
    }
  };

  const exportBugs = async () => {
    try {
      const params = new URLSearchParams({
        export: "true",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProject !== "all" && { project_id: selectedProject }),
        ...(selectedSeverity !== "all" && { severity: selectedSeverity }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(selectedAssignee !== "all" && { assignee_id: selectedAssignee }),
        ...(showRegressionOnly && { is_regression: "true" }),
      });

      const response = await fetch(`/api/bugs/export?${params}`);
      if (!response.ok) throw new Error("Failed to export bugs");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bugs-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Bugs exported successfully!");
    } catch (error) {
      console.error("Error exporting bugs:", error);
      toast.error("Failed to export bugs");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProject("all");
    setSelectedSeverity("all");
    setSelectedStatus("all");
    setSelectedAssignee("all");
    setShowRegressionOnly(false);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const BugCard = ({ bug }: { bug: BugReport }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{bug.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {bug.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge label={bug.severity} variant="outline" />
            <Badge label={bug.status.replace("_", " ")} variant="outline" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{bug.reporter.name}</span>
            </div>
            {bug.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>→ {bug.assignee.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(bug.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {bug.is_regression && (
              <Badge label="Regression" variant="warning" className="text-xs" />
            )}
            <div className="flex items-center gap-1 text-xs">
              <span>{bug._count.bug_comments} comments</span>
              <span>•</span>
              <span>{bug._count.bug_attachments} files</span>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {bug.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {bug.labels.map((label) => (
              <Badge
                key={label}
                label={label}
                variant="outline"
                className="text-xs"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="h-8 w-8 text-red-500" />
            Bug Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track, manage, and resolve bugs efficiently
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportBugs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Bug
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Bug Report</DialogTitle>
              </DialogHeader>
              <BugReportForm
                onSubmit={handleCreateBug}
                onCancel={() => setShowCreateForm(false)}
                projects={projects}
                users={users}
                testCases={testCases}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Bug List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bugs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedSeverity}
                  onValueChange={setSelectedSeverity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="BLOCKER">Blocker</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="REOPENED">Reopened</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedAssignee}
                  onValueChange={setSelectedAssignee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={showRegressionOnly ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setShowRegressionOnly(!showRegressionOnly)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Regressions
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bug List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : bugs.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {bugs.length} of {totalBugs} bugs
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {bugs.map((bug) => (
                    <BugCard key={bug.id} bug={bug} />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No bugs found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    No bugs match your current filters. Try adjusting your
                    search criteria.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard projects={projects} />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Bug Reports & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced reporting features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
