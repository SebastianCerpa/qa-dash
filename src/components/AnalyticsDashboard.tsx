'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, trend }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {change && (
            <div className={`text-sm ${getTrendColor()}`}>
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsData {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  criticalBugs: number;
  bugTrend: Array<{ date: string; count: number }>;
  severityData: Record<string, number>;
  statusData: Record<string, number>;
  testMetrics: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
  };
  performanceMetrics: {
    avgExecutionTime: number;
    slowestTest: string;
    fastestTest: string;
  };
  teamMetrics: {
    totalAssignees: number;
    mostActiveUser: string;
    avgResolutionTime: number;
  };
  flakyTests: Array<{
    test_case_name: string;
    test_suite_id: string;
    flaky_score: number;
  }>;
}

interface AnalyticsDashboardProps {
  projects: Array<{ id: string; name: string }>;
}

export default function AnalyticsDashboard({ projects }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedProject, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        project: selectedProject,
        range: dateRange
      });
      
      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTrendData = () => {
    if (!analyticsData?.bugTrend) return [];
    return analyticsData.bugTrend.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString()
    }));
  };

  const formatSeverityData = () => {
    if (!analyticsData?.severityData) return [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    return Object.entries(analyticsData.severityData).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const formatStatusData = () => {
    if (!analyticsData?.statusData) return [];
    return Object.entries(analyticsData.statusData).map(([name, value]) => ({
      name,
      value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bugs">Bug Analysis</TabsTrigger>
          <TabsTrigger value="testing">Testing Metrics</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Bugs"
              value={analyticsData.totalBugs}
              change="+12%"
              trend="up"
            />
            <MetricCard
              title="Open Bugs"
              value={analyticsData.openBugs}
              change="-5%"
              trend="down"
            />
            <MetricCard
              title="Resolved Bugs"
              value={analyticsData.resolvedBugs}
              change="+18%"
              trend="up"
            />
            <MetricCard
              title="Critical Bugs"
              value={analyticsData.criticalBugs}
              change="-2%"
              trend="down"
            />
          </div>

          {/* Bug Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Bug Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bugs by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formatSeverityData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatSeverityData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bugs by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatStatusData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          {/* Test Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Tests"
              value={analyticsData.testMetrics.totalTests}
            />
            <MetricCard
              title="Passed Tests"
              value={analyticsData.testMetrics.passedTests}
              trend="up"
            />
            <MetricCard
              title="Failed Tests"
              value={analyticsData.testMetrics.failedTests}
              trend="down"
            />
            <MetricCard
              title="Pass Rate"
              value={`${analyticsData.testMetrics.passRate}%`}
              trend="up"
            />
          </div>

          {/* Flaky Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Flaky Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.flakyTests.length > 0 ? (
                  analyticsData.flakyTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{test.test_case_name}</p>
                        <p className="text-sm text-gray-500">Suite: {test.test_suite_id}</p>
                      </div>
                      <Badge 
                        label={`${Math.round(test.flaky_score * 100)}% flaky`}
                        variant={test.flaky_score > 0.7 ? "danger" : "secondary"}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No flaky tests detected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Team Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Assignees"
              value={analyticsData.teamMetrics.totalAssignees}
            />
            <MetricCard
              title="Most Active User"
              value={analyticsData.teamMetrics.mostActiveUser}
            />
            <MetricCard
              title="Avg Resolution Time"
              value={`${analyticsData.teamMetrics.avgResolutionTime}h`}
            />
          </div>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Team Assignment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock team data - replace with actual data */}
                {[
                  { user: { name: 'John Doe', email: 'john@example.com' }, count: 15 },
                  { user: { name: 'Jane Smith', email: 'jane@example.com' }, count: 12 },
                  { user: { name: 'Bob Johnson', email: 'bob@example.com' }, count: 8 }
                ].map((assignee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {assignee.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{assignee.user.name}</p>
                        <p className="text-sm text-gray-500">{assignee.user.email}</p>
                      </div>
                    </div>
                    <Badge label={`${assignee.count} assigned`} variant="secondary" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}