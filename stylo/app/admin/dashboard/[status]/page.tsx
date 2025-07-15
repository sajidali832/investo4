'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserTable from '@/app/components/admin/UserTable';
import { ArrowLeft } from 'lucide-react';
import type { User } from '@/app/types';

export default function FilteredUsersPage() {
  const params = useParams();
  const status = params.status as 'pending' | 'approved' | 'rejected';
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(() => {
    if (!status) return;
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const filtered = allUsers.filter(user => user.status === status);
    setFilteredUsers(filtered);
  }, [status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const title = status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Users` : 'Users';

  return (
    <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Users
        </Link>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-gray-600">A filtered list of users with the status '{status}'.</p>

      <div className="mt-6">
        <UserTable users={filteredUsers} onUpdate={fetchUsers} />
      </div>
    </div>
  );
}
