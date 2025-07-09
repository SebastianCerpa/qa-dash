import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useStore, TeamMember } from "@/store/useStore";
import { Button } from "@/components/ui/button";

// Definir el tipo para los datos del formulario
interface TeamMemberFormData {
  name: string;
  email: string;
  role: string;
}

interface TeamMemberFormProps {
  memberId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TeamMemberForm({
  memberId,
  onSuccess,
  onCancel,
}: TeamMemberFormProps) {
  const { teamMembers, addTeamMember, updateTeamMember } = useStore();

  const existingMember = memberId
    ? teamMembers.find((member) => member.id === memberId)
    : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormData>({
    defaultValues: existingMember
      ? {
          name: existingMember.name,
          email: existingMember.email,
          role: existingMember.role,
        }
      : {
          name: "",
          email: "",
          role: "",
        },
  });

  const roles = [
    "QA Engineer",
    "QA Lead",
    "QA Manager",
    "Test Automation Engineer",
    "Performance Tester",
    "Security Tester",
    "Accessibility Tester",
  ];

  const onSubmit: SubmitHandler<TeamMemberFormData> = async (data) => {
    try {
      // Preparar los datos para el store
      const memberData: Omit<TeamMember, "id"> = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (existingMember && memberId) {
        updateTeamMember(memberId, memberData);
      } else {
        addTeamMember(memberData);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          Role
        </label>
        <div className="mt-1">
          <select
            id="role"
            {...register("role", { required: "Role is required" })}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {existingMember ? "Update Team Member" : "Add Team Member"}
        </Button>
      </div>
    </form>
  );
}
