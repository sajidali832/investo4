'use client';

import { useState, useEffect } from 'react';
import { WithdrawalRequest } from '@/app/types';
import WithdrawalRequestTable from '@/app/components/admin/WithdrawalRequestTable';

export default function AdminWithdrawalsPage() {
    const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = () => {
        const allRequests: WithdrawalRequest[] = JSON.parse(localStorage.getItem('withdrawalRequests') || '[]');
        setPendingRequests(allRequests.filter(r => r.status === 'pending'));
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (isLoading) {
        return <div className="p-8">Loading withdrawal requests...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Pending Withdrawals</h1>
            {pendingRequests.length > 0 ? (
                <WithdrawalRequestTable requests={pendingRequests} onAction={fetchRequests} />
            ) : (
                <p className="text-gray-500">There are no pending withdrawal requests at this time.</p>
            )}
        </div>
    );
}
