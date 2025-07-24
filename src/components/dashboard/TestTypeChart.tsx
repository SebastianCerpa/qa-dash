'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { useStore, TestType } from '@/store/useStore';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TestTypeChart() {
  const { tasks } = useStore();

  // Count tasks by test type
  const testTypeCounts: Record<TestType, number> = {
    'Positive': 0,
    'Negative': 0,
    'Functional': 0,
    'Non-functional': 0,
    'Regression': 0,
    'API': 0,
    'Exploratory': 0,
    'Boundary': 0,
    'Smoke': 0,
    'Stress': 0,
    'Accessibility': 0,
  };

  tasks.forEach(task => {
    testTypeCounts[task.testType] += 1;
  });

  // Filter out test types with zero count
  const labels = Object.keys(testTypeCounts).filter(
    type => testTypeCounts[type as TestType] > 0
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Number of Tests',
        data: labels.map(type => testTypeCounts[type as TestType]),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',    // Blue
          'rgba(16, 185, 129, 0.7)',    // Emerald
          'rgba(139, 92, 246, 0.7)',    // Violet
          'rgba(245, 101, 101, 0.7)',   // Red
          'rgba(251, 146, 60, 0.7)',    // Orange
          'rgba(34, 197, 94, 0.7)',     // Green
          'rgba(168, 85, 247, 0.7)',    // Purple
          'rgba(6, 182, 212, 0.7)',     // Cyan
          'rgba(236, 72, 153, 0.7)',    // Pink
          'rgba(99, 102, 241, 0.7)',    // Indigo
          'rgba(107, 114, 128, 0.7)',   // Gray
        ],
        borderColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(139, 92, 246, 0.9)',
          'rgba(245, 101, 101, 0.9)',
          'rgba(251, 146, 60, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(168, 85, 247, 0.9)',
          'rgba(6, 182, 212, 0.9)',
          'rgba(236, 72, 153, 0.9)',
          'rgba(99, 102, 241, 0.9)',
          'rgba(107, 114, 128, 0.9)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
          color: '#64748b',
        },
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
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      {tasks.length > 0 ? (
        <div className="flex-1 p-2">
          <Pie data={data} options={options} />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500 text-body">
          No test data available
        </div>
      )}
    </div>
  );
}
