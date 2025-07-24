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
  "Passed",
  "Failed",
  "Closed",
];

const STATUS_COLORS = {
  Open: "bg-white border-gray-200",
  "In Progress": "bg-white border-blue-200",
  Testing: "bg-white border-yellow-200",
  Review: "bg-white border-purple-200",
  Passed: "bg-white border-green-200",
  Failed: "bg-white border-red-200",
  Closed: "bg-white border-gray-300",
};

// Define workflow direction indicators
const WORKFLOW_INDICATORS = {
  Open: ">",
  "In Progress": ">",
  Testing: ">",
  Review: ">",
  Passed: ">",
  Failed: ">",
  Closed: "",
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
      Passed: [],
      Failed: [],
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
      <div className="p-1 bg-gray-50 rounded-xl shadow-inner">
        <div className="flex flex-col md:flex-row gap-4 p-3 overflow-x-auto">
          {STATUSES.map((status, index) => {
            const statusTickets = ticketsByStatus[status];
            const isLastColumn = index === STATUSES.length - 1;
            
            return (
              <div key={status} className="flex-1 min-w-[280px] flex flex-col">
                <KanbanColumn
                  status={status}
                  tickets={statusTickets}
                  colorClass={STATUS_COLORS[status]}
                  onEditTicket={onEditTicket}
                  onDeleteTicket={onDeleteTicket}
                  onViewTicket={onViewTicket}
                />
                
                {!isLastColumn && (
                  <div className="hidden md:flex justify-center mt-2 text-gray-400">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="transform rotate-2 opacity-95 shadow-xl">
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
