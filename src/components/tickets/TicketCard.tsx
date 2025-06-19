"use client";

import React from "react";
import { QATicket, useEnhancedQAStore } from "@/store/enhancedStore";
import { PencilIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";

interface TicketCardProps {
  ticket: QATicket;
  onEdit: (ticketId: string) => void;
  onDelete: (ticketId: string) => void;
  onView?: (ticketId: string) => void;
  isDragging?: boolean;
}

export default function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onView,
  isDragging = false,
}: TicketCardProps) {
  const { users, sprints, testCases } = useEnhancedQAStore();

  const assignee = users.find((u) => u.id === ticket.assigneeId);
  const sprint = sprints.find((s) => s.id === ticket.sprintId);
  const linkedTests = testCases.filter((tc) =>
    ticket.linkedTestCases.includes(tc.id)
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 group ${
        isDragging ? "shadow-lg scale-105 rotate-2" : ""
      }`}
    >
      {/* Linear/Jira-Style Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            {/* Priority Indicator */}
            <div
              className={`w-1 h-6 rounded-full ${
                ticket.priority === "Critical"
                  ? "bg-red-500"
                  : ticket.priority === "High"
                  ? "bg-orange-500"
                  : ticket.priority === "Medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            ></div>

            {/* Title */}
            <h3
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex-1 line-clamp-2"
              onClick={() => onView?.(ticket.id)}
            >
              {ticket.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(ticket.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(ticket.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Status and ID */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                ticket.status === "Open"
                  ? "bg-gray-100 text-gray-800"
                  : ticket.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : ticket.status === "Testing"
                  ? "bg-yellow-100 text-yellow-800"
                  : ticket.status === "Review"
                  ? "bg-orange-100 text-orange-800"
                  : ticket.status === "Closed"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {ticket.status}
            </span>
            <span className="text-xs text-gray-500">#{ticket.id}</span>
          </div>
          <span
            className={`text-xs font-medium ${
              ticket.priority === "Critical"
                ? "text-red-600"
                : ticket.priority === "High"
                ? "text-orange-600"
                : ticket.priority === "Medium"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {ticket.priority}
          </span>
        </div>

        {/* Description */}
        {ticket.description && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">
              {ticket.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {ticket.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {ticket.tags.length > 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                  +{ticket.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Linear/Jira-Style Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {assignee && (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-white">
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs">{assignee.name.split(" ")[0]}</span>
              </div>
            )}

            {sprint && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{sprint.name}</span>
              </div>
            )}

            {linkedTests.length > 0 && (
              <div className="flex items-center space-x-1">
                <span>🧪</span>
                <span>{linkedTests.length}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {ticket.estimatedHours && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>
                  {ticket.actualHours || 0}/{ticket.estimatedHours}h
                </span>
              </div>
            )}
            <span>{formatDate(ticket.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
