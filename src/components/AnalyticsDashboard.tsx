'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TestTube, 
  Bug 
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  summary: {
    totalBugs: number;
    newBugs: number;
    resolvedBugs: number;
    criticalBugs: number;
    resolutionRate: number;
    avgResolutionTime: number;
  };
  trendData: {
    labels: string[];
    opened: number[];
    resolved: number[];
  };
  severityData: number[];
  statusData: Record<string, number>;
  topReporters: Array<{
    user: { id: string; name: string; email: string; avatar_url?: string };
    count: number;
  }>;
  topAssignees: Array<{
    user: { id: string; name: string; email: string; avatar_url?: string };
    count: number;
  }>;
  flakyTests: Array<{
    test_case_name: string;
    flaky_score: number;
    test_suite_id: string;
  }>;
  testMetrics: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    flakyTests: number;
    passRate: number;
    avgDuration: number;
  };
  dateRange: {
    start: string;
    end: string;
    range: string;
  };
}

interface AnalyticsDashboardProps {
  projects: Array<{ id: string; name: string }>;
}

const COLORS = {
  severity: ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#8B5CF6'],
  status: {
    OPEN: '#3B82F6',
    IN_PROGRESS: '#F59E0B',
    RESOLVED: '#10B981',
    CLOSED: '#6B7280',
    REOPENED: '#EF4444'
  }
};

const SEVERITY_LABELS = ['Low', 'Medium', 'High', 'Critical', 'Blocker'];

export default function AnalyticsDashboard({ projects }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedProject, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        range: dateRange,
        ...(selectedProject !== 'all' && { projectId: selectedProject })
      });
      
      const response = await fetch(`/api/analytics/bugs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatTrendData = () => {
    if (!analyticsData) return [];
    
    return analyticsData.trendData.labels.map((date, index) => ({
      date: new Date(date).toLocaleDateString(),
      opened: analyticsData.trendData.opened[index],
      resolved: analyticsData.trendData.resolved[index]
    }));
  };

  const formatSeverityData = () => {
    if (!analyticsData) return [];
    
    return SEVERITY_LABELS.map((label, index) => ({
      name: label,
      value: analyticsData.severityData[index] || 0,
      color: COLORS.severity[index]
    }));
  };

  const formatStatusData = () => {
    if (!analyticsData) return [];
    
    return Object.entries(analyticsData.statusData).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: COLORS.status[status as keyof typeof COLORS.status] || '#6B7280'
    }));
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    change?: { value: number; type: 'increase' | 'decrease' };
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center mt-1 text-sm ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(change.value)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
          <TabsTrigger value="testing">Test Metrics</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Bugs"
              value={analyticsData.summary.totalBugs}
              icon={Bug}
              color="blue"
            />
            <MetricCard
              title="Critical Bugs"
              value={analyticsData.summary.criticalBugs}
              icon={AlertTriangle}
              color="red"
            />
            <MetricCard
              title="Resolution Rate"
              value={`${analyticsData.summary.resolutionRate}%`}
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="Avg Resolution Time"
              value={`${analyticsData.summary.avgResolutionTime}h`}
              icon={Clock}
              color="orange"
            />
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Bug Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="opened" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Bugs Opened"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Bugs Resolved"
                  />
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
                    <Bar dataKey="value" fill={(entry) => entry.color} />
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
              icon={TestTube}
              color="blue"
            />
            <MetricCard
              title="Pass Rate"
              value={`${analyticsData.testMetrics.passRate}%`}
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="Failed Tests"
              value={analyticsData.testMetrics.failedTests}
              icon={AlertTriangle}
              color="red"
            />
            <MetricCard
              title="Flaky Tests"
              value={analyticsData.testMetrics.flakyTests}
              icon={TrendingDown}
              color="orange"
            />
          </div>

          {/* Flaky Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Top Flaky Tests</CardTitle>
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
                        variant={test.flaky_score > 0.7 ? 'destructive' : test.flaky_score > 0.4 ? 'default' : 'secondary'}
                      >
                        {Math.round(test.flaky_score * 100)}% flaky
                      </Badge>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Bug Reporters */}
            <Card>
              <CardHeader>
                <CardTitle>Top Bug Reporters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topReporters.map((reporter, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{reporter.user.name}</p>
                          <p className="text-sm text-gray-500">{reporter.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{reporter.count} bugs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Assignees */}
            <Card>
              <CardHeader>
                <CardTitle>Top Bug Assignees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topAssignees.map((assignee, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{assignee.user.name}</p>
                          <p className="text-sm text-gray-500">{assignee.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{assignee.count} assigned</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}