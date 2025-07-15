'use client';

import { useState, useEffect } from 'react';
import { User, WithdrawalRequest } from '@/app/types';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Stats {
    totalUsers: number;
    totalInvested: number;
    totalPaidOut: number;
    pendingWithdrawals: number;
    usersByStatus: { pending: number; approved: number; rejected: number };
}

export default function StatisticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const withdrawals: WithdrawalRequest[] = JSON.parse(localStorage.getItem('withdrawals') || '[]');

        const totalUsers = users.length;
        const totalInvested = users.reduce((acc, user) => acc + user.amount, 0);
        const totalPaidOut = withdrawals
            .filter(w => w.status === 'approved')
            .reduce((acc, w) => acc + w.amount, 0);
        const pendingWithdrawals = withdrawals
            .filter(w => w.status === 'pending')
            .reduce((acc, w) => acc + w.amount, 0);
        
        const usersByStatus = users.reduce((acc, user) => {
            acc[user.status] = (acc[user.status] || 0) + 1;
            return acc;
        }, { pending: 0, approved: 0, rejected: 0 });

        setStats({ totalUsers, totalInvested, totalPaidOut, pendingWithdrawals, usersByStatus });
    }, []);

    if (!stats) {
        return <div className="p-8">Loading statistics...</div>;
    }

    const userStatusData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
            data: [stats.usersByStatus.pending, stats.usersByStatus.approved, stats.usersByStatus.rejected],
            backgroundColor: ['#facc15', '#4ade80', '#f87171'],
        }],
    };

    const financialData = {
        labels: ['Platform Finances'],
        datasets: [
            { label: 'Total Invested', data: [stats.totalInvested], backgroundColor: '#3b82f6' },
            { label: 'Total Paid Out', data: [stats.totalPaidOut], backgroundColor: '#10b981' },
        ],
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Platform Statistics</h1>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Users</h3><p className="text-3xl font-bold">{stats.totalUsers}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Invested</h3><p className="text-3xl font-bold">PKR {stats.totalInvested.toLocaleString()}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Total Paid Out</h3><p className="text-3xl font-bold">PKR {stats.totalPaidOut.toLocaleString()}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500">Pending Withdrawals</h3><p className="text-3xl font-bold">PKR {stats.pendingWithdrawals.toLocaleString()}</p></div>
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">User Distribution</h3>
                    <div className="max-w-xs mx-auto">
                        <Doughnut data={userStatusData} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
                    <Bar data={financialData} options={{ responsive: true }} />
                </div>
            </div>
        </div>
    );
}
