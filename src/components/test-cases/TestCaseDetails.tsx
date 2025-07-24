'use client';

import React, { useState } from 'react';
import { useApiStore } from '@/store/apiStore';
import { TestCase } from '@/store/enhancedStore';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Target,
  Settings,
  Calendar,
  User,
  Tag,
  Link,
  History,
  Bug,
  Save,
  X
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TestCaseDetailsProps {
  testCaseId: string;
}

const TestCaseDetails: React.FC<TestCaseDetailsProps> = ({ testCaseId }) => {
  const router = useRouter();
  const {
    testCase,
    isLoading,
    error,
    fetchTestCase,
    deleteTestCase,
    executeTestCase
  } = useApiStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('PASSED');
  const [executionNotes, setExecutionNotes] = useState('');
  const [createBugReport, setCreateBugReport] = useState(false);

  React.useEffect(() => {
    fetchTestCase(testCaseId);
  }, [testCaseId, fetchTestCase]);

  const handleEdit = () => {
    router.push(`/test-management/test-case/${testCaseId}/edit`);
  };

  const handleDelete = async () => {
    await deleteTestCase(testCaseId);
    router.push('/test-management');
  };

  const handleExecute = () => {
    setExecuteDialogOpen(true);
  };

  const handleExecuteConfirm = async () => {
    await executeTestCase(testCaseId, {
      status: executionStatus,
      notes: executionNotes,
      bug_report: createBugReport && testCase ? {
          title: `Bug in test case: ${testCase.title}`,
          description: executionNotes || 'No additional details provided.'
        } : null
    });
    setExecuteDialogOpen(false);
    fetchTestCase(testCaseId); // Refresh the test case data
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'success';
      case 'failed': return 'destructive';
      case 'blocked': return 'warning';
      case 'not executed': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'not executed':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Loading test case...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !testCase) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-destructive">Error loading test case: {error || 'Test case not found'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/test-management')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Cases
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {testCase?.title || 'Test Case Details'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Created on {testCase?.createdAt ? formatDate(testCase.createdAt) : '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleExecute}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Execute Test
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Status and Metadata Card */}
          <Card className="border-0 shadow-md bg-gradient-to-r from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testCase.status)}
                    <Badge variant={getStatusBadgeVariant(testCase.status)} className="px-3 py-1">
                      {testCase.status}
                    </Badge>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <Badge variant={getPriorityBadgeVariant(testCase.priority)} className="px-3 py-1">
                    {testCase.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
                    {testCase.type}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  ID: <span className="font-mono text-gray-700">{testCase.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              {/* Description Section */}
              <div className="bg-gray-50 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {testCase.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Preconditions Section */}
              <div className="bg-amber-50 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Preconditions</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {testCase.preconditions || 'No preconditions specified'}
                  </p>
                </div>
              </div>

              {/* Test Steps Section */}
              <div className="bg-blue-50 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Test Steps</h3>
                  {testCase.steps && testCase.steps.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {testCase.steps.length} steps
                    </Badge>
                  )}
                </div>
                {testCase.steps && testCase.steps.length > 0 ? (
                  <div className="space-y-4">
                    {testCase.steps.map((step, index) => (
                      <div key={index} className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Action</h4>
                                <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                                  {step.action}
                                </p>
                              </div>
                              {step.expectedResult && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Expected Result
                                  </h4>
                                  <p className="text-sm text-green-700 leading-relaxed">
                                    {step.expectedResult}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-blue-200 p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No test steps specified</p>
                    <p className="text-gray-400 text-sm mt-1">Add test steps to define the execution flow</p>
                  </div>
                )}
              </div>

              {/* Expected Result Section */}
              <div className="bg-green-50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Overall Expected Result</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {testCase.expectedResult || 'No expected result specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution History Card */}
          {testCase.executions && testCase.executions.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <History className="h-5 w-5 text-gray-600" />
                  <span>Execution History</span>
                  <Badge variant="secondary" className="ml-2">
                    {testCase.executions.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Previous test case executions and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testCase.executions.map((execution, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(execution.status)}
                          <Badge variant={getStatusBadgeVariant(execution.status)} className="px-3 py-1">
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{execution.executedAt ? formatDate(execution.executedAt) : '-'}</span>
                        </div>
                      </div>
                      {execution.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Execution Notes</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {execution.notes}
                          </p>
                        </div>
                      )}
                      {execution.bugReport && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <Badge variant="outline" className="text-red-700 border-red-300 bg-red-100">
                            🐛 Bug Report: #{execution.bugReport.id}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Quick Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Test Case ID</dt>
                  <dd className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{testCase.id}</dd>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Priority Level</dt>
                  <dd>
                    <Badge variant={getPriorityBadgeVariant(testCase.priority)} className="px-3 py-1">
                      {testCase.priority}
                    </Badge>
                  </dd>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Test Type</dt>
                  <dd className="text-sm text-gray-900 font-medium">{testCase.type}</dd>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Current Status</dt>
                  <dd className="flex items-center space-x-2">
                    {getStatusIcon(testCase.status)}
                    <Badge variant={getStatusBadgeVariant(testCase.status)} className="px-3 py-1">
                      {testCase.status}
                    </Badge>
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-xs text-gray-600">{testCase.createdAt ? formatDate(testCase.createdAt) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-600">{testCase.updatedAt ? formatDate(testCase.updatedAt) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Last Execution</p>
                    <p className="text-xs text-gray-600">
                      {testCase.lastExecutedAt ? formatDate(testCase.lastExecutedAt) : 'Never executed'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          {testCase.tags && testCase.tags.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-gray-600" />
                  <span>Tags</span>
                  <Badge variant="secondary" className="ml-2">
                    {testCase.tags.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {testCase.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Tickets Card */}
          {testCase.linkedTickets && testCase.linkedTickets.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Link className="h-5 w-5 text-gray-600" />
                  <span>Linked Tickets</span>
                  <Badge variant="secondary" className="ml-2">
                    {testCase.linkedTickets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testCase.linkedTickets.map((ticketId: string, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <Link className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                        #{ticketId}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test case
              and remove it from any test plans it's associated with.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-0 shadow-2xl rounded-xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 -mx-6 -mt-6 mb-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
                <Play className="h-6 w-6" />
                <span>Execute Test Case</span>
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-2">
                Record the execution result for test case: <span className="font-medium text-white">{testCase.title}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Status Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Execution Status</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'PASSED', label: 'Passed', color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100', icon: CheckCircle },
                  { value: 'FAILED', label: 'Failed', color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100', icon: XCircle },
                  { value: 'BLOCKED', label: 'Blocked', color: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100', icon: AlertCircle }
                ].map((status) => {
                  const IconComponent = status.icon;
                  return (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setExecutionStatus(status.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        executionStatus === status.value 
                          ? status.color + ' ring-2 ring-blue-500 ring-opacity-50' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Execution Notes</span>
              </label>
              <div className="relative">
                <textarea
                  className="w-full min-h-[120px] p-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 resize-none"
                  placeholder="Describe the test execution details, any issues encountered, or additional observations..."
                  value={executionNotes}
                  onChange={(e) => setExecutionNotes(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {executionNotes.length}/500
                </div>
              </div>
            </div>

            {/* Bug Report Option */}
            {executionStatus === 'FAILED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="create-bug-report"
                    className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    checked={createBugReport}
                    onChange={(e) => setCreateBugReport(e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="create-bug-report" className="text-sm font-medium text-red-800 cursor-pointer">
                      Create bug report from this execution
                    </label>
                    <p className="text-xs text-red-600 mt-1">
                      This will automatically create a bug report with the execution details and link it to this test case.
                    </p>
                  </div>
                  <Bug className="h-5 w-5 text-red-500 mt-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="mt-8 pt-6 border-t border-gray-200 flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setExecuteDialogOpen(false)}
              className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleExecuteConfirm}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Execution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestCaseDetails;
