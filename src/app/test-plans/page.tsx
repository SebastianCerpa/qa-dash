'use client';

import React from 'react';
import TestPlansList from '@/components/test-plans/TestPlansList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiStore } from '@/store/apiStore';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestPlansPage() {
  const { testPlans } = useApiStore();
  const router = useRouter();
  
  // Calculate summary statistics
  const stats = {
    total: testPlans.length,
    draft: testPlans.filter(tp => tp.status?.toLowerCase() === 'draft').length,
    active: testPlans.filter(tp => tp.status?.toLowerCase() === 'active').length,
    completed: testPlans.filter(tp => tp.status?.toLowerCase() === 'completed').length,
  };

  const handleCreateTestPlan = () => {
    router.push('/test-plans/new');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">Test Plans</h1>
          <p className="text-muted-foreground mt-1">Manage and track your test plans and their execution</p>
        </div>
        <Button onClick={handleCreateTestPlan} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Create Test Plan
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardTitle className="text-sm font-medium">Total Test Plans</CardTitle>
            <div className="rounded-full p-2 bg-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path><path d="M9 8h6"></path></svg>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Test plans in the system</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-gray-500/10 to-slate-500/10">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <div className="rounded-full p-2 bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">Plans in draft status</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="rounded-full p-2 bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Plans currently active</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="rounded-full p-2 bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Plans completed successfully</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-100 inline-flex">
          <TabsList className="bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              All Test Plans
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Recent
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Draft
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Completed
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <TestPlansList />
        </TabsContent>
        <TabsContent value="recent" className="mt-4">
          <TestPlansList limit={5} />
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          <TestPlansList />
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <TestPlansList />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TestPlansList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
