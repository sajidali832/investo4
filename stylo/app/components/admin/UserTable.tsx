'use client';

import Image from 'next/image';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import Link from 'next/link';
import { User } from '@/app/types';

interface UserTableProps {
  users: User[];
  onUpdate: () => void; // A callback to refresh the user list after an action
}

export default function UserTable({ users, onUpdate }: UserTableProps) {

  const handleAction = (userId: string, newStatus: 'approved' | 'rejected' | 'deleted') => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    let updatedUsers: User[];
    let confirmationTitle: string;
    let confirmationText: string;
    let successText: string;

    if (newStatus === 'deleted') {
        confirmationTitle = 'Are you sure?';
        confirmationText = "You won't be able to revert this!";
        successText = 'The user has been deleted.';
        updatedUsers = allUsers.filter(u => u.id !== userId);
    } else {
        confirmationTitle = `Confirm ${newStatus === 'approved' ? 'Approval' : 'Rejection'}`;
        confirmationText = `Do you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this investment?`;
        successText = `User has been ${newStatus}.`;
        updatedUsers = allUsers.map(u => {
            if (u.id === userId) {
                const updatedUser: User = { ...u, status: newStatus };
                if (newStatus === 'approved') {
                    updatedUser.approvalDate = new Date().toISOString();
                    updatedUser.lastLogin = new Date().toISOString();
                    updatedUser.lastEarningUpdate = new Date().toISOString();
                    updatedUser.totalInvestment = 6000;
                    updatedUser.totalEarning = 200;
                    updatedUser.currentBalance = 200;
                    // Clear previous history and set the initial bonus
                    updatedUser.earningsHistory = [
                        {
                            date: new Date().toISOString(),
                            amount: 200,
                            description: 'Initial investment bonus',
                        },
                    ];
                    updatedUser.referralCode = `${u.name.split(' ')[0].toLowerCase()}${Math.floor(100 + Math.random() * 900)}`;
                    updatedUser.referrals = [];

                    // If user was referred, update the referrer's list and give bonus
                    if (updatedUser.referredBy) {
                        const referrerIndex = allUsers.findIndex(referrer => referrer.referralCode === updatedUser.referredBy);
                        if (referrerIndex !== -1) {
                            if (!allUsers[referrerIndex].referrals) {
                                allUsers[referrerIndex].referrals = [];
                            }
                            allUsers[referrerIndex].referrals.push(updatedUser.id);
                            // Give referral bonus if not already given for this referral
                            if (!allUsers[referrerIndex].referralBonusesGiven) {
                                allUsers[referrerIndex].referralBonusesGiven = [];
                            }
                            if (!allUsers[referrerIndex].referralBonusesGiven.includes(updatedUser.id)) {
                                allUsers[referrerIndex].totalEarning = (allUsers[referrerIndex].totalEarning || 0) + 200;
                                allUsers[referrerIndex].currentBalance = (allUsers[referrerIndex].currentBalance || 0) + 200;
                                if (!allUsers[referrerIndex].earningsHistory) {
                                    allUsers[referrerIndex].earningsHistory = [];
                                }
                                allUsers[referrerIndex].earningsHistory.push({
                                    date: new Date().toISOString(),
                                    amount: 200,
                                    description: `Referral bonus for ${updatedUser.name}`,
                                });
                                allUsers[referrerIndex].referralBonusesGiven.push(updatedUser.id);
                                // Set a flag to show completion message
                                allUsers[referrerIndex].showReferralCompleted = true;
                            }
                        }
                    }
                }
                return updatedUser;
            }
            return u;
        });
    }

    Swal.fire({
        title: confirmationTitle,
        text: confirmationText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${newStatus} it!`
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            Swal.fire('Success!', successText, 'success');
            onUpdate(); // Trigger the refresh callback
        }
    });
  };

  const showScreenshot = (screenshot: string | undefined, name: string) => {
    if (!screenshot) {
        Swal.fire('No Screenshot', 'This user did not provide a screenshot.', 'info');
        return;
    }
    Swal.fire({
      title: `Screenshot for ${name}`,
      imageUrl: screenshot,
      imageAlt: `Payment screenshot for ${name}`,
      imageWidth: '100%',
      imageHeight: 'auto',
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/admin/dashboard/user/${user.id}`}>
                    <div className="flex items-center cursor-pointer hover:opacity-80">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600">{user.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600 hover:underline">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.paymentMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'approved' ? 'bg-green-100 text-green-800' : user.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {user.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => showScreenshot(user.screenshot, user.name)} className="text-blue-500 hover:text-blue-700" title="View Screenshot"><Eye size={20} /></button>
                    {user.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(user.id, 'approved')} className="text-green-500 hover:text-green-700" title="Approve"><CheckCircle size={20} /></button>
                        <button onClick={() => handleAction(user.id, 'rejected')} className="text-orange-500 hover:text-orange-700" title="Reject"><XCircle size={20} /></button>
                      </>
                    )}
                     <button onClick={() => handleAction(user.id, 'deleted')} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={20} /></button>
                  </div>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">No users found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
