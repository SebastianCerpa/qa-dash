"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useEnhancedQAStore, QATicket } from "@/store/enhancedStore";
import Button from "@/components/ui/Button";
import { XMarkIcon, PlusIcon, TagIcon } from "@heroicons/react/24/outline";

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
  const { tickets, addTicket, updateTicket, sprints, users } =
    useEnhancedQAStore();
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof ticketTemplates | "blank"
  >("blank");
  const [newTag, setNewTag] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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
    }
  }, [ticketId, tickets, reset]);

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
      addTicket({
        ...data,
        reporterId: "current-user", // This should be the actual current user ID
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Template Selection */}
      {!ticketId && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start with a template
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplate("blank")}
              className={`p-2 text-sm rounded border ${
                selectedTemplate === "blank"
                  ? "bg-primary-100 border-primary-500"
                  : "bg-white border-gray-300"
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
                className={`p-2 text-sm rounded border capitalize ${
                  selectedTemplate === key
                    ? "bg-primary-100 border-primary-500"
                    : "bg-white border-gray-300"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Controller
          name="title"
          control={control}
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter ticket title"
            />
          )}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <Controller
          name="description"
          control={control}
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <textarea
              {...field}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter detailed description (Markdown supported)"
            />
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Acceptance Criteria */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Acceptance Criteria *
          </label>
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            {isPreviewMode ? "Edit" : "Preview"}
          </button>
        </div>
        {isPreviewMode ? (
          <div
            className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
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
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter acceptance criteria (Markdown/BDD format supported)&#10;&#10;Example:&#10;Given [context]&#10;When [action]&#10;Then [outcome]&#10;&#10;- [ ] Criteria 1&#10;- [ ] Criteria 2"
              />
            )}
          />
        )}
        {errors.acceptanceCriteria && (
          <p className="mt-1 text-sm text-red-600">
            {errors.acceptanceCriteria.message}
          </p>
        )}
      </div>

      {/* Priority, Status and Assignment */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Review">Review</option>
                <option value="Closed">Closed</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sprint
          </label>
          <Controller
            name="sprintId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <Controller
            name="assigneeId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Hours
        </label>
        <Controller
          name="estimatedHours"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              value={field.value || ""}
              onChange={(e) =>
                field.onChange(e.target.value ? Number(e.target.value) : 0)
              }
              type="number"
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0"
            />
          )}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {watchedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add tag"
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {ticketId ? "Update Ticket" : "Create Ticket"}
        </Button>
      </div>
    </form>
  );
}
