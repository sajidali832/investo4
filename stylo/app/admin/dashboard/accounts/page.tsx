'use client';

import { useEffect, useState } from 'react';
import { User } from '@/app/types';
import Link from 'next/link';

// We'll consider a user to have an 'account' if they have an email address.
const AccountRow = ({ user }: { user: User }) => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <Link href={`/admin/dashboard/user/${user.id}`} className="text-blue-600 hover:underline">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">ID: {user.id}</div>
            </Link>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {user.approvalDate ? new Date(user.approvalDate).toLocaleDateString() : 'N/A'}
        </td>
    </tr>
);

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        // Filter for users who have created an account (i.e., have an email)
        const createdAccounts = allUsers.filter(u => u.email);
        setAccounts(createdAccounts);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="p-8">Loading account data...</div>;
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Accounts</h1>
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {accounts.length > 0 ? (
                            accounts.map((user) => <AccountRow key={user.id} user={user} />)
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">No user accounts have been created yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
