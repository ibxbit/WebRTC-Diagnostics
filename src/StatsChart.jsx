import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import React from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StatsChart({ title, labels, data, ylabel, sublabel }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: ylabel,
        data,
        fill: false,
        borderColor: '#36a2eb',
        backgroundColor: '#36a2eb', 
        borderWidth: 3,
        pointRadius: 2.5,
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {},
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#b6c2d1', font: { size: 13 } },
      },
      y: {
        beginAtZero: true,
        grid: { display: true, color: '#222' },
        ticks: {
          display: true,
          color: '#b6c2d1',
          font: { size: 15, weight: 'bold' },
          padding: 8,
        },
        title: { display: false },
      },
    },
    animation: false,
  };

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: '#181a1f',
      padding: '1.2rem 1.2rem 0.5rem 1.2rem',
      minWidth: 320,
      minHeight: 320,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 24, left: 32, color: '#fff', fontWeight: 700, fontSize: 22 }}>{title}</div>
      {sublabel && <div style={{ position: 'absolute', top: 54, left: 32, color: '#ffe066', fontWeight: 500, fontSize: 15 }}>{sublabel}</div>}
      <Line data={chartData} options={options} />
    </div>
  );
} 
