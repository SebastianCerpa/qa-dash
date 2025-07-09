"use client";

import React, { useRef } from "react";
import { QATicket, useEnhancedQAStore } from "@/store/enhancedStore";
import { useStore } from "@/store/useStore";
import { PencilIcon, TrashIcon, ClockIcon, EyeIcon, TagIcon, UserIcon } from "@heroicons/react/24/outline";
import { useDrag } from 'react-dnd';

interface TicketCardProps {
  ticket: QATicket;
  onEdit: (ticketId: string) => void;
  onDelete: (ticketId: string) => void;
  onView?: (ticketId: string) => void;
  isDragging?: boolean;
  onStatusChange?: (ticketId: string, newStatus: QATicket["status"]) => void;
}

export default function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onView,
  isDragging = false,
  onStatusChange,
}: TicketCardProps) {
  const { sprints, testCases } = useEnhancedQAStore();
  const { teamMembers } = useStore();
  
  const ref = useRef(null);
  
  // Configure drag and drop
  const [{ isDragging: dragging }, drag] = useDrag({
    type: 'TICKET',
    item: { id: ticket.id, status: ticket.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Apply the drag ref to our element
  drag(ref);

  // Find assignee among registered team members
  const assignee = teamMembers.find((member) => member.id === ticket.assigneeId);
  const sprint = sprints.find((s) => s.id === ticket.sprintId);
  const linkedTests = testCases.filter((tc) =>
    ticket.linkedTestCases.includes(tc.id)
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Passed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Extract creation order from ticket ID to create sequential numbering
// We'll use the timestamp part of the UUID if available, or fallback to a simple hash
  const getTicketNumber = () => {
    // Try to extract a numeric value from the ID that can be used for ordering
// This is a simplified approach - in a real app, you'd store a sequence number in the database
    const idHash = ticket.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use modulo to keep the number reasonable (1-999 range)
    const ticketNum = (idHash % 999) + 1;
    
    return `QA-${ticketNum}`;
  };
  
  const ticketNumber = getTicketNumber();

  return (
    <div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group ${dragging ? "shadow-lg scale-105 opacity-50" : ""} ${isDragging ? "rotate-1 shadow-lg" : ""}`}
      onClick={() => onView?.(ticket.id)}
      style={{ cursor: 'grab' }}
    >
      <div className="p-4 relative">
        {/* Status Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        {/* Header with Ticket Number */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">{ticketNumber}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors pr-16">
          {ticket.title}
        </h3>

        {/* Footer with Assignee and Priority */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 mt-1 border-t border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center">
            {assignee ? (
              <>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2 text-base font-semibold border-2 border-indigo-300 shadow-sm">
                  {assignee.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-gray-700">{assignee.name}</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-2 text-base font-medium border-2 border-gray-300 shadow-sm">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-gray-500">Sin asignar</span>
              </>
            )}
          </div>
          </div>

          {/* Priority indicator */}
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)} mr-1`}></div>
            <span className="text-sm text-gray-500">{ticket.priority}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
