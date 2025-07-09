import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  useStore,
  TestType,
  TaskPriority,
  TaskStatus,
  Task,
} from "@/store/useStore";
import { Button } from "@/components/ui/button";
import UserSelector from "@/components/tickets/UserSelector";

import {
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TagIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Definir el tipo para los datos del formulario
interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  testType: TestType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
}

interface TaskFormProps {
  taskId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaskForm({
  taskId,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const { tasks, teamMembers, addTask, updateTask } = useStore();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const existingTask = taskId
    ? tasks.find((task) => task.id === taskId)
    : undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: existingTask
      ? {
          title: existingTask.title,
          description: existingTask.description,
          assignee: existingTask.assignee,
          testType: existingTask.testType,
          status: existingTask.status,
          priority: existingTask.priority,
          dueDate: existingTask.dueDate
            ? existingTask.dueDate.split("T")[0]
            : "",
        }
      : {
          title: "",
          description: "",
          assignee: "",
          testType: "Functional" as TestType,
          status: "Todo" as TaskStatus,
          priority: "Medium" as TaskPriority,
          dueDate: "",
        },
  });

  const testTypes: TestType[] = [
    "Positive",
    "Negative",
    "Functional",
    "Non-functional",
    "Regression",
    "API",
    "Exploratory",
    "Boundary",
    "Smoke",
    "Stress",
    "Accessibility",
  ];

  const statuses: TaskStatus[] = ["Todo", "In Progress", "Done"];
  const priorities: TaskPriority[] = ["Low", "Medium", "High", "Critical"];

  const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
    try {
      // Preparar los datos para el store
      const taskData: Omit<
        Task,
        "id" | "createdAt" | "updatedAt" | "comments"
      > = {
        title: data.title,
        description: data.description,
        assignee: data.assignee,
        testType: data.testType,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      };

      if (existingTask && taskId) {
        updateTask(taskId, taskData);
      } else {
        addTask(taskData);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Todo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      // Review case removed
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Done":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {existingTask ? "Edit Task" : "Create New Task"}
            </h3>
            <p className="text-blue-100 text-sm">
              {existingTask
                ? "Update task details and settings"
                : "Fill in the details to create a new task"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* Title Section */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
            Task Title
          </label>
          <div className="relative">
            <input
              id="title"
              type="text"
              placeholder="Enter a descriptive task title..."
              {...register("title", { required: "Title is required" })}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                focusedField === "title"
                  ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                  : "border-gray-300 hover:border-gray-400"
              } focus:outline-none text-gray-900 placeholder-gray-500`}
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
            <textarea
              id="description"
              rows={4}
              placeholder="Provide detailed information about the task..."
              {...register("description", {
                required: "Description is required",
              })}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 resize-none ${
                focusedField === "description"
                  ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                  : "border-gray-300 hover:border-gray-400"
              } focus:outline-none text-gray-900 placeholder-gray-500`}
            />
            {errors.description && (
              <div className="mt-2 flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.description.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignee */}
          <div className="space-y-2">
            <label
              htmlFor="assignee"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              Assignee
            </label>
            <Controller
              name="assignee"
              control={control}
              rules={{ required: "Assignee is required" }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <UserSelector
                    control={control}
                    name="assignee"
                    label=""
                    required={true}
                    className=""
                  />
                  {error && (
                    <div className="mt-2 flex items-center text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{error.message}</span>
                    </div>
                  )}
                </>
              )}
            />
          </div>

          {/* Test Type */}
          <div className="space-y-2">
            <label
              htmlFor="testType"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <TagIcon className="h-4 w-4 mr-2 text-gray-500" />
              Test Type
            </label>
            <div className="relative">
              <select
                id="testType"
                {...register("testType", { required: "Test type is required" })}
                onFocus={() => setFocusedField("testType")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                  focusedField === "testType"
                    ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                } focus:outline-none text-gray-900 bg-white`}
              >
                <option value="">Choose test type...</option>
                {testTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.testType && (
                <div className="mt-2 flex items-center text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{errors.testType.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                {...register("status", { required: "Status is required" })}
                onFocus={() => setFocusedField("status")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                  focusedField === "status"
                    ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                } focus:outline-none text-gray-900 bg-white`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <div className="mt-2 flex items-center text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{errors.status.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-gray-500" />
              Priority
            </label>
            <div className="relative">
              <select
                id="priority"
                {...register("priority", { required: "Priority is required" })}
                onFocus={() => setFocusedField("priority")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                  focusedField === "priority"
                    ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                } focus:outline-none text-gray-900 bg-white`}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <div className="mt-2 flex items-center text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{errors.priority.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Due Date - Full Width */}
        <div className="space-y-2">
          <label
            htmlFor="dueDate"
            className="flex items-center text-sm font-semibold text-gray-700"
          >
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
            Due Date
          </label>
          <div className="relative max-w-md">
            <input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              onFocus={() => setFocusedField("dueDate")}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                focusedField === "dueDate"
                  ? "border-blue-500 ring-4 ring-blue-100 shadow-md"
                  : "border-gray-300 hover:border-gray-400"
              } focus:outline-none text-gray-900 bg-white`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                {existingTask ? "Update Task" : "Create Task"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
