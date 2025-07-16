'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { User } from '@/app/types';

interface PaymentSubmission {
    id: string;
    holderName: string;
    phone: string;
    platform: string;
    screenshot?: File | string; // New structure
    screenshotName?: string; // Old structure for backward compatibility
    status: 'pending' | 'approved' | 'rejected';
    submissionDate: string;
    referralCode?: string;
}

export default function ApprovalsPage() {
    const [pendingSubmissions, setPendingSubmissions] = useState<PaymentSubmission[]>([]);
    const [approvedSubmissions, setApprovedSubmissions] = useState<PaymentSubmission[]>([]);
    const [rejectedSubmissions, setRejectedSubmissions] = useState<PaymentSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSubmissions = useCallback(() => {
        const allSubmissions: PaymentSubmission[] = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');
        setPendingSubmissions(allSubmissions.filter(s => s.status === 'pending'));
        setApprovedSubmissions(allSubmissions.filter(s => s.status === 'approved'));
        setRejectedSubmissions(allSubmissions.filter(s => s.status === 'rejected'));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleApprove = (submission: PaymentSubmission) => {
        Swal.fire({
            title: 'Approve this User?',
            text: `This will create an account for ${submission.holderName}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve!',
            confirmButtonColor: '#16a34a',
        }).then((result) => {
            if (result.isConfirmed) {
                // 1. Update submission status first
                const allSubmissions: PaymentSubmission[] = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');
                const subIndex = allSubmissions.findIndex(s => s.id === submission.id);
                if (subIndex === -1) {
                    Swal.fire('Error!', 'Submission not found.', 'error');
                    return;
                }
                allSubmissions[subIndex].status = 'approved';
                localStorage.setItem('paymentSubmissions', JSON.stringify(allSubmissions));

                // 2. Create a new, complete user object
                const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
                // Handle referral logic
                if (submission.referralCode) {
                    const referrer = allUsers.find(u => u.referralCode === submission.referralCode);
                    if (referrer) {
                        if (!referrer.referrals) {
                            referrer.referrals = [];
                        }
                        // We will add the new user's ID to the referrer's list later, after creating the user.
                        console.log(`User ${referrer.id} referred a new user.`);
                    }
                }

                const newUserId = `user-${Date.now()}`;
                const newUser: User = {
                    id: newUserId,
                    name: submission.holderName,
                    phone: submission.phone,
                    email: '', // User will set this later
                    password: '', // User will set this later
                    isApproved: true,
                    isWithdrawalEnabled: false,
                    currentBalance: 6000, // Default initial investment
                    totalInvestment: 6000,
                    totalWithdrawals: 0,
                    referralCode: `ref-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                    referredBy: submission.referralCode, // Store who referred this user
                    approvalDate: new Date().toISOString(),
                    applicationDate: submission.submissionDate,
                    status: 'approved',
                    profileComplete: false, // User needs to set username/password
                };

                // Now, find the referrer again and update their referrals list and give bonus
                if (submission.referralCode) {
                    const referrerIndex = allUsers.findIndex(u => u.referralCode === submission.referralCode);
                    if (referrerIndex !== -1) {
                        if (!allUsers[referrerIndex].referrals) {
                            allUsers[referrerIndex].referrals = [];
                        }
                        allUsers[referrerIndex].referrals.push(newUserId);
                        // Give referral bonus if not already given for this referral
                        if (!allUsers[referrerIndex].referralBonusesGiven) {
                            allUsers[referrerIndex].referralBonusesGiven = [];
                        }
                        if (!allUsers[referrerIndex].referralBonusesGiven.includes(newUserId)) {
                            allUsers[referrerIndex].totalEarning = (allUsers[referrerIndex].totalEarning || 0) + 200;
                            allUsers[referrerIndex].currentBalance = (allUsers[referrerIndex].currentBalance || 0) + 200;
                            if (!allUsers[referrerIndex].earningsHistory) {
                                allUsers[referrerIndex].earningsHistory = [];
                            }
                            allUsers[referrerIndex].earningsHistory.push({
                                date: new Date().toISOString(),
                                amount: 200,
                                description: `Referral bonus for ${newUser.name}`,
                            });
                            allUsers[referrerIndex].referralBonusesGiven.push(newUserId);
                            allUsers[referrerIndex].showReferralCompleted = true;
                        }
                    }
                }

                allUsers.push(newUser);

                localStorage.setItem('users', JSON.stringify(allUsers));

                Swal.fire('Approved!', `${submission.holderName}'s account has been created.`, 'success');
                fetchSubmissions(); // Refresh the UI
            }
        });
    };

    const updateSubmissionStatus = (id: string, status: 'approved' | 'rejected') => {
        const allSubmissions: PaymentSubmission[] = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');
        const updatedSubmissions = allSubmissions.map(s => s.id === id ? { ...s, status } : s);
        localStorage.setItem('paymentSubmissions', JSON.stringify(updatedSubmissions));
        fetchSubmissions();
    };

    const handleReject = (submission: PaymentSubmission) => {
        Swal.fire({
            title: 'Reject this submission?',
            text: `This will mark the submission from ${submission.holderName} as rejected.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Reject',
            confirmButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                updateSubmissionStatus(submission.id, 'rejected');
                Swal.fire('Rejected!', 'The submission has been rejected.', 'success');
            }
        });
    };

    const viewScreenshot = (screenshotData: string | File) => {
        // Backward compatibility: Handle both Base64 URLs and older file names/objects
        if (typeof screenshotData === 'string' && screenshotData.startsWith('data:image')) {
            Swal.fire({
                title: 'Payment Screenshot',
                imageUrl: screenshotData,
                imageAlt: 'Payment Screenshot',
                imageWidth: '100%',
                imageHeight: 'auto',
                confirmButtonText: 'Close',
                customClass: {
                    popup: 'w-auto max-w-3xl',
                    title: 'text-2xl font-bold',
                    image: 'rounded-lg',
                    confirmButton: 'text-lg px-6 py-2',
                }
            });
        } else {
            // Fallback for older data (filenames or File objects)
            const fileName = typeof screenshotData === 'string' ? screenshotData : screenshotData.name;
            Swal.fire({
                title: 'Screenshot File',
                text: `Could not display image directly. Filename: ${fileName}`,
                icon: 'info',
            });
        }
    };

    if (isLoading) {
        return <div className="p-8">Loading pending approvals...</div>;
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="p-8">
                {/* Pending Section */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Approvals</h1>
                    {pendingSubmissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pendingSubmissions.map(sub => (
                                <div key={sub.id} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                                    <div className="font-bold text-xl text-gray-900">{sub.holderName}</div>
                                    <div className="text-base">
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-gray-800 font-medium">{sub.phone}</p>
                                    </div>
                                    <div className="text-base">
                                        <p className="text-sm text-gray-500">Platform</p>
                                        <p className="text-gray-800 font-medium">{sub.platform}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 pt-2">Submitted: {new Date(sub.submissionDate).toLocaleString()}</p>
                                    <div className="flex items-center space-x-3 pt-4">
                                        <button onClick={() => handleApprove(sub)} className="flex-1 py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-base">Approve</button>
                                        <button onClick={() => handleReject(sub)} className="flex-1 py-2 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all text-base">Reject</button>
                                    </div>
                                    <button onClick={() => viewScreenshot(sub.screenshot || sub.screenshotName || 'No screenshot available')} className="w-full mt-2 py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-base">View Screenshot</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-lg">No pending approvals.</p>
                    )}
                </div>

                {/* Approved Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Approved Submissions</h2>
                    {approvedSubmissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {approvedSubmissions.map(sub => (
                                <div key={sub.id} className="bg-green-50 p-6 rounded-xl shadow-md space-y-3 border-l-4 border-green-500">
                                    <div className="font-bold text-xl text-gray-900">{sub.holderName}</div>
                                    <p className="font-medium text-gray-700">Phone: {sub.phone}</p>
                                    <p className="text-sm text-gray-500">Approved on: {new Date(sub.submissionDate).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-lg">No approved submissions yet.</p>
                    )}
                </div>

                {/* Rejected Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Rejected Submissions</h2>
                    {rejectedSubmissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {rejectedSubmissions.map(sub => (
                                <div key={sub.id} className="bg-red-50 p-6 rounded-xl shadow-md space-y-3 border-l-4 border-red-500">
                                    <div className="font-bold text-xl text-gray-900">{sub.holderName}</div>
                                    <p className="font-medium text-gray-700">Phone: {sub.phone}</p>
                                    <p className="text-sm text-gray-500">Rejected on: {new Date(sub.submissionDate).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-lg">No rejected submissions yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
