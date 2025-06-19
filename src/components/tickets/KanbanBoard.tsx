"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { QATicket } from "@/store/enhancedStore";
import KanbanColumn from "./KanbanColumn";
import TicketCard from "./TicketCard";

interface KanbanBoardProps {
  tickets: QATicket[];
  onTicketStatusChange: (
    ticketId: string,
    newStatus: QATicket["status"]
  ) => void;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
  onViewTicket: (ticketId: string) => void;
}

const STATUSES: QATicket["status"][] = [
  "Open",
  "In Progress",
  "Testing",
  "Review",
  "Closed",
];

const STATUS_COLORS = {
  Open: "bg-gray-50 border-gray-200",
  "In Progress": "bg-blue-50 border-blue-200",
  Testing: "bg-yellow-50 border-yellow-200",
  Review: "bg-purple-50 border-purple-200",
  Closed: "bg-green-50 border-green-200",
};

export default function KanbanBoard({
  tickets,
  onTicketStatusChange,
  onEditTicket,
  onDeleteTicket,
  onViewTicket,
}: Readonly<KanbanBoardProps>) {
  const [activeTicket, setActiveTicket] = React.useState<QATicket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tickets by status
  const ticketsByStatus = React.useMemo(() => {
    const groups: Record<QATicket["status"], QATicket[]> = {
      Open: [],
      "In Progress": [],
      Testing: [],
      Review: [],
      Closed: [],
    };

    tickets.forEach((ticket) => {
      groups[ticket.status].push(ticket);
    });

    return groups;
  }, [tickets]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as QATicket["status"];

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket && ticket.status !== newStatus) {
      onTicketStatusChange(ticketId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STATUSES.map((status) => {
          const statusTickets = ticketsByStatus[status];
          return (
            <KanbanColumn
              key={status}
              status={status}
              tickets={statusTickets}
              colorClass={STATUS_COLORS[status]}
              onEditTicket={onEditTicket}
              onDeleteTicket={onDeleteTicket}
              onViewTicket={onViewTicket}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="transform rotate-3 opacity-90">
            <TicketCard
              ticket={activeTicket}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={() => {}}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
