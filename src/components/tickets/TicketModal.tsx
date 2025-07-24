"use client";

import React, { useEffect } from "react";
import { QATicket, useEnhancedQAStore } from "@/store/enhancedStore";
import { useStore } from "@/store/useStore";
import { XMarkIcon, PencilIcon, ClockIcon, TagIcon, UserIcon, CalendarIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";

interface TicketModalProps {
  ticket: QATicket | null;
  onClose: () => void;
  onEdit: (ticketId: string) => void;
}

export default function TicketModal({ ticket, onClose, onEdit }: TicketModalProps) {
  const { sprints, testCases } = useEnhancedQAStore();
  const { teamMembers } = useStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof document !== 'undefined') {
      // Add overflow hidden to body when modal is open
      document.body.style.overflow = 'hidden';

      // Focus trap and escape key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [onClose]);

  if (!ticket) return null;

  // Find assignee among registered team members
  const assignee = teamMembers.find((member) => member.id === ticket.assigneeId);
  const sprint = sprints.find((s) => s.id === ticket.sprintId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // We'll use ReactMarkdown instead of custom rendering

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "text-red-600";
      case "High":
        return "text-orange-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Review":
        return "bg-yellow-100 text-yellow-800";
      case "Passed":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 transition-opacity duration-300"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative animate-fade-in-up border border-gray-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white px-6 py-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="overflow-hidden">
                <h3 className="text-xl font-semibold text-gray-900 truncate pr-4 tracking-tight">{ticket.title}</h3>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md">#{ticket.id}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityTextColor(ticket.priority)} bg-gray-50 px-3 py-1 rounded-full`}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(ticket.id)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:rotate-90"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 130px)' }}>
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                {ticket.description && (
                  <div className="transition-all duration-300 hover:translate-y-[-2px]">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="bg-blue-100 w-1.5 h-5 rounded-sm mr-2"></span>
                      Description
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-5 prose prose-sm max-w-none shadow-sm border border-gray-100">
                      <ReactMarkdown>{ticket.description}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Acceptance Criteria */}
                {ticket.acceptanceCriteria && (
                  <div className="transition-all duration-300 hover:translate-y-[-2px]">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="bg-green-100 w-1.5 h-5 rounded-sm mr-2"></span>
                      Acceptance Criteria
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-5 prose prose-sm max-w-none shadow-sm border border-gray-100">
                      <ReactMarkdown>{ticket.acceptanceCriteria}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="transition-all duration-300 hover:translate-y-[-2px]">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="bg-purple-100 w-1.5 h-5 rounded-sm mr-2"></span>
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-200"
                        >
                          <TagIcon className="h-3 w-3 mr-1.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Metadata */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-5 mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Details</h4>

                  <div className="space-y-5">
                    {/* Assignee */}
                    <div className="flex items-start">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Assignee</p>
                        {assignee ? (
                          <div className="flex items-center mt-1">
                            <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium mr-1.5">
                              {assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-medium">{assignee.name}</p>
                          </div>
                        ) : (
                          <div className="flex items-center mt-1">
                            <div className="w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium mr-1.5">
                              <UserIcon className="h-3 w-3" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">{teamMembers.length > 0 ? teamMembers[0].name : "Unassigned"}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sprint */}
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Sprint</p>
                        {sprint ? (
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></div>
                            <p className="text-sm font-medium">{sprint.name}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-gray-500">No Sprint</p>
                        )}
                      </div>
                    </div>

                    {/* Time Tracking */}
                    {ticket.estimatedHours !== undefined && ticket.estimatedHours > 0 && (
                      <div className="flex items-start">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="w-full">
                          <p className="text-sm text-gray-500">Time Tracking</p>
                          <p className="text-sm font-medium mt-1">
                            {ticket.actualHours || 0}/{ticket.estimatedHours}h spent
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((ticket.actualHours || 0) / ticket.estimatedHours) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Created & Updated */}
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm">{formatDateTime(ticket.createdAt)}</p>
                        <p className="text-sm text-gray-500 mt-2">Updated</p>
                        <p className="text-sm">{formatDateTime(ticket.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Items */}
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Linked Items</h4>
                  {ticket.linkedTestCases && ticket.linkedTestCases.length > 0 ? (
                    <div className="space-y-2">
                      {ticket.linkedTestCases.map((testId, index) => {
                        const test = testCases.find(t => t.id === testId);
                        return test ? (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200">
                            <div className="flex items-center">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                              <span className="font-medium truncate">{test.title}</span>
                            </div>
                            <span className="text-sm text-gray-500 font-mono">#{test.id}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No linked test cases
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end shadow-inner">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
