"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useEnhancedQAStore, QATicket } from "@/store/enhancedStore";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import {
  XMarkIcon,
  PlusIcon,
  TagIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  TicketIcon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import UserSelector from "./UserSelector";

interface TicketFormProps {
  ticketId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TicketFormData {
  title: string;
  description: string;
  acceptanceCriteria: string;
  priority: QATicket["priority"];
  status: QATicket["status"];
  sprintId?: string;
  assigneeId?: string;
  tags: string[];
  estimatedHours?: number;
}

const ticketTemplates = {
  bug: {
    title: "Bug: [Brief Description]",
    description:
      "## Bug Description\n\n**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Behavior:**\n\n\n**Actual Behavior:**\n\n\n**Environment:**\n- Browser: \n- OS: \n- Version: \n\n**Additional Information:**\n",
    acceptanceCriteria:
      "**Given** the user is on [page/feature]\n**When** they [action]\n**Then** the system should [expected behavior]\n\n**Acceptance Criteria:**\n- [ ] Bug is reproduced consistently\n- [ ] Root cause is identified\n- [ ] Fix is implemented\n- [ ] Regression tests pass\n- [ ] No new bugs introduced",
    tags: ["bug"],
    priority: "Medium" as const,
  },
  feature: {
    title: "Feature: [Feature Name]",
    description:
      "## Feature Description\n\n**User Story:**\nAs a [user type], I want [functionality] so that [benefit].\n\n**Business Value:**\n\n\n**Technical Requirements:**\n- \n- \n\n**Dependencies:**\n- \n\n**Mockups/Wireframes:**\n[Attach or link to designs]",
    acceptanceCriteria:
      "**Given** [initial context]\n**When** [action is performed]\n**Then** [expected outcome]\n\n**Acceptance Criteria:**\n- [ ] Feature works as designed\n- [ ] UI/UX matches specifications\n- [ ] Performance requirements met\n- [ ] Accessibility standards followed\n- [ ] Cross-browser compatibility verified\n- [ ] Mobile responsiveness confirmed",
    tags: ["feature", "enhancement"],
    priority: "Medium" as const,
  },
  improvement: {
    title: "Improvement: [Area of Improvement]",
    description:
      "## Improvement Description\n\n**Current State:**\n\n\n**Proposed Improvement:**\n\n\n**Benefits:**\n- \n- \n\n**Impact Analysis:**\n- Performance: \n- User Experience: \n- Maintenance: ",
    acceptanceCriteria:
      "**Acceptance Criteria:**\n- [ ] Current functionality is preserved\n- [ ] Improvement delivers expected benefits\n- [ ] Performance metrics show improvement\n- [ ] No regression in existing features\n- [ ] Documentation is updated",
    tags: ["improvement", "optimization"],
    priority: "Low" as const,
  },
  security: {
    title: "Security: [Security Issue]",
    description:
      "## Security Issue Description\n\n**Vulnerability Type:**\n\n\n**Risk Level:**\n\n\n**Affected Components:**\n- \n- \n\n**Potential Impact:**\n\n\n**Recommended Solution:**\n",
    acceptanceCriteria:
      "**Security Acceptance Criteria:**\n- [ ] Vulnerability is patched\n- [ ] Security scan passes\n- [ ] Penetration testing completed\n- [ ] Security review approved\n- [ ] Compliance requirements met\n- [ ] Security documentation updated",
    tags: ["security", "critical"],
    priority: "High" as const,
  },
};

export default function TicketForm({
  ticketId,
  onSuccess,
  onCancel,
}: TicketFormProps) {
  const { tickets, addTicket, updateTicket, sprints } = useEnhancedQAStore();
  const { teamMembers } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof ticketTemplates | "blank"
  >("blank");
  const [newTag, setNewTag] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    defaultValues: {
      title: "",
      description: "",
      acceptanceCriteria: "",
      priority: "Medium",
      status: "Open",
      tags: [],
      estimatedHours: 0,
    },
  });

  const watchedTags = watch("tags") || [];
  const watchedAcceptanceCriteria = watch("acceptanceCriteria");

  useEffect(() => {
    if (ticketId) {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        reset({
          title: ticket.title,
          description: ticket.description,
          acceptanceCriteria: ticket.acceptanceCriteria,
          priority: ticket.priority,
          status: ticket.status,
          sprintId: ticket.sprintId,
          assigneeId: ticket.assigneeId,
          tags: ticket.tags,
          estimatedHours: ticket.estimatedHours,
        });
      }
    } else {
      // For new tickets, automatically assign to the first available team member
// We only assign team members registered in the "Teams" section
      const { teamMembers } = useStore.getState();
      if (teamMembers.length > 0) {
        setValue('assigneeId', teamMembers[0].id);
      }
    }
  }, [ticketId, tickets, reset, setValue]);

  const applyTemplate = (templateKey: keyof typeof ticketTemplates) => {
    const template = ticketTemplates[templateKey];
    setValue("title", template.title);
    setValue("description", template.description);
    setValue("acceptanceCriteria", template.acceptanceCriteria);
    setValue("priority", template.priority);
    setValue("tags", template.tags);
  };

  const addTag = () => {
    if (newTag && !watchedTags.includes(newTag)) {
      setValue("tags", [...watchedTags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = (data: TicketFormData) => {
    if (ticketId) {
      updateTicket(ticketId, data);
    } else {
      // Use the first team member as reporterId if exists, or 'system' if no members
      const reporterId = teamMembers.length > 0 ? teamMembers[0].id : 'system';
      
      addTicket({
        ...data,
        reporterId,
        linkedTestCases: [],
        attachments: [],
      });
    }
    onSuccess?.();
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(
        /- \[ \] (.*$)/gim,
        '<li class="ml-4"><input type="checkbox" disabled class="mr-2">$1</li>'
      )
      .replace(
        /- \[x\] (.*$)/gim,
        '<li class="ml-4"><input type="checkbox" checked disabled class="mr-2">$1</li>'
      )
      .replace(/\n/g, "<br>");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <TicketIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {ticketId ? "Edit Ticket" : "Create New Ticket"}
            </h3>
            <p className="text-blue-100 text-sm">
              {ticketId
                ? "Update ticket details and settings"
                : "Fill in the details to create a new ticket"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* Template Selection */}
        {!ticketId && (
          <div className="space-y-2">
            <label
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <SparklesIcon className="h-4 w-4 mr-2 text-gray-500" />
              Start with a template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate("blank")}
                className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${selectedTemplate === "blank"
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
              >
                Blank
              </button>
              {Object.keys(ticketTemplates).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(key as keyof typeof ticketTemplates);
                    applyTemplate(key as keyof typeof ticketTemplates);
                  }}
                  className={`p-3 text-sm rounded-lg border-2 capitalize transition-all duration-200 ${selectedTemplate === key
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
            Ticket Title
          </label>
          <div className="relative">
            <Controller
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <input
                  {...field}
                  id="title"
                  type="text"
                  placeholder="Enter a descriptive ticket title..."
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${focusedField === "title"
                      ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    } focus:outline-none text-gray-900 placeholder-gray-500`}
                />
              )}
            />
            {errors.title && (
              <div className="mt-2 flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.title.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
            Description
          </label>
          <div className="relative">
            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="description"
                  rows={8}
                  placeholder="Provide detailed information about this ticket..."
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${focusedField === "description"
                      ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    } focus:outline-none text-gray-900 placeholder-gray-500`}
                />
              )}
            />
            {errors.description && (
              <div className="mt-2 flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.description.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acceptance Criteria Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="acceptanceCriteria"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
              Acceptance Criteria
            </label>
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="text-sm px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-all duration-200 flex items-center shadow-md border-2 border-gray-300 hover:border-gray-400"
            >
              {isPreviewMode ? (
                <>
                  <PencilIcon className="h-3 w-3 mr-1.5" /> Edit
                </>
              ) : (
                <>
                  <EyeIcon className="h-3 w-3 mr-1.5" /> Preview
                </>
              )}
            </button>
          </div>
          <div className="relative">
            {isPreviewMode ? (
              <div
                className="w-full min-h-[150px] px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(watchedAcceptanceCriteria || ""),
                }}
              />
            ) : (
              <Controller
                name="acceptanceCriteria"
                control={control}
                rules={{ required: "Acceptance criteria is required" }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="acceptanceCriteria"
                    rows={6}
                    placeholder="List the conditions that must be met for this ticket to be considered complete...\n\nExample:\nGiven [context]\nWhen [action]\nThen [outcome]\n\n- [ ] Criteria 1\n- [ ] Criteria 2"
                    onFocus={() => setFocusedField("acceptanceCriteria")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${focusedField === "acceptanceCriteria"
                        ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      } focus:outline-none text-gray-900 placeholder-gray-500`}
                  />
                )}
              />
            )}
            {errors.acceptanceCriteria && (
              <div className="mt-2 flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.acceptanceCriteria.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Priority, Status and Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-gray-500" />
              Priority
            </label>
            <div className="relative">
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="priority"
                    onFocus={() => setFocusedField("priority")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border-2 rounded-lg appearance-none bg-white transition-all duration-200 ${focusedField === "priority"
                        ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      } focus:outline-none text-gray-900`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                )}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
              Status
            </label>
            <div className="relative">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="status"
                    onFocus={() => setFocusedField("status")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border-2 rounded-lg appearance-none bg-white transition-all duration-200 ${focusedField === "status"
                        ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      } focus:outline-none text-gray-900`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                )}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sprint"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              Sprint
            </label>
            <div className="relative">
              <Controller
                name="sprintId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="sprint"
                    onFocus={() => setFocusedField("sprint")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border-2 rounded-lg appearance-none bg-white transition-all duration-200 ${focusedField === "sprint"
                        ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      } focus:outline-none text-gray-900`}
                  >
                    <option value="">No Sprint</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="assignee"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              Assignee
            </label>
            <UserSelector
              control={control}
              name="assigneeId"
              label=""
              className=""
            />
          </div>
        </div>

        {/* Estimated Hours */}
        <div className="space-y-2">
          <label
            htmlFor="estimatedHours"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
            Estimated Hours
          </label>
          <div className="relative">
            <Controller
              name="estimatedHours"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Enter time estimate in hours"
                  onFocus={() => setFocusedField("estimatedHours")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${focusedField === "estimatedHours"
                      ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    } focus:outline-none text-gray-900 placeholder-gray-500`}
                />
              )}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label
            htmlFor="tags"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            <TagIcon className="h-4 w-4 mr-2 text-gray-500" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {watchedTags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newTags = [...watchedTags];
                    newTags.splice(index, 1);
                    setValue("tags", newTags);
                  }}
                  className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onFocus={() => setFocusedField("tags")}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTag.trim()) {
                  e.preventDefault();
                  const updatedTags = [...watchedTags, newTag.trim()];
                  setValue("tags", updatedTags);
                  setNewTag("");
                }
              }}
              className={`flex-grow px-4 py-3 border-2 rounded-l-lg transition-all duration-200 ${focusedField === "tags"
                  ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                } focus:outline-none text-gray-900 placeholder-gray-500`}
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={() => {
                if (newTag.trim()) {
                  const updatedTags = [...watchedTags, newTag.trim()];
                  setValue("tags", updatedTags);
                  setNewTag("");
                }
              }}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-r-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            {ticketId ? "Update Ticket" : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
