'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TeamMemberCard from '@/components/team/TeamMemberCard';
import TeamMemberForm from '@/components/forms/TeamMemberForm';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useStore } from '@/store/useStore';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function TeamPage() {
  const { teamMembers, deleteTeamMember } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const handleAddMember = () => {
    setEditingMemberId(null);
    setShowForm(true);
  };

  const handleEditMember = (memberId: string) => {
    setEditingMemberId(memberId);
    setShowForm(true);
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      deleteTeamMember(memberId);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMemberId(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your QA team members
          </p>
        </div>
        <Button
          onClick={handleAddMember}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Add Team Member
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <Card title={editingMemberId ? 'Edit Team Member' : 'Add Team Member'}>
            <TeamMemberForm
              memberId={editingMemberId || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          ))
        ) : (
          <div className="col-span-4 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No team members found. Add your first team member!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}