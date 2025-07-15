'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { User } from '@/app/types';

interface DashboardTabProps {
  user: User;
}

export default function DashboardTab({ user }: DashboardTabProps) {
  const chartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Daily Earnings',
        data: user.earningsHistory || [0, 200, 400, 600, 800, 1000, 1200], // Placeholder data
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-800">Total Invested</h3>
                <p className="text-3xl font-bold text-green-900">PKR {(user.amount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-blue-800">Current Earnings</h3>
                <p className="text-3xl font-bold text-blue-900">PKR {(user.currentBalance || 0).toLocaleString()}</p>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Your 7-Day Earnings</h3>
            <Line data={chartData} />
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <p className="text-indigo-800">You are earning <strong>PKR 200 daily</strong>. You can request a withdrawal once your balance exceeds <strong>PKR 1000</strong>.</p>
        </div>
    </div>
  );
}
