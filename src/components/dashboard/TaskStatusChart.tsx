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
          'rgba(148, 163, 184, 0.7)', // Todo - Slate
          'rgba(59, 130, 246, 0.7)',  // In Progress - Blue
          'rgba(16, 185, 129, 0.7)',  // Done - Emerald
        ],
        borderColor: [
          'rgba(148, 163, 184, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(148, 163, 184, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderDash: [2, 2],
        },
        ticks: {
          precision: 0,
          color: '#64748b',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      {tasks.length > 0 ? (
        <div className="flex-1 p-2">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500 text-body">
          No task data available
        </div>
      )}
    </div>
  );
}