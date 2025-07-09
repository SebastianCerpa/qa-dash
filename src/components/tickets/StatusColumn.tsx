"use client";

import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { QATicket } from "@/store/enhancedStore";
import TicketCard from "./TicketCard";

interface StatusColumnProps {
  status: string;
  tickets: QATicket[];
  onEdit: (ticketId: string) => void;
  onDelete: (ticketId: string) => void;
  onView: (ticketId: string) => void;
  onStatusChange: (ticketId: string, newStatus: QATicket["status"]) => void;
}

export default function StatusColumn({
  status,
  tickets,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}: StatusColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Configure drop target
  const [{ isOver }, drop] = useDrop({
    accept: "TICKET",
    drop: (item: { id: string; status: string }) => {
      if (item.status !== status) {
        onStatusChange(item.id, status as QATicket["status"]);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Apply the drop ref to our element
  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex-shrink-0 w-64 transition-all duration-200 ${isOver ? "bg-blue-50 ring-2 ring-blue-300 rounded-lg" : ""}`}
    >
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <h3 className="font-medium text-gray-900 text-sm flex items-center justify-between">
          <span className="uppercase tracking-wide">{status}</span>
          <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">
            {tickets.length}
          </span>
        </h3>
        {isOver && (
          <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-1 rounded text-center">
            Soltar ticket aquí
          </div>
        )}
      </div>
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}