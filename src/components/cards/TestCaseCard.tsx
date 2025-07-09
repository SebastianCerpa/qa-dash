"use client";

import React from "react";
import { TestCase } from "@/store/enhancedStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface TestCaseCardProps {
  testCase: TestCase;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExecute: (id: string) => void;
  onClick: (id: string) => void;
}

export default function TestCaseCard({
  testCase,
  onEdit,
  onDelete,
  onExecute,
  onClick,
}: TestCaseCardProps) {
  const getPriorityVariant = (
    priority: string
  ): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
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
  ): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="p-6" onClick={() => onClick(testCase.id)}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {testCase.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant={getPriorityVariant(testCase.priority)}>
                {testCase.priority}
              </Badge>
              <Badge variant="secondary">{testCase.type}</Badge>
              <Badge variant={getStatusVariant(testCase.status)}>
                {testCase.status}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExecute(testCase.id)}
            >
              <PlayIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(testCase.id)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(testCase.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {testCase.description && (
          <p className="text-gray-600 mb-4 text-sm">{testCase.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            {testCase.steps.length} test steps
          </div>

          {testCase.executedAt && (
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 mr-2" />
              Last executed:{" "}
              {new Date(testCase.executedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {testCase.tags && testCase.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {testCase.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}