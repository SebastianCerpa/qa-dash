import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/store/apiStore';
import { TestPlan, TestCase } from '@/store/enhancedStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  ArrowLeft,
  Check,
  Clock,
  Edit,
  Loader2,
  Play,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface TestPlanDetailsProps {
  testPlanId: string;
}

const TestPlanDetails: React.FC<TestPlanDetailsProps> = ({ testPlanId }) => {
  const router = useRouter();
  const {
    fetchTestPlanById,
    fetchTestCasesForTestPlan,
    updateTestPlan,
    executeTestPlan,
    removeTestCasesFromTestPlan,
    isLoading,
    error,
    testPlans,
    testCases
  } = useApiStore();

  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [planTestCases, setPlanTestCases] = useState<TestCase[]>([]);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('completed');
  const [executionResults, setExecutionResults] = useState<Record<string, any>[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [testCaseToRemove, setTestCaseToRemove] = useState<string | null>(null);

  useEffect(() => {
    const loadTestPlan = async () => {
      console.log('TestPlanDetails: Loading test plan with ID:', testPlanId);
      try {
        const plan = await fetchTestPlanById(testPlanId);
        if (plan) {
          setTestPlan(plan);
        } else {
        }
      } catch (error) {
      }
    };

    loadTestPlan();
    fetchTestCasesForTestPlan(testPlanId);
  }, [testPlanId, fetchTestPlanById, fetchTestCasesForTestPlan]);

  useEffect(() => {
    // Filter test cases that belong to this test plan
    const filteredTestCases = testCases.filter(tc => testPlan?.testCaseIds.includes(tc.id));
    setPlanTestCases(filteredTestCases);
  }, [testCases, testPlan]);

  const handleBackClick = () => {
    router.push('/test-management/');
  };

  const handleEditClick = () => {
    router.push(`/test-management?tab=test-plans&edit=${testPlanId}`);
  };

  const handleAddTestCasesClick = () => {
    router.push(`/test-management?tab=test-plans&addTestCases=${testPlanId}`);
  };

  const handleRemoveTestCase = (id: string) => {
    setTestCaseToRemove(id);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveTestCase = async () => {
    if (testCaseToRemove) {
      try {
        await removeTestCasesFromTestPlan(testPlanId, [testCaseToRemove]);
        setRemoveDialogOpen(false);
        setTestCaseToRemove(null);
      } catch (error) {
        console.error('Error removing test case:', error);
      }
    }
  };

  const handleExecuteClick = () => {
    // Initialize execution results with all test cases
    const initialResults = planTestCases.map(tc => ({
      id: tc.id,
      status: 'PASSED', // Default status
      notes: '',
      steps: tc.steps.map(step => ({
        ...step,
        status: 'PASSED'
      }))
    }));

    setExecutionResults(initialResults);
    setExecuteDialogOpen(true);
  };

  const handleExecutionStatusChange = (testCaseId: string, status: string) => {
    setExecutionResults(prev =>
      prev.map(result =>
        result.id === testCaseId
          ? { ...result, status }
          : result
      )
    );
  };

  const handleExecutionNotesChange = (testCaseId: string, notes: string) => {
    setExecutionResults(prev =>
      prev.map(result =>
        result.id === testCaseId
          ? { ...result, notes }
          : result
      )
    );
  };

  const handleStepStatusChange = (testCaseId: string, stepIndex: number, status: string) => {
    setExecutionResults(prev =>
      prev.map(result =>
        result.id === testCaseId
          ? {
            ...result,
            steps: result.steps.map((step: any, idx: number) =>
              idx === stepIndex ? { ...step, status } : step
            )
          }
          : result
      )
    );
  };

  const executeTestPlanHandler = async () => {
    setIsExecuting(true);
    try {
      const updatedTestPlan = await executeTestPlan(testPlanId, executionStatus, executionResults);
      if (updatedTestPlan) {
        setTestPlan(updatedTestPlan);
        setExecuteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error executing test plan:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'active': return 'bg-blue-200 text-blue-800';
      case 'completed': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getTestCaseStatusBadgeColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    switch (status.toLowerCase()) {
      case 'passed': return 'bg-green-200 text-green-800';
      case 'failed': return 'bg-red-200 text-red-800';
      case 'blocked': return 'bg-orange-200 text-orange-800';
      case 'skipped': return 'bg-purple-200 text-purple-800';
      case 'not executed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getTestCasePriorityBadgeColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-200 text-gray-800';
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-200 text-red-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!testPlan) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Test plan not found.
      </div>
    );
  }

  const executionSummary = testPlan.executionSummary || {
    totalTests: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    skipped: 0,
    executionRate: 0
  };

  const progress = executionSummary.totalTests > 0
    ? Math.round(((executionSummary.passed + executionSummary.failed + executionSummary.blocked + executionSummary.skipped) / executionSummary.totalTests) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{testPlan.name}</h1>
          <p className="text-muted-foreground">
            Created by {testPlan.createdBy} on {formatDate(testPlan.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge className={getStatusBadgeColor(testPlan.status)}>
            {testPlan.status || 'Draft'}
          </Badge>
          {testPlan.projectInfo && (
            <Badge variant="outline">
              Project: {testPlan.projectInfo}
            </Badge>
          )}
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {testPlan.startDate ? formatDate(testPlan.startDate) : '-'} - {testPlan.endDate ? formatDate(testPlan.endDate) : '-'}
          </Badge>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button onClick={handleExecuteClick} disabled={planTestCases.length === 0}>
            <Play className="mr-2 h-4 w-4" /> Execute
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Summary</CardTitle>
          <CardDescription>
            Overall progress and test case execution status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-medium">Progress</div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Total</div>
              <div className="text-2xl font-bold">{executionSummary.totalTests}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-green-600">Passed</div>
              <div className="text-2xl font-bold text-green-600">{executionSummary.passed}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-red-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">{executionSummary.failed}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-orange-600">Blocked</div>
              <div className="text-2xl font-bold text-orange-600">{executionSummary.blocked}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600">Execution Rate</div>
              <div className="text-2xl font-bold text-gray-600">{executionSummary.executionRate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          <TabsTrigger value="execution">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Description</h3>
                <p className="mt-2">{testPlan.description || 'No description provided.'}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Objectives</h3>
                  <p className="mt-2">{testPlan.objectives || 'No objectives provided.'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Scope</h3>
                  <p className="mt-2">{testPlan.scope || 'No scope provided.'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Test Strategy</h3>
                  <p className="mt-2">{testPlan.testStrategy || 'No test strategy provided.'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Environment</h3>
                  <p className="mt-2">{testPlan.environment || 'No environment details provided.'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Acceptance Criteria</h3>
                  <p className="mt-2">{testPlan.acceptanceCriteria || 'No acceptance criteria provided.'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Risk Management</h3>
                  <p className="mt-2">{testPlan.riskManagement || 'No risk management details provided.'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium">Resources</h3>
                  <p className="mt-2">{testPlan.resources || 'No resources provided.'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Schedule</h3>
                  <p className="mt-2">{testPlan.schedule || 'No schedule provided.'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Deliverables</h3>
                <p className="mt-2">{testPlan.deliverables || 'No deliverables provided.'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testcases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Test Cases ({planTestCases.length})</h3>
            <Button onClick={handleAddTestCasesClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Test Cases
            </Button>
          </div>

          {planTestCases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No test cases have been added to this test plan yet.</p>
                <Button onClick={handleAddTestCasesClick}>
                  <Plus className="mr-2 h-4 w-4" /> Add Test Cases
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planTestCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-medium">{testCase.title}</TableCell>
                        <TableCell>
                          <Badge className={getTestCasePriorityBadgeColor(testCase.priority)}>
                            {testCase.priority || 'Medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>{testCase.type}</TableCell>
                        <TableCell>
                          <Badge className={getTestCaseStatusBadgeColor(testCase.status)}>
                            {testCase.status || 'Not Executed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTestCase(testCase.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                History of test plan executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                No execution history available yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Execute Test Plan Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execute Test Plan: {testPlan.name}</DialogTitle>
            <DialogDescription>
              Update the status of each test case and provide execution notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="execution-status">Test Plan Status:</Label>
              <Select value={executionStatus} onValueChange={setExecutionStatus}>
                <SelectTrigger id="execution-status" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {planTestCases.map((testCase, index) => {
              const result = executionResults.find(r => r.id === testCase.id) || {
                status: 'PASSED',
                notes: '',
                steps: testCase.steps
              };

              return (
                <div key={testCase.id} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{testCase.title}</h3>
                      <p className="text-sm text-muted-foreground">{testCase.description}</p>
                    </div>
                    <Select
                      value={result.status}
                      onValueChange={(value) => handleExecutionStatusChange(testCase.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASSED">
                          <div className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Passed
                          </div>
                        </SelectItem>
                        <SelectItem value="FAILED">
                          <div className="flex items-center">
                            <X className="mr-2 h-4 w-4 text-red-500" />
                            Failed
                          </div>
                        </SelectItem>
                        <SelectItem value="BLOCKED">
                          <div className="flex items-center">
                            <X className="mr-2 h-4 w-4 text-orange-500" />
                            Blocked
                          </div>
                        </SelectItem>
                        <SelectItem value="SKIPPED">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-purple-500" />
                            Skipped
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {testCase.steps && testCase.steps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Test Steps</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Expected Result</TableHead>
                            <TableHead className="w-24">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testCase.steps.map((step, stepIndex) => (
                            <TableRow key={stepIndex}>
                              <TableCell>{stepIndex + 1}</TableCell>
                              <TableCell>{step.action}</TableCell>
                              <TableCell>{step.expectedResult}</TableCell>
                              <TableCell>
                                <Select
                                  value={result.steps[stepIndex]?.status || 'PASSED'}
                                  onValueChange={(value) => handleStepStatusChange(testCase.id, stepIndex, value)}
                                >
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PASSED">Passed</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                                    <SelectItem value="SKIPPED">Skipped</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${testCase.id}`}>Execution Notes</Label>
                    <Textarea
                      id={`notes-${testCase.id}`}
                      placeholder="Add any notes about the execution..."
                      value={result.notes}
                      onChange={(e) => handleExecutionNotesChange(testCase.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>Cancel</Button>
            <Button onClick={executeTestPlanHandler} disabled={isExecuting}>
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Execution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Test Case Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Test Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this test case from the test plan?
              This will not delete the test case itself, only remove it from this plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveTestCase}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestPlanDetails;