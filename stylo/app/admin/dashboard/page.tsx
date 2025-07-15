'use client';

import { useEffect, useState, useCallback } from 'react';
import UserTable from '@/app/components/admin/UserTable';
import { User } from '@/app/types';

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = useCallback(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
        // Sort users to show pending ones first
        storedUsers.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
        });
        setUsers(storedUsers);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">All User Investments</h1>
            <p className="mt-1 text-gray-600">Review, approve, or reject user investment applications.</p>
            
            <div className="mt-6">
                <UserTable users={users} onUpdate={fetchUsers} />
            </div>
        </div>
    );
}
