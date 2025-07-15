'use client';

import { useEffect, useState } from 'react';
import { User } from '@/app/types';
import Link from 'next/link';

interface ReferralInfo {
  id: string;
  referrerName: string;
  referrerId: string;
  referredUserName: string;
  referredUserId: string;
  bonus: number;
  date: string;
}

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<ReferralInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const referralList: ReferralInfo[] = [];

        for (const referredUser of allUsers) {
            if (referredUser.referredBy) {
                const referrer = allUsers.find(u => u.id === referredUser.referredBy);
                if (referrer) {
                    referralList.push({
                        id: `${referrer.id}-${referredUser.id}`,
                        referrerName: referrer.name,
                        referrerId: referrer.id,
                        referredUserName: referredUser.name,
                        referredUserId: referredUser.id,
                        bonus: 500, // Assuming a fixed bonus for now
                        date: referredUser.approvalDate || new Date().toISOString(),
                    });
                }
            }
        }

        setReferrals(referralList);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="p-8">Loading referral data...</div>;
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Referral History</h1>
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus Awarded</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {referrals.length > 0 ? (
                            referrals.map((ref) => (
                                <tr key={ref.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/admin/dashboard/user/${ref.referrerId}`} className="text-blue-600 hover:underline">
                                            <div className="text-sm font-medium text-gray-900">{ref.referrerName}</div>
                                            <div className="text-xs text-gray-500">ID: {ref.referrerId}</div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/admin/dashboard/user/${ref.referredUserId}`} className="text-blue-600 hover:underline">
                                            <div className="text-sm font-medium text-gray-900">{ref.referredUserName}</div>
                                            <div className="text-xs text-gray-500">ID: {ref.referredUserId}</div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">PKR {ref.bonus.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ref.date).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">No referral data found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
