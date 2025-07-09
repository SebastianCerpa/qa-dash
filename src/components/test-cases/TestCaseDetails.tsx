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
  Clock
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'not executed':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => router.push('/test-management')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Test Cases
        </Button>
        <div className="ml-auto flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExecute}
            className="flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Execute
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{testCase.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Created on {testCase.createdAt ? formatDate(testCase.createdAt) : '-'}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={getPriorityBadgeVariant(testCase.priority)}>
                    {testCase.priority}
                  </Badge>
                  <Badge variant="outline">{testCase.type}</Badge>
                  <Badge variant={getStatusBadgeVariant(testCase.status)}>
                    {testCase.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {testCase.description || 'No description provided'}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Preconditions</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {testCase.preconditions || 'No preconditions specified'}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Test Steps</h3>
                {testCase.steps && testCase.steps.length > 0 ? (
                  <div className="space-y-4">
                    {testCase.steps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 whitespace-pre-line font-medium">
                            {step.action}
                          </p>
                          {step.expectedResult && (
                            <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-200 rounded">
                              <p className="text-sm text-green-800">
                                <span className="font-medium">Expected Result:</span> {step.expectedResult}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No test steps specified</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Expected Result</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {testCase.expectedResult || 'No expected result specified'}
                </p>
              </div>
            </CardContent>
          </Card>

          {testCase.executions && testCase.executions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  Previous test case executions and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testCase.executions.map((execution, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(execution.status)}
                          <span className="ml-2 font-medium">{execution.status}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {execution.executedAt ? formatDate(execution.executedAt) : '-'}
                        </span>
                      </div>
                      {execution.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {execution.notes}
                        </p>
                      )}
                      {execution.bugReport && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-destructive border-destructive">
                            Bug Report: #{execution.bugReport.id}
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
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                  <dd className="mt-1">{testCase.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Priority</dt>
                  <dd className="mt-1">
                    <Badge variant={getPriorityBadgeVariant(testCase.priority)}>
                      {testCase.priority}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <dd className="mt-1">{testCase.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={getStatusBadgeVariant(testCase.status)}>
                      {testCase.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="mt-1">{testCase.createdAt ? formatDate(testCase.createdAt) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1">{testCase.updatedAt ? formatDate(testCase.updatedAt) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Execution</dt>
                  <dd className="mt-1">
                    {testCase.lastExecutedAt ? formatDate(testCase.lastExecutedAt) : 'Never executed'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {testCase.tags && testCase.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {testCase.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {testCase.linkedTickets && testCase.linkedTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {testCase.linkedTickets.map((ticketId: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="text-blue-500 hover:underline cursor-pointer">
                        #{ticketId}
                      </span>
                    </li>
                  ))}
                </ul>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Test Case</DialogTitle>
            <DialogDescription>
              Record the execution result for this test case.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-muted-foreground">
                Status
              </label>
              <select
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={executionStatus}
                onChange={(e) => setExecutionStatus(e.target.value)}
              >
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-muted-foreground">
                Notes
              </label>
              <textarea
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add execution notes..."
                value={executionNotes}
                onChange={(e) => setExecutionNotes(e.target.value)}
              />
            </div>
            {executionStatus === 'FAILED' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="create-bug-report"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={createBugReport}
                    onChange={(e) => setCreateBugReport(e.target.checked)}
                  />
                  <label htmlFor="create-bug-report" className="text-sm font-medium">
                    Create bug report from this execution
                  </label>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteConfirm}>
              Save Execution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestCaseDetails;