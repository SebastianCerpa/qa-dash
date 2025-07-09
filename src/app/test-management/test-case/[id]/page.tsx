"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnhancedQAStore, TestCase, TestStep } from "@/store/enhancedStore";
import { ErrorDialog } from "@/components/ui/error-dialog";
import TestCaseDetails from "@/components/test-cases/TestCaseDetails";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function TestCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tickets } = useEnhancedQAStore();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [testCaseId, setTestCaseId] = useState<string | null>(null);

  // Función auxiliar para formatear los datos del test case
  const formatTestCaseData = (data: any): TestCase => {
    return {
      ...data,
      steps: Array.isArray(data.steps) ? data.steps : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      expectedResult: data.expected_result || "",
      actualResult: data.actual_result || "",
      preconditions: data.preconditions || "",
      environment: data.environment || "",
      estimatedTime: data.estimated_time || 0,
      actualTime: data.actual_time || 0,
      linkedTicketIds: data.linked_task ? [data.linked_task.id] : [],
      assigneeId: data.assigned_to || "",
      executedBy: data.last_executed_by || "",
      executedAt: data.last_executed ? new Date(data.last_executed) : undefined,
      ticketId: data.ticket_id || "",
      testPlanId: data.test_plan_id || "",
      automationScript: data.automation_script || "",
    };
  };
  
  // Función para obtener los datos del caso de prueba
  const fetchTestCase = async () => {
    if (params.id) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/test-cases/${params.id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        const data = await response.json();
        
        // Usar la función auxiliar para formatear los datos
        const formattedTestCase = formatTestCaseData(data);
        setTestCase(formattedTestCase);
      } catch (error: any) {
        console.error('Error fetching test case:', error);
        // Guardar el mensaje de error y mostrar el diálogo
        setError(error.message || "Caso de prueba no encontrado");
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setTestCaseId(id);
      fetchTestCase();
    }
  }, [params.id]);

  const linkedTicket = testCase?.ticketId
    ? tickets.find((t) => t.id === testCase.ticketId)
    : null;

  const handleEdit = () => {
    router.push(`/test-management/test-case/${testCase?.id}/edit`);
  };

  const handleDelete = async () => {
    if (testCase && window.confirm("¿Está seguro de que desea eliminar este caso de prueba?")) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/test-cases/${testCase.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        
        router.push("/test-management");
      } catch (error: any) {
        console.error('Error deleting test case:', error);
        setError(`Error al eliminar el caso de prueba: ${error.message}`);
        setShowErrorDialog(true);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExecute = async (status: string) => {
    if (!testCase) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/test-cases/${testCase.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status.toUpperCase(), // Asegurar que el estado esté en mayúsculas
          bug_report: status.toUpperCase() === 'FAILED' ? {
            title: `Bug en caso de prueba: ${testCase.title}`,
            description: testCase.actualResult || 'Sin resultado actual',
          } : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Actualizar el estado local con los datos actualizados
      await fetchTestCase();
    } catch (error: any) {
      console.error('Error executing test case:', error);
      setError(`Error al ejecutar el caso de prueba: ${error.message}`);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityVariant = (
    priority: string
  ): "default" | "secondary" | "destructive" | "warning" | "success" | "outline" => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "warning";
      case "Medium":
        return "secondary";
      case "Low":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "warning" | "success" | "outline" => {
    switch (status) {
      case "Passed":
        return "success";
      case "Failed":
        return "destructive";
      case "Blocked":
        return "warning";
      case "Not Executed":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading test case...</p>
      </div>
    );
  }

  // Mostrar el ErrorDialog solo cuando hay un error y no hay testCase
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading test case...</p>
      </div>
    );
  }

  if (!testCase || !testCaseId) {
    return (
      <>
        <ErrorDialog 
          open={showErrorDialog} 
          onClose={() => {
            setShowErrorDialog(false);
            router.push('/test-management');
          }} 
          message={error || "Caso de prueba no encontrado"} 
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Caso de prueba no encontrado</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ErrorDialog 
        open={showErrorDialog && !!error} 
        onClose={() => {
          setShowErrorDialog(false);
        }} 
        message={error || ""} 
      />
      
      {/* Usar el componente TestCaseDetails para mostrar los detalles del test case */}
      <TestCaseDetails testCaseId={testCaseId} />
    </>
  );
}