'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Card from '@/components/ui/Card';
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
          'rgba(54, 162, 235, 0.6)',   // Blue
          'rgba(255, 99, 132, 0.6)',    // Red
          'rgba(75, 192, 192, 0.6)',    // Green
          'rgba(153, 102, 255, 0.6)',   // Purple
          'rgba(255, 159, 64, 0.6)',    // Orange
          'rgba(255, 206, 86, 0.6)',    // Yellow
          'rgba(231, 233, 237, 0.6)',   // Gray
          'rgba(97, 97, 97, 0.6)',      // Dark Gray
          'rgba(121, 85, 72, 0.6)',     // Brown
          'rgba(0, 188, 212, 0.6)',     // Cyan
          'rgba(233, 30, 99, 0.6)',     // Pink
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(231, 233, 237, 1)',
          'rgba(97, 97, 97, 1)',
          'rgba(121, 85, 72, 1)',
          'rgba(0, 188, 212, 1)',
          'rgba(233, 30, 99, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Card title="Test Types Distribution">
      <div className="h-64">
        {tasks.length > 0 ? (
          <Pie data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No test data available
          </div>
        )}
      </div>
    </Card>
  );
}