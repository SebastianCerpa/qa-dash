'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ExecuteTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const { fetchTestCase, executeTestCase, testCase, isLoading, error } = useApiStore();

  const [executionStatus, setExecutionStatus] = useState('PASSED');
  const [executionNotes, setExecutionNotes] = useState('');
  const [createBugReport, setCreateBugReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchTestCase(id);
    }
  }, [id, fetchTestCase]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await executeTestCase(id, {
        status: executionStatus,
        notes: executionNotes,
        createBugReport
      });
      router.push(`/test-cases/${id}`);
    } catch (error) {
      console.error('Failed to execute test case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/test-cases/${id}`);
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading test case...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !testCase) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Error loading test case: {error || 'Test case not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => router.push(`/test-cases/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Test Case
        </Button>
        <h1 className="text-2xl font-bold">Execute Test Case</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{testCase.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Test Case ID: {testCase.id}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={getPriorityBadgeVariant(testCase.priority)}>
                    {testCase.priority}
                  </Badge>
                  <Badge variant="outline">{testCase.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {testCase.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {testCase.description}
                  </p>
                </div>
              )}

              {testCase.preconditions && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Preconditions</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {testCase.preconditions}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Test Steps</h3>
                {testCase.steps && testCase.steps.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-4">
                    {testCase.steps.map((step, index) => (
                      <li key={index} className="pl-2 pb-4 border-b border-gray-100 last:border-0">
                        <div className="ml-2 mt-1">
                          <p className="font-semibold">{step.action}</p>
                          <p className="text-muted-foreground whitespace-pre-line">{step.expectedResult}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Result</CardTitle>
              <CardDescription>
                Record the result of executing this test case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={executionStatus} onValueChange={setExecutionStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSED">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Passed
                      </div>
                    </SelectItem>
                    <SelectItem value="FAILED">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Failed
                      </div>
                    </SelectItem>
                    <SelectItem value="BLOCKED">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        Blocked
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Execution Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the execution..."
                  value={executionNotes}
                  onChange={(e) => setExecutionNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {executionStatus === 'FAILED' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-bug-report"
                    checked={createBugReport}
                    onChange={(checked) => setCreateBugReport(checked as unknown as boolean)}
                  />
                  <Label htmlFor="create-bug-report" className="cursor-pointer">
                    Create bug report from this execution
                  </Label>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Execution'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}