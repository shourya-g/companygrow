import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

export function TrainingPerformanceChart({ data }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Enrollments',
        data: data.map(d => d.enrollments),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Completions',
        data: data.map(d => d.completions),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  };
  return <Bar data={chartData} />;
}

export function ProjectPerformanceChart({ data }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Assigned',
        data: data.map(d => d.assigned),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Completed',
        data: data.map(d => d.completed),
        backgroundColor: 'rgba(253, 224, 71, 0.7)',
      },
    ],
  };
  return <Line data={chartData} />;
}

export function BadgePerformanceChart({ data }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Badges Earned',
        data: data.map(d => d.earned),
        backgroundColor: 'rgba(251, 191, 36, 0.7)',
      },
    ],
  };
  return <Bar data={chartData} />;
}
