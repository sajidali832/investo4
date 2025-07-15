'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { User, WithdrawalRequest } from '@/app/types';

interface WithdrawalTableProps {
  requests: WithdrawalRequest[];
  onAction: () => void;
}

export default function WithdrawalRequestTable({ requests, onAction }: WithdrawalTableProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(allUsers);
  }, [requests]); // Refetch if requests change

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const handleAction = (request: WithdrawalRequest, newStatus: 'approved' | 'rejected') => {
    Swal.fire({
      title: `Confirm ${newStatus === 'approved' ? 'Approval' : 'Rejection'}?`,
      text: `Do you want to ${newStatus} this withdrawal request of PKR ${request.amount}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${newStatus} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        const allWithdrawals: WithdrawalRequest[] = JSON.parse(localStorage.getItem('withdrawalRequests') || '[]');
        const requestIndex = allWithdrawals.findIndex(r => r.id === request.id);

        if (requestIndex !== -1) {
          allWithdrawals[requestIndex].status = newStatus;
          localStorage.setItem('withdrawalRequests', JSON.stringify(allWithdrawals));

          // If rejected, refund the user's balance
          if (newStatus === 'rejected') {
            const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = allUsers.findIndex(u => u.id === request.userId);
            if (userIndex !== -1) {
              allUsers[userIndex].currentBalance = (allUsers[userIndex].currentBalance || 0) + request.amount;
              localStorage.setItem('users', JSON.stringify(allUsers));
            }
          }

          Swal.fire('Success!', `The request has been ${newStatus}.`, 'success');
          onAction();
        }
      }
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{req.userName}</div>
                <div className="text-sm text-gray-500">{req.userId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PKR {getUserById(req.userId)?.currentBalance?.toLocaleString() ?? 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">PKR {req.amount.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {req.withdrawalInfo ? (
                  <>
                    <div>{req.withdrawalInfo.platform}</div>
                    <div>{req.withdrawalInfo.accountNumber}</div>
                    <div>{req.withdrawalInfo.accountHolderName}</div>
                  </>
                ) : (
                  <div>Not available</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requestDate).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={() => handleAction(req, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
                <button onClick={() => handleAction(req, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
