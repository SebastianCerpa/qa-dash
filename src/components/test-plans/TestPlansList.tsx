import React, { useEffect, useState } from 'react';
import { useApiStore } from '@/store/apiStore';
import { TestPlan } from '@/store/enhancedStore';
import { 
  Table, 
  TableBody, 
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
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
import { AlertTriangle, FolderOpen, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface TestPlansListProps {
  showHeader?: boolean;
  limit?: number;
}

const TestPlansList: React.FC<TestPlansListProps> = ({ 
  showHeader = true,
  limit = 10
}) => {
  const router = useRouter();
  const { 
    testPlans, 
    isLoading, 
    error, 
    fetchTestPlans,
    deleteTestPlan 
  } = useApiStore();
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testPlanToDelete, setTestPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
    if (projectFilter && projectFilter !== 'all') filters.project_id = projectFilter;
    
    fetchTestPlans(page, limit, filters);
  }, [fetchTestPlans, page, limit, searchTerm, statusFilter, projectFilter]);

  const handleCreateTestPlan = () => {
    router.push('/test-management?tab=test-plans&action=new');
  };

  const handleViewTestPlan = (id: string) => {
    router.push(`/test-management/test-plan/${id}`);
  };

  const handleEditTestPlan = (id: string) => {
    router.push(`/test-management?tab=test-plans&edit=${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setTestPlanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (testPlanToDelete) {
      try {
        await deleteTestPlan(testPlanToDelete);
        setDeleteDialogOpen(false);
        setTestPlanToDelete(null);
      } catch (error) {
        console.error('Error deleting test plan:', error);
      }
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) {
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200';
    }
    switch(status.toLowerCase()) {
      case 'draft': 
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-200';
      case 'active': 
        return 'bg-gradient-to-r from-blue-100 to-indigo-200 text-indigo-700 border border-indigo-200';
      case 'completed': 
        return 'bg-gradient-to-r from-green-100 to-emerald-200 text-emerald-700 border border-emerald-200';
      default: 
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200';
    }
  };

  const renderPagination = () => {
    return (
      <Pagination className="flex justify-center">
        <PaginationContent className="bg-white shadow-sm rounded-lg border border-indigo-100 p-1">
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className={`${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200`}
            />
          </PaginationItem>
          
          {[...Array(3)].map((_, i) => {
            const pageNum = page - 1 + i;
            if (pageNum < 1) return null;
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  isActive={pageNum === page}
                  onClick={() => setPage(pageNum)}
                  className={pageNum === page ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800'}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(prev => prev + 1)}
              className={`${testPlans.length < limit ? 'pointer-events-none opacity-50' : 'cursor-pointer'} text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <Card className="w-full border-none shadow-md hover:shadow-lg transition-all duration-300">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-b border-gray-100">
          <div>
            <CardTitle className="text-indigo-700">Test Plans</CardTitle>
            <CardDescription>Manage your test plans and their execution</CardDescription>
          </div>
          <Button onClick={handleCreateTestPlan} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Create Test Plan
          </Button>
        </CardHeader>
      )}
      
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-row space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Search test plans..."
                className="pl-9 border-indigo-100 focus:border-indigo-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-indigo-100 focus:border-indigo-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-indigo-100 shadow-md">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Project filter would be populated from actual projects */}
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[180px] border-indigo-100 focus:border-indigo-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent className="border-indigo-100 shadow-md">
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="project1">Project 1</SelectItem>
                <SelectItem value="project2">Project 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg p-4 border border-red-100">
              <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              {error}
            </div>
          ) : testPlans.length === 0 ? (
            <div className="text-center py-12 bg-indigo-50/50 rounded-lg p-8 border border-indigo-100">
              <FolderOpen className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
              <p className="text-indigo-700 font-medium mb-2">No test plans found</p>
              <p className="text-muted-foreground mb-4">Create your first test plan to get started.</p>
              <Button onClick={handleCreateTestPlan} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Create Test Plan
              </Button>
            </div>
          ) : (
            <Table className="border-collapse">
              <TableHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <TableRow className="border-b border-indigo-100">
                  <TableHead className="text-indigo-700 font-medium">Name</TableHead>
                  <TableHead className="text-indigo-700 font-medium">Status</TableHead>
                  <TableHead className="text-indigo-700 font-medium">Project</TableHead>
                  <TableHead className="text-indigo-700 font-medium">Created</TableHead>
                  <TableHead className="text-indigo-700 font-medium">Test Cases</TableHead>
                  <TableHead className="text-indigo-700 font-medium">Progress</TableHead>
                  <TableHead className="text-right text-indigo-700 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testPlans.map((testPlan: TestPlan) => {
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
                    <TableRow key={testPlan.id} className="cursor-pointer hover:bg-indigo-50/30 transition-colors duration-150 border-b border-indigo-50" onClick={() => handleViewTestPlan(testPlan.id)}>
                      <TableCell className="font-medium text-indigo-700">{testPlan.name}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(testPlan.status)} shadow-sm font-medium px-2.5 py-0.5`}>
                          {testPlan.status || 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>{testPlan.projectInfo || 'N/A'}</TableCell>
                      <TableCell>{formatDate(testPlan.createdAt)}</TableCell>
                      <TableCell>{executionSummary.totalTests}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-indigo-700">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" onClick={() => handleEditTestPlan(testPlan.id)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-200">
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(testPlan.id)} className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-all duration-200">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && testPlans.length > 0 && (
            <div className="mt-4">
              {renderPagination()}
            </div>
          )}
        </div>
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-red-100 shadow-lg">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-semibold text-red-700">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This action cannot be undone. This will permanently delete the test plan
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
            <AlertDialogCancel className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 shadow-sm hover:shadow-md border-none"
            >
              Delete Test Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TestPlansList;