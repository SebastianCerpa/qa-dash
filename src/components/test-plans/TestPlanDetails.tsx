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
  Trash2,
  X,
  Calendar,
  User,
  Target,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  CheckCircle,
  AlertTriangle,
  Users,
  Package,
  TestTube,
  History,
  ListChecks,
  List
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
  const [executionStatus, setExecutionStatus] = useState('COMPLETED');
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
      steps: Array.isArray(tc.steps) ? tc.steps.map(step => ({
        ...step,
        status: 'PASSED'
      })) : []
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
            steps: Array.isArray(result.steps) ? result.steps.map((step: any, idx: number) =>
              idx === stepIndex ? { ...step, status } : step
            ) : []
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
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Button variant="outline" size="icon" onClick={handleBackClick} className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{testPlan.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Created by {testPlan.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(testPlan.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status and Project Info */}
              <div className="flex items-center space-x-3">
                <Badge className={`${getStatusBadgeColor(testPlan.status)} px-3 py-1 text-sm font-medium`}>
                  {testPlan.status || 'Draft'}
                </Badge>
                {testPlan.projectInfo && (
                  <Badge variant="outline" className="px-3 py-1">
                    <Settings className="mr-1 h-3 w-3" />
                    {testPlan.projectInfo}
                  </Badge>
                )}
                <Badge variant="outline" className="px-3 py-1">
                  <Clock className="mr-1 h-3 w-3" />
                  {testPlan.startDate ? formatDate(testPlan.startDate) : 'No start'} - {testPlan.endDate ? formatDate(testPlan.endDate) : 'No end'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleEditClick} className="shadow-sm">
              <Edit className="mr-2 h-4 w-4" /> Edit Plan
            </Button>
            <Button onClick={handleExecuteClick} disabled={planTestCases.length === 0} className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Play className="mr-2 h-4 w-4" /> Execute Tests
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Execution Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Execution Summary</CardTitle>
              <CardDescription className="text-sm">
                Overall progress and test case execution status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{executionSummary.totalTests}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Tests</div>
            </div>

            {/* Passed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-100 dark:border-green-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{executionSummary.passed}</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Passed</div>
            </div>

            {/* Failed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-100 dark:border-red-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{executionSummary.failed}</div>
              <div className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Failed</div>
            </div>

            {/* Blocked */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-100 dark:border-orange-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{executionSummary.blocked}</div>
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Blocked</div>
            </div>

            {/* Execution Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{executionSummary.executionRate}%</div>
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Execution Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="details"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-medium"
          >
            <ListChecks className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="testcases"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-medium"
          >
            <TestTube className="h-4 w-4" />
            Test Cases
          </TabsTrigger>
          <TabsTrigger
            value="execution"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-medium"
          >
            <History className="h-4 w-4" />
            Execution History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Description Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {testPlan.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Objectives and Scope */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.objectives || 'No objectives provided.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.scope || 'No scope provided.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Strategy and Environment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Test Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.testStrategy || 'No test strategy provided.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.environment || 'No environment details provided.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Acceptance Criteria and Risk Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Acceptance Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.acceptanceCriteria || 'No acceptance criteria provided.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.riskManagement || 'No risk management details provided.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resources and Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.resources || 'No resources provided.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-pink-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {testPlan.schedule || 'No schedule provided.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Deliverables */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {testPlan.deliverables || 'No deliverables provided.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testcases" className="space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <TestTube className="h-5 w-5" />
                  Test Cases ({planTestCases.length})
                </CardTitle>
                <Button onClick={handleAddTestCasesClick} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Test Cases
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {planTestCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <TestTube className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Cases Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    Start building your test plan by adding test cases that will validate your application's functionality.
                  </p>
                  <Button onClick={handleAddTestCasesClick} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Test Case
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Title</TableHead>
                        <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planTestCases.map((testCase, index) => (
                        <TableRow key={testCase.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell className="font-medium text-gray-900">{testCase.title}</TableCell>
                          <TableCell>
                            <Badge className={getTestCasePriorityBadgeColor(testCase.priority)}>
                              {testCase.priority || 'Medium'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">{testCase.type}</TableCell>
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
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <History className="h-5 w-5" />
                Execution History
              </CardTitle>
              <CardDescription className="text-gray-600">
                Track the history of test plan executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <History className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Execution History</h3>
                <p className="text-gray-500 max-w-sm">
                  Once you start executing test cases, their history and results will appear here for tracking and analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Execute Test Plan Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white border-0 shadow-2xl rounded-xl">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 -mx-6 -mt-6 mb-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
                <Play className="h-6 w-6" />
                <span>Execute Test Plan</span>
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-2">
                Execute and track the progress of test plan: <span className="font-medium text-white">{testPlan.name}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-200px)] space-y-6">
            {/* Test Plan Status Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <Label htmlFor="execution-status" className="text-sm font-semibold text-gray-700">Test Plan Status:</Label>
                </div>
                <Select value={executionStatus} onValueChange={setExecutionStatus}>
                  <SelectTrigger id="execution-status" className="w-[180px] bg-white border-blue-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Test Cases Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Test Cases ({planTestCases.length})</h3>
              </div>
              
              {planTestCases.map((testCase, index) => {
                const result = executionResults.find(r => r.id === testCase.id) || {
                  status: 'PASSED',
                  notes: '',
                  steps: testCase.steps
                };

                return (
                  <div key={testCase.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Test Case Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">{testCase.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 ml-10">{testCase.description}</p>
                      </div>
                      
                      {/* Status Selection */}
                      <div className="ml-4">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                        <Select
                          value={result.status}
                          onValueChange={(value) => handleExecutionStatusChange(testCase.id, value)}
                        >
                          <SelectTrigger className="w-[140px] bg-gray-50 border-gray-300 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PASSED">
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Passed
                              </div>
                            </SelectItem>
                            <SelectItem value="FAILED">
                              <div className="flex items-center">
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Failed
                              </div>
                            </SelectItem>
                            <SelectItem value="BLOCKED">
                              <div className="flex items-center">
                                <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
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
                    </div>

                    {/* Test Steps Section */}
                    {Array.isArray(testCase.steps) && testCase.steps.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <List className="h-4 w-4 text-gray-600" />
                          <h5 className="text-sm font-semibold text-gray-700">Test Steps ({testCase.steps.length})</h5>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="font-semibold">Action</TableHead>
                                <TableHead className="font-semibold">Expected Result</TableHead>
                                <TableHead className="w-32 text-center font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testCase.steps.map((step, stepIndex) => (
                                <TableRow key={stepIndex} className="hover:bg-gray-50">
                                  <TableCell className="text-center font-medium text-gray-600">{stepIndex + 1}</TableCell>
                                  <TableCell className="text-sm">{step.action}</TableCell>
                                  <TableCell className="text-sm">{step.expectedResult}</TableCell>
                                  <TableCell className="text-center">
                                    <Select
                                      value={result.steps[stepIndex]?.status || 'PASSED'}
                                      onValueChange={(value) => handleStepStatusChange(testCase.id, stepIndex, value)}
                                    >
                                      <SelectTrigger className="w-[110px] h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PASSED">
                                          <div className="flex items-center">
                                            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                            <span className="text-xs">Passed</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="FAILED">
                                          <div className="flex items-center">
                                            <XCircle className="mr-1 h-3 w-3 text-red-500" />
                                            <span className="text-xs">Failed</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="BLOCKED">
                                          <div className="flex items-center">
                                            <AlertCircle className="mr-1 h-3 w-3 text-orange-500" />
                                            <span className="text-xs">Blocked</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="SKIPPED">
                                          <div className="flex items-center">
                                            <Clock className="mr-1 h-3 w-3 text-purple-500" />
                                            <span className="text-xs">Skipped</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Execution Notes Section */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <Label htmlFor={`notes-${testCase.id}`} className="text-sm font-semibold text-gray-700">Execution Notes</Label>
                      </div>
                      <div className="relative">
                        <Textarea
                          id={`notes-${testCase.id}`}
                          className="min-h-[100px] p-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 resize-none"
                          placeholder="Add detailed notes about the test execution, any issues encountered, or observations..."
                          value={result.notes}
                          onChange={(e) => handleExecutionNotesChange(testCase.id, e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {result.notes.length}/500
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
