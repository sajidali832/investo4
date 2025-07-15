'use client';

import { useState, useEffect } from 'react';
import { User } from '@/app/types';
import { Copy, Check } from 'lucide-react';
import Swal from 'sweetalert2';

interface ReferralsTabProps {
  user: User;
}

export default function ReferralsTab({ user }: ReferralsTabProps) {
    const [referredUsers, setReferredUsers] = useState<User[]>([]);
    const [copied, setCopied] = useState(false);

    const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;

    useEffect(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const myReferrals = allUsers.filter(u => user.referrals?.includes(u.id));
        setReferredUsers(myReferrals);
        // Show completion message if flag is set
        const currentUserIndex = allUsers.findIndex(u => u.id === user.id);
        if (currentUserIndex !== -1 && allUsers[currentUserIndex].showReferralCompleted) {
            Swal.fire('Referral Completed', 'Your one referral has been completed.', 'success');
            allUsers[currentUserIndex].showReferralCompleted = false;
            localStorage.setItem('users', JSON.stringify(allUsers));
        }
    }, [user.referrals, user.id]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const successfulReferrals = referredUsers.filter(u => u.status === 'approved').length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Referral Link Section */}
            <div className="p-6 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-2 text-purple-100">Your Referral Link</h3>
                <p className="text-purple-200 mb-4">Share this link with friends. You get a bonus when they make their first approved investment!</p>
                <div className="relative">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="w-full outline-none text-white font-mono text-base px-4 py-3 pr-12 rounded-lg border border-white focus:ring-0 cursor-pointer bg-transparent"
                        onFocus={e => e.target.select()}
                        style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'auto' }}
                    />
                    <button
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md border border-white bg-transparent hover:bg-white hover:bg-opacity-20 transition"
                        tabIndex={-1}
                        style={{ lineHeight: 0 }}
                    >
                        {copied ? <Check className="w-5 h-5 text-green-200" /> : <Copy className="w-5 h-5 text-white" />}
                    </button>
                </div>
            </div>

            {/* Referrals List Section */}
            <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Your Referrals <span className='text-green-600'>({successfulReferrals} Successful)</span></h3>
                <ul className="space-y-3">
                    {referredUsers.length > 0 ? referredUsers.map(ref => (
                        <li key={ref.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{ref.name}</p>
                                <p className="text-sm text-gray-500">{ref.phone}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ref.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{ref.status}</span>
                        </li>
                    )) : <p className="text-gray-500">You haven't referred anyone yet.</p>}
                </ul>
            </div>

            {/* Referral History Section */}
            <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Referral History</h3>
                <ul className="space-y-3">
                    {referredUsers.filter(ref => ref.status === 'approved').length > 0 ? referredUsers.filter(ref => ref.status === 'approved').map(ref => (
                        <li key={ref.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{ref.name}</p>
                                <p className="text-sm text-gray-500">{ref.phone}</p>
                            </div>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Completed</span>
                        </li>
                    )) : <p className="text-gray-500">No completed referrals yet.</p>}
                </ul>
            </div>
        </div>
    );
}
