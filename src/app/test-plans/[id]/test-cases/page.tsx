'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApiStore } from '@/store/apiStore';
import { TestCase } from '@/store/enhancedStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/Checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select-radix";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { ArrowLeft, Check, Loader2, Plus, Search } from 'lucide-react';

interface TestCasesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TestCasesPage({ params }: TestCasesPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    fetchTestPlanById,
    fetchTestCasesForTestPlan,
    addTestCasesToTestPlan,
    removeTestCasesFromTestPlan,
    isLoading,
    error,
    testPlans,
    testCases
  } = useApiStore();

  const [testPlan, setTestPlan] = useState<any>(null);
  const [planTestCases, setPlanTestCases] = useState<TestCase[]>([]);
  const [availableTestCases, setAvailableTestCases] = useState<any[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limit = 10;

  useEffect(() => {
    const loadTestPlan = async () => {
      const plan = await fetchTestPlanById(id);
      if (plan) {
        setTestPlan(plan);
      }
    };

    loadTestPlan();
    fetchTestCasesForTestPlan(id);
    // Here we would fetch available test cases
    // For now, we'll simulate it with a mock API call
    fetchAvailableTestCases();
  }, [id, fetchTestPlanById, fetchTestCasesForTestPlan]);

  useEffect(() => {
    // Filter test cases that belong to this test plan
    const filteredTestCases = testCases.filter(tc => tc.testPlanId === id);
    setPlanTestCases(filteredTestCases);
  }, [testCases, id]);

  // Mock function to fetch available test cases
  // In a real implementation, this would be an API call
  const fetchAvailableTestCases = async () => {
    // Simulate API call
    setTimeout(() => {
      // Generate some mock test cases
      const mockTestCases = Array.from({ length: 20 }, (_, i) => ({
        id: `tc-${i + 1}`,
        title: `Test Case ${i + 1}`,
        description: `Description for test case ${i + 1}`,
        priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        type: ['Functional', 'Integration', 'UI', 'Performance'][Math.floor(Math.random() * 4)],
        status: 'Not Executed',
        steps: [],
        tags: [],
      }));

      // Filter out test cases that are already in the test plan
      const filtered = mockTestCases.filter(tc =>
        !planTestCases.some(ptc => ptc.id === tc.id)
      );

      setAvailableTestCases(filtered);
    }, 1000);
  };

  const handleBackClick = () => {
    router.push(`/test-plans/${id}`);
  };

  const handleTestCaseSelection = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTestCases(prev =>
      prev.includes(id)
        ? prev.filter(tcId => tcId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      const filteredIds = availableTestCases
        .filter(tc => {
          const matchesSearch = searchTerm ? tc.title?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
          const matchesPriority = priorityFilter && priorityFilter !== 'all' ? tc.priority?.toLowerCase() === priorityFilter.toLowerCase() : true;
          const matchesType = typeFilter ? tc.type?.toLowerCase() === typeFilter.toLowerCase() : true;
          return matchesSearch && matchesPriority && matchesType;
        })
        .map(tc => tc.id);
      setSelectedTestCases(filteredIds);
    } else {
      setSelectedTestCases([]);
    }
  };

  const handleAddTestCases = async () => {
    if (selectedTestCases.length === 0) return;

    setIsSubmitting(true);
    try {
      await addTestCasesToTestPlan(id, selectedTestCases);
      // Refresh the lists
      fetchTestCasesForTestPlan(id);
      fetchAvailableTestCases();
      setSelectedTestCases([]);
    } catch (error) {
      console.error('Error adding test cases:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredTestCases = () => {
    return availableTestCases.filter(tc => {
      const matchesSearch = searchTerm ? tc.title?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const matchesPriority = priorityFilter && priorityFilter !== 'all' ? tc.priority?.toLowerCase() === priorityFilter.toLowerCase() : true;
      const matchesType = typeFilter ? tc.type?.toLowerCase() === typeFilter.toLowerCase() : true;
      return matchesSearch && matchesPriority && matchesType;
    });
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

  const renderPagination = () => {
    const filteredTestCases = getFilteredTestCases();
    const totalPages = Math.ceil(filteredTestCases.length / limit);

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} size={undefined} />
          </PaginationItem>

          {[...Array(Math.min(3, totalPages))].map((_, i) => {
            const pageNum = page - 1 + i;
            if (pageNum < 1 || pageNum > totalPages) return null;

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => setPage(pageNum)} size={undefined}                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} size={undefined}            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading && !testPlan) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!testPlan) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Test plan not found.
      </div>
    );
  }

  const filteredTestCases = getFilteredTestCases();
  const paginatedTestCases = filteredTestCases.slice((page - 1) * limit, page * limit);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Manage Test Cases</h1>
          <p className="text-muted-foreground">
            Test Plan: {testPlan.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Current Test Cases</CardTitle>
            <CardDescription>
              Test cases currently in this test plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {planTestCases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No test cases in this test plan yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium">Total: {planTestCases.length}</div>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Type</TableHead>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Available Test Cases</CardTitle>
            <CardDescription>
              Select test cases to add to this test plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search test cases..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="ui">UI</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedTestCases.length > 0 && selectedTestCases.length === filteredTestCases.length}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All
                    </label>
                  </div>

                  <Button
                    onClick={handleAddTestCases}
                    disabled={selectedTestCases.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Selected ({selectedTestCases.length})
                  </Button>
                </div>
              </div>

              {availableTestCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available test cases found.
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTestCases.map((testCase) => (
                        <TableRow key={testCase.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTestCases.includes(testCase.id)}
                              onChange={handleTestCaseSelection(testCase.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{testCase.title}</TableCell>
                          <TableCell>
                            <Badge className={getTestCasePriorityBadgeColor(testCase.priority)}>
                              {testCase.priority || 'Medium'}
                            </Badge>
                          </TableCell>
                          <TableCell>{testCase.type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredTestCases.length > limit && renderPagination()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleBackClick}>
          Back to Test Plan
        </Button>
      </div>
    </div>
  );
}