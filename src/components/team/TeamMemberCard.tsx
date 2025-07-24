import React from 'react';
import { TeamMember } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { PencilIcon, TrashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit?: (memberId: string) => void;
  onDelete?: (memberId: string) => void;
}

export default function TeamMemberCard({ member, onEdit, onDelete }: TeamMemberCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-base font-semibold">
            {member.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h3 className="text-base font-medium text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(member.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(member.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
        <a href={`mailto:${member.email}`} className="ml-2 text-sm text-gray-500 hover:text-primary-600">
          {member.email}
        </a>
      </div>
    </Card>
  );
}
