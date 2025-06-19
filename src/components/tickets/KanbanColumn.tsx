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
  'Open': '📋',
  'In Progress': '🔄',
  'Testing': '🧪',
  'Review': '👀',
  'Closed': '✅',
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

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed p-4 min-h-[500px] transition-all duration-200 ${
        colorClass
      } ${
        isOver ? 'border-blue-400 bg-blue-100 scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{STATUS_ICONS[status]}</span>
          <h3 className="font-semibold text-gray-900">{status}</h3>
        </div>
        <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
          {tickets.length}
        </span>
      </div>

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
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          Drop tickets here
        </div>
      )}
    </div>
  );
}