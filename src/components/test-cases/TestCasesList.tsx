"use client";

import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/store/apiStore';
import { TestCase } from '@/store/enhancedStore';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Edit, 
  Eye, 
  Play, 
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface TestCasesListProps {
  showHeader?: boolean;
  limit?: number;
}

const TestCasesList: React.FC<TestCasesListProps> = ({ 
  showHeader = true,
  limit = 10
}) => {
  const router = useRouter();
  const { 
    testCases, 
    isLoading, 
    error,
    fetchTestCases,
    deleteTestCase,
    executeTestCase
  } = useApiStore();
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTestCases, setTotalTestCases] = useState(0);

  useEffect(() => {
    const loadTestCases = async () => {
      const filters: Record<string, string> = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (priorityFilter && priorityFilter !== 'all') filters.priority = priorityFilter;
      if (typeFilter && typeFilter !== 'all') filters.type = typeFilter;
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      
      const result = await fetchTestCases(page, limit, filters);
      if (result) {
        setTotalPages(result.pagination.pages);
        setTotalTestCases(result.pagination.total);
      }
    };
    
    loadTestCases();
  }, [fetchTestCases, page, limit, searchTerm, priorityFilter, typeFilter, statusFilter]);

  const handleViewTestCase = (id: string) => {
    router.push(`/test-management/test-case/${id}`);
  };

  const handleEditTestCase = (id: string) => {
    router.push(`/test-management/test-case/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setTestCaseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (testCaseToDelete) {
      await deleteTestCase(testCaseToDelete);
      setDeleteDialogOpen(false);
      setTestCaseToDelete(null);
    }
  };

  const handleExecuteTestCase = (id: string) => {
    router.push(`/test-management/test-case/${id}/execute`);
  };

  const handleCreateTestCase = () => {
    router.push('/test-management/new-test-case');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && handlePageChange(page - 1)} 
              className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else {
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
              );
              if (i === 1) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              if (i === 3) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              );
              pageNum = page + i - 2;
            }
            
            return (
              <PaginationItem key={i}>
                <PaginationLink 
                  onClick={() => handlePageChange(pageNum)}
                  isActive={page === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < totalPages && handlePageChange(page + 1)} 
              className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Loading test cases...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-destructive">Error loading test cases: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
          <div>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>
              Manage your test cases and their execution status
            </CardDescription>
          </div>
          <Button onClick={handleCreateTestCase} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Test Case
          </Button>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search test cases..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Automated">Automated</SelectItem>
                <SelectItem value="Exploratory">Exploratory</SelectItem>
                <SelectItem value="Regression">Regression</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Passed">Passed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Not Executed">Not Executed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {testCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-4">No test cases found</p>
            <Button onClick={handleCreateTestCase} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create your first test case
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((testCase) => (
                    <TableRow key={testCase.id}>
                      <TableCell className="font-medium">{testCase.title}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{testCase.type}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(testCase.status)}>
                          {testCase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(testCase.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewTestCase(testCase.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTestCase(testCase.id)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExecuteTestCase(testCase.id)}
                            title="Execute"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(testCase.id)}
                            title="Delete"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {testCases.length} of {totalTestCases} test cases
              </p>
              {renderPagination()}
            </div>
          </>
        )}
      </CardContent>
      
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TestCasesList;