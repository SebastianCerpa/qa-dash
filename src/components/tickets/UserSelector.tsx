"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { useEnhancedQAStore } from "@/store/enhancedStore";
import { useStore } from "@/store/useStore";

interface UserSelectorProps {
  control: any;
  name: string;
  label: string;
  required?: boolean;
  className?: string;
  isMulti?: boolean;
  placeholder?: string;
}

export default function UserSelector({
  control,
  name,
  label,
  required = false,
  className = "",
  isMulti = false,
  placeholder = "Select a user",
}: UserSelectorProps) {
  // Use exclusively team members registered in the "Teams" section
  const { teamMembers } = useStore();
  // We no longer use users from enhancedStore, only registered team members
  // const { users } = useEnhancedQAStore();

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field, fieldState: { error } }) => (
          <>
            <select
              {...field}
              multiple={isMulti}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isMulti ? 'h-32' : ''}`}
            >
              <option value="">{placeholder}</option>
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))
              ) : (
                <option value="" disabled>No team members available</option>
              )}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
            {isMulti && (
              <p className="mt-1 text-sm text-gray-500">Mantén presionado Ctrl (o Cmd) para seleccionar múltiples usuarios</p>
            )}
            {teamMembers.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">No team members available. Add members in the "Teams" section to assign them.</p>
            )}
          </>
        )}
      />
    </div>
  );
}