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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <TicketCard
        ticket={ticket}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        isDragging={isDragging}
      />
    </div>
  );
}