'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { useStore, TaskStatus } from '@/store/useStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TaskStatusChart() {
  const { tasks } = useStore();

  // Count tasks by status
  const statusCounts: Record<TaskStatus, number> = {
    'Todo': 0,
    'In Progress': 0,
    'Done': 0,
  };

  tasks.forEach(task => {
    statusCounts[task.status] += 1;
  });

  const labels = Object.keys(statusCounts);

  const data = {
    labels,
    datasets: [
      {
        label: 'Number of Tasks',
        data: labels.map(status => statusCounts[status as TaskStatus]),
        backgroundColor: [
          'rgba(209, 213, 219, 0.6)', // Todo - Gray
          'rgba(59, 130, 246, 0.6)',  // In Progress - Blue
          'rgba(16, 185, 129, 0.6)',  // Done - Green
        ],
        borderColor: [
          'rgb(209, 213, 219)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <Card className="border border-gray-200 shadow-md">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold">Task Status Distribution</h3>
      </div>
      <div className="h-64">
        {tasks.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No task data available
          </div>
        )}
      </div>
    </Card>
  );
}