'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { User, WithdrawalRequest } from '@/app/types';

interface WithdrawalsTabProps {
  user: User;
  onUpdate: () => void;
}

export default function WithdrawalsTab({ user, onUpdate }: WithdrawalsTabProps) {
    const [platform, setPlatform] = useState(user.withdrawalInfo?.platform || 'JazzCash');
    const [number, setNumber] = useState(user.withdrawalInfo?.number || '');
    const [holderName, setHolderName] = useState(user.withdrawalInfo?.holderName || '');
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState<WithdrawalRequest[]>([]);

    useEffect(() => {
        const allWithdrawals: WithdrawalRequest[] = JSON.parse(localStorage.getItem('withdrawals') || '[]');
        setTransactions(allWithdrawals.filter(t => t.userId === user.id));
    }, [user.id]);

    const handleSetupAccount = (e: React.FormEvent) => {
        e.preventDefault();
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = allUsers.findIndex((u: User) => u.id === user.id);
        if (userIndex !== -1) {
            allUsers[userIndex].withdrawalInfo = { platform, number, holderName };
            localStorage.setItem('users', JSON.stringify(allUsers));
            Swal.fire('Success', 'Withdrawal account saved!', 'success');
            onUpdate();
        }
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawalAmount = parseFloat(amount);

        // Conditions check
        // The referral check is bypassed if the admin has explicitly enabled withdrawals.
        if (user.isWithdrawalEnabled !== true && (user.referrals?.length || 0) < 2) {
            Swal.fire('Withdrawal Blocked', 'You must invite at least 2 friends who have an approved investment before you can withdraw.', 'error');
            return;
        }
        if (withdrawalAmount < 1000 || withdrawalAmount > 4000) {
            Swal.fire('Invalid Amount', 'You can withdraw between PKR 1000 and PKR 4000.', 'error');
            return;
        }
        if (withdrawalAmount > (user.currentBalance || 0)) {
            Swal.fire('Insufficient Balance', 'You do not have enough funds to withdraw this amount.', 'error');
            return;
        }
        if (!user.withdrawalInfo) {
            Swal.fire('Account Not Setup', 'Please set up your withdrawal account first.', 'error');
            return;
        }

        const newRequest: WithdrawalRequest = {
            id: `wd-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            amount: withdrawalAmount,
            status: 'pending',
            requestDate: new Date().toISOString(),
            withdrawalInfo: user.withdrawalInfo
        };

        const allWithdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
        allWithdrawals.push(newRequest);
        localStorage.setItem('withdrawals', JSON.stringify(allWithdrawals));

        // Update user's balance optimistically
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = allUsers.findIndex((u: User) => u.id === user.id);
        if (userIndex !== -1) {
            allUsers[userIndex].currentBalance -= withdrawalAmount;
            localStorage.setItem('users', JSON.stringify(allUsers));
        }

        Swal.fire('Request Sent', 'Your withdrawal request has been submitted for admin approval.', 'success');
        setTransactions(prev => [...prev, newRequest]);
        setAmount('');
        onUpdate();
    };

    const canWithdraw = (user.currentBalance || 0) >= 1000;

    return (
        <div className="space-y-8">
            {/* Account Setup Form */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Withdrawal Account</h3>
                <form onSubmit={handleSetupAccount} className="space-y-4">
                                        <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select
                            id="platform"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option>JazzCash</option>
                            <option>Easypaisa</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="number" className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            type="text"
                            id="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="e.g., 03123456789"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="holderName" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input
                            type="text"
                            id="holderName"
                            value={holderName}
                            onChange={(e) => setHolderName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700">Save Account Info</button>
                </form>
            </div>

            {/* Withdrawal Form */}
            {user.isWithdrawalEnabled === false ? (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Request Withdrawal</h3>
                    <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
                        <p className="font-semibold">Withdrawals Disabled</p>
                        <p className="text-sm">Withdrawals are currently disabled for your account. Please contact support for assistance.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Request Withdrawal</h3>
                    {!user.withdrawalInfo && <p className="text-sm text-red-500 mb-4">Please set up your withdrawal account first.</p>}
                    {!canWithdraw && <p className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-md">Withdrawals are available once your balance exceeds PKR 1000.</p>}
                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (e.g., 1500)" disabled={!canWithdraw || !user.withdrawalInfo} className="w-full p-2 border rounded-md" />
                        <button type="submit" disabled={!canWithdraw || !user.withdrawalInfo} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md disabled:bg-gray-400">Request Withdrawal</button>
                    </form>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
                <ul className="space-y-3">
                    {transactions.length > 0 ? transactions.map(t => (
                        <li key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-semibold">PKR {t.amount}</p>
                                <p className="text-sm text-gray-500">{new Date(t.requestDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${t.status === 'approved' ? 'bg-green-200 text-green-800' : t.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{t.status}</span>
                        </li>
                    )) : <p className="text-gray-500">No withdrawal history.</p>}
                </ul>
            </div>
        </div>
    );
}
