'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QATicket } from '@/store/enhancedStore';
import TicketCard from './TicketCard';

interface DraggableTicketCardProps {
  ticket: QATicket;
  onEdit: (ticketId: string) => void;
  onDelete: (ticketId: string) => void;
  onView: (ticketId: string) => void;
}

export default function DraggableTicketCard({
  ticket,
  onEdit,
  onDelete,
  onView,
}: DraggableTicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 50 : 'auto',
    boxShadow: isDragging ? '0 8px 16px rgba(0, 0, 0, 0.12)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? 'z-50 scale-[1.02]' : ''
      }`}
    >
      <div className={`${isDragging ? 'animate-pulse' : ''}`}>
        <TicketCard
          ticket={ticket}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
}