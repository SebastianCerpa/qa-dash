'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { QATicket } from '@/store/enhancedStore';
import DraggableTicketCard from './DraggableTicketCard';

interface KanbanColumnProps {
  status: QATicket['status'];
  tickets: QATicket[];
  colorClass: string;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
  onViewTicket: (ticketId: string) => void;
}

const STATUS_ICONS = {
  'Open': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-200">
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
  ),
  'In Progress': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 border border-blue-200">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  ),
  'Testing': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 border border-yellow-200">
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
  ),
  'Review': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 border border-purple-200">
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </div>
  ),
  'Passed': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 border border-green-200">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  'Failed': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 border border-red-200">
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  'Closed': (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-200">
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
};

export default function KanbanColumn({
  status,
  tickets,
  colorClass,
  onEditTicket,
  onDeleteTicket,
  onViewTicket,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const ticketIds = tickets.map(ticket => ticket.id);

  // Get status-specific styles
  const getStatusHeaderClass = () => {
    switch(status) {
      case 'Open': return 'from-gray-100 to-gray-50 border-gray-200';
      case 'In Progress': return 'from-blue-100 to-blue-50 border-blue-200';
      case 'Testing': return 'from-yellow-100 to-yellow-50 border-yellow-200';
      case 'Review': return 'from-purple-100 to-purple-50 border-purple-200';
      case 'Passed': return 'from-green-100 to-green-50 border-green-200';
      case 'Failed': return 'from-red-100 to-red-50 border-red-200';
      case 'Closed': return 'from-gray-100 to-gray-50 border-gray-200';
      default: return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border shadow-sm overflow-hidden transition-all duration-200 ${colorClass} ${
        isOver ? 'border-blue-400 shadow-md ring-2 ring-blue-200 scale-[1.02]' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`bg-gradient-to-b ${getStatusHeaderClass()} border-b px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {STATUS_ICONS[status]}
            <h3 className="font-semibold text-gray-900">{status}</h3>
          </div>
          <span className="bg-white bg-opacity-80 backdrop-blur-sm text-gray-700 text-sm font-medium px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-3 min-h-[500px] bg-white bg-opacity-80">
        <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <DraggableTicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={onEditTicket}
                onDelete={onDeleteTicket}
                onView={onViewTicket}
              />
            ))}
          </div>
        </SortableContext>

        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 mt-4 border-2 border-dashed rounded-lg border-gray-200 bg-gray-50 bg-opacity-50">
            <div className="text-gray-400 text-sm mb-1">Drop tickets here</div>
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
