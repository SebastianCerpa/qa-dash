"use client";

import React, { useState, useMemo } from "react";
import { useEnhancedQAStore, QATicket } from "@/store/enhancedStore";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TicketForm from "../../components/tickets/TicketForm";
import TicketCard from "../../components/tickets/TicketCard";
import TicketModal from "../../components/tickets/TicketModal";
import StatusColumn from "../../components/tickets/StatusColumn";

type SortField = "title" | "status" | "priority" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";
type ViewMode = "grid" | "table" | "kanban";

interface FilterState {
  status: string[];
  priority: string[];
  assignee: string[];
  sprint: string[];
  tags: string[];
  search: string;
}

export default function TicketsPage() {
  const { tickets, deleteTicket, users, sprints, updateTicket } =
    useEnhancedQAStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<QATicket | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    assignee: [],
    sprint: [],
    tags: [],
    search: "",
  });

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const allTags = [...new Set(tickets.flatMap((t) => t.tags))];
    return {
      statuses: ["Open", "In Progress", "Review", "Passed", "Failed"],
      priorities: ["Low", "Medium", "High", "Critical"],
      assignees: users,
      sprints: sprints,
      tags: allTags,
    };
  }, [tickets, users, sprints]);

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(ticket.status)
      ) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(ticket.priority)
      ) {
        return false;
      }

      // Assignee filter
      if (filters.assignee.length > 0) {
        if (
          !ticket.assigneeId ||
          !filters.assignee.includes(ticket.assigneeId)
        ) {
          return false;
        }
      }

      // Sprint filter
      if (filters.sprint.length > 0) {
        if (!ticket.sprintId || !filters.sprint.includes(ticket.sprintId)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          ticket.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortField];
      let bValue: string | number | Date = b[sortField];

      if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(aValue as string | Date).getTime();
        bValue = new Date(bValue as string | Date).getTime();
      }

      if (sortField === "priority") {
        const priorityOrder = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tickets, filters, sortField, sortDirection]);

  // Group tickets by status for kanban view
  const groupedTickets = useMemo(() => {
    const statuses = ["Open", "In Progress", "Review", "Passed", "Failed"];
    return statuses.reduce((acc, status) => {
      acc[status] = filteredAndSortedTickets.filter(
        (ticket) => ticket.status === status
      );
      return acc;
    }, {} as Record<string, QATicket[]>);
  }, [filteredAndSortedTickets]);

  const handleAddTicket = () => {
    setEditingTicketId(null);
    setShowForm(true);
  };

  const handleEditTicket = (ticketId: string) => {
    setEditingTicketId(ticketId);
    setShowForm(true);
  };

  const handleViewTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    setSelectedTicket(ticket || null);
  };

  const handleCloseTicketModal = () => {
    setSelectedTicket(null);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      deleteTicket(ticketId);
    }
  };

  // Function for handling status change in KANBAN
  const handleTicketStatusChange = (
    ticketId: string,
    newStatus: QATicket["status"]
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      updateTicket(ticketId, {
        ...ticket,
        status: newStatus,
        updatedAt: new Date(),
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTicketId(null);
  };

  const updateFilter = (key: keyof FilterState, value: string[] | string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assignee: [],
      sprint: [],
      tags: [],
      search: "",
    });
  };

  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) return count + filter.length;
    if (typeof filter === "string" && filter) return count + 1;
    return count;
  }, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardLayout>
        {/** Style Header */}

        <div className="mb-8">
          {/* Unified Header with Search and Controls */}
          <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-6">
            <div className="flex flex-col space-y-4">
              {/* Top Row - Title and Create Button */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Track and manage quality assurance tickets
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAddTicket}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm px-4 py-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create issue
                </Button>
              </div>
              
              {/* Controls Row - Search, Filters, Sort and View Controls */}
              <div className="flex flex-row items-center justify-between pt-2 flex-wrap gap-3">
                {/* Left Section - Search and Filters */}
                <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={filters.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  {/* Filter Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`text-sm px-3 py-2 whitespace-nowrap ${activeFilterCount > 0
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "hover:bg-gray-50"
                      } transition-colors`}
                  >
                    <FunnelIcon className="h-4 w-4 mr-1" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="ml-1 bg-blue-600 text-white text-sm rounded-full px-1.5 py-0.5 font-medium">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Right Section - Sort and View */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={`${sortField}-${sortDirection}`}
                      onChange={(e) => {
                        const [field, direction] = e.target.value.split("-");
                        setSortField(field as SortField);
                        setSortDirection(direction as SortDirection);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none pr-8"
                    >
                      <option value="updatedAt-desc">Recently updated</option>
                      <option value="createdAt-desc">Recently created</option>
                      <option value="title-asc">Title A-Z</option>
                      <option value="title-desc">Title Z-A</option>
                      <option value="priority-desc">Priority: High to Low</option>
                      <option value="priority-asc">Priority: Low to High</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-sm transition-all flex items-center space-x-1 ${viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      title="List view"
                    >
                      <ViewColumnsIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`px-3 py-2 text-sm transition-all flex items-center space-x-1 border-l border-gray-300 ${viewMode === "kanban"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      title="Board view"
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Board</span>
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-2 text-sm transition-all flex items-center space-x-1 border-l border-gray-300 ${viewMode === "table"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      title="Table view"
                    >
                      <TableCellsIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-2 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Status
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {filterOptions.statuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center hover:bg-gray-50 rounded p-1 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status]
                            : filters.status.filter((s) => s !== status);
                          updateFilter("status", newStatus);
                        }}
                        className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Priority
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {filterOptions.priorities.map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center hover:bg-gray-50 rounded p-1 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          const newPriority = e.target.checked
                            ? [...filters.priority, priority]
                            : filters.priority.filter((p) => p !== priority);
                          updateFilter("priority", newPriority);
                        }}
                        className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Assignee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Assignee
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {filterOptions.assignees.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center hover:bg-gray-50 rounded p-1 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.assignee.includes(user.id)}
                        onChange={(e) => {
                          const newAssignee = e.target.checked
                            ? [...filters.assignee, user.id]
                            : filters.assignee.filter((a) => a !== user.id);
                          updateFilter("assignee", newAssignee);
                        }}
                        className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sprint Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Sprint
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {filterOptions.sprints.map((sprint) => (
                    <label
                      key={sprint.id}
                      className="flex items-center hover:bg-gray-50 rounded p-1 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.sprint.includes(sprint.id)}
                        onChange={(e) => {
                          const newSprint = e.target.checked
                            ? [...filters.sprint, sprint.id]
                            : filters.sprint.filter((s) => s !== sprint.id);
                          updateFilter("sprint", newSprint);
                        }}
                        className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {sprint.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Labels
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {filterOptions.tags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center hover:bg-gray-50 rounded p-1 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...filters.tags, tag]
                            : filters.tags.filter((t) => t !== tag);
                          updateFilter("tags", newTags);
                        }}
                        className="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View Content */}
        {viewMode === "table" && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {users.find(u => u.id === ticket.assigneeId)?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditTicket(ticket.id)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button onClick={() => handleDeleteTicket(ticket.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Linear Style Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {filteredAndSortedTickets.length}
              </span>{" "}
              {filteredAndSortedTickets.length === 1 ? "issue" : "issues"}
            </div>
            {activeFilterCount > 0 && (
              <div className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500 capitalize">{viewMode} view</div>
        </div>

        {/* Grid Content */}
        {viewMode === "grid" && (
          <div className="space-y-2">
            {filteredAndSortedTickets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No issues found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or create a new issue.
                </p>
                <Button
                  onClick={handleAddTicket}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Issue
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAndSortedTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onEdit={handleEditTicket}
                    onDelete={handleDeleteTicket}
                    onView={handleViewTicket}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === "kanban" && (
          <>
            <div className="flex justify-between space-x-2 pb-4">
              {Object.entries(groupedTickets).map(([status, statusTickets]) => (
                <StatusColumn
                  key={status}
                  status={status}
                  tickets={statusTickets}
                  onEdit={handleEditTicket}
                  onDelete={handleDeleteTicket}
                  onView={handleViewTicket}
                  onStatusChange={handleTicketStatusChange}
                />
              ))}
            </div>
          </>
        )}

        {/* Table View Content */}
        {viewMode === "table" && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {users.find(u => u.id === ticket.assigneeId)?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditTicket(ticket.id)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button onClick={() => handleDeleteTicket(ticket.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="mb-6">
            <Card title={editingTicketId ? "Edit Ticket" : "Create New Ticket"}>
              <TicketForm
                ticketId={editingTicketId || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm(false)}
              />
            </Card>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            onClose={handleCloseTicketModal}
            onEdit={handleEditTicket}
          />
        )}



        {/* Table View Placeholder */}
        {viewMode === "table" && (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0V5a2 2 0 012-2h2a2 2 0 002 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Table view coming soon
              </h3>
              <p className="text-gray-500 mb-6">
                We are building an advanced table view with sorting and filtering.
              </p>
              <div className="space-x-2">
                <Button
                  onClick={() => setViewMode("grid")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  List view
                </Button>
                <Button
                  onClick={() => setViewMode("kanban")}
                  size="sm"
                  variant="outline"
                >
                  Board view
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </DndProvider>
  );
}
