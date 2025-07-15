'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, WithdrawalRequest, EarningsRecord } from '../types';
import { HomeIcon, WalletIcon, UsersIcon, LogoutIcon, ClipboardCopy, CheckCircle } from '../components/icons';
import Swal from 'sweetalert2';
import ReferralsTab from '../components/user/ReferralsTab';

// --- Main Dashboard Page ---
export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState('dashboard');
    const router = useRouter();

    const updateUserState = (updatedUser: User) => {
        // Always keep the earnings history trimmed to prevent quota errors
        if (updatedUser.earningsHistory && updatedUser.earningsHistory.length > 50) {
            updatedUser.earningsHistory = updatedUser.earningsHistory.slice(-50);
        }

        setUser(updatedUser);
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = allUsers.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            allUsers[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(allUsers));
        }
    };

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'loggedInUser' && event.newValue) {
                const updatedUser = JSON.parse(event.newValue);
                setUser(updatedUser);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const userJson = localStorage.getItem('loggedInUser');
        if (!userJson) {
            router.push('/');
            return;
        }

        let currentUser: User = JSON.parse(userJson);
        
        // Initialize earnings fields if they don't exist
        currentUser.totalEarning = currentUser.totalEarning || 0;
        currentUser.earningsHistory = currentUser.earningsHistory || [];

        // Use approvalDate as a fallback to prevent the '1970' bug if lastEarningUpdate is missing.
        const lastUpdateDate = new Date(currentUser.lastEarningUpdate || currentUser.approvalDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight
        lastUpdateDate.setHours(0, 0, 0, 0); // Normalize last update date to midnight

        const msPerDay = 24 * 60 * 60 * 1000;
        // Ensure we are comparing dates only, not times
        const daysSinceLastUpdate = Math.floor((today.getTime() - lastUpdateDate.getTime()) / msPerDay);

        if (daysSinceLastUpdate > 0 && currentUser.status === 'approved') {
            let earningsAdded = 0;
            let newHistory = currentUser.earningsHistory ? [...currentUser.earningsHistory] : [];

            for (let i = 0; i < daysSinceLastUpdate; i++) {
                const date = new Date(lastUpdateDate.getTime() + (i + 1) * msPerDay);
                const dailyEarning = 200;
                currentUser.totalEarning += dailyEarning;
                currentUser.currentBalance = (currentUser.currentBalance || 0) + dailyEarning;
                earningsAdded += dailyEarning;
                newHistory.push({
                    date: date.toISOString(),
                    amount: dailyEarning,
                    description: 'Daily Earning',
                });
            }
            currentUser.lastEarningUpdate = today.toISOString();
            // Keep only the last 50 entries to prevent storage quota issues
            currentUser.earningsHistory = newHistory.slice(-50);
            updateUserState(currentUser);

            Swal.fire({
                icon: 'success',
                title: 'Earnings Updated!',
                text: `You have earned ${earningsAdded} PKR for the last ${daysSinceLastUpdate} day(s).`,
                timer: 3000,
                showConfirmButton: false,
            });
        } else {
            setUser(currentUser);
        }

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };

    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        router.push('/');
    };

    if (!user) {
        return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">Loading...</div>;
    }

    const getPageTitle = () => {
        switch (activeView) {
            case 'withdrawal': return 'Withdrawal';
            case 'referrals': return 'Referrals';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
                <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
                <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <LogoutIcon className="w-6 h-6 text-gray-500" />
                </button>
            </header>

            <main className="flex-grow p-4 md:p-6 mb-20">
                {activeView === 'dashboard' && <DashboardView user={user} />}
                {activeView === 'withdrawal' && <WithdrawalView user={user} setUser={updateUserState} />}
                {activeView === 'referrals' && <ReferralsTab user={user} />}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around py-2 z-20">
                <NavItem icon={<HomeIcon />} label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavItem icon={<WalletIcon />} label="Withdrawal" isActive={activeView === 'withdrawal'} onClick={() => setActiveView('withdrawal')} />
                <NavItem icon={<UsersIcon />} label="Referrals" isActive={activeView === 'referrals'} onClick={() => setActiveView('referrals')} />
            </nav>
        </div>
    );
}

// --- Navigation Item ---
function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-all duration-200 ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-purple-500'}`}>
            {icon}
            <span className="text-xs font-semibold mt-2">{label}</span>
        </button>
    );
}

// --- Dashboard View ---
function DashboardView({ user }: { user: User }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-2xl shadow-xl">
                    <h2 className="text-lg font-semibold text-purple-200">Investment Balance</h2>
                    <p className="text-4xl font-bold mt-2">PKR {user.totalInvestment.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-500 to-teal-400 text-white rounded-2xl shadow-xl">
                    <h2 className="text-lg font-semibold text-green-200">Total Earning</h2>
                    <p className="text-4xl font-bold mt-2">PKR {user.totalEarning.toLocaleString()}</p>
                </div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg">
                 <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                 {user.earningsHistory && user.earningsHistory.length > 0 ? (
                    <ul className="space-y-3">
                        {user.earningsHistory.slice().reverse().map((activity, index) => (
                            <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800">{activity.description}</p>
                                    <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-bold text-green-600">+ {activity.amount} PKR</p>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="text-center text-gray-500 py-4">No recent earnings.</div>
                 )}
            </div>
        </div>
    );
}

// --- Referrals View ---
function ReferralsView({ user }: { user: User }) {
    const [referralLink, setReferralLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // This code runs only on the client-side, ensuring window is available.
        const origin = window.location.origin;
        setReferralLink(`${origin}/register?ref=${user.referralCode}`);
    }, [user.referralCode]);

    const copyToClipboard = () => {
        if (navigator.clipboard && referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Your Referral Link</h2>
            <p className="text-gray-600">Share this link with friends. When they sign up and get approved, you get a referral point!</p>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
                {referralLink ? (
                    <p className="font-mono text-purple-700 break-words">{referralLink}</p>
                ) : (
                    <p className="text-gray-500">Generating link...</p>
                )}
            </div>
            <button onClick={copyToClipboard} disabled={!referralLink} className="w-full py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center disabled:bg-gray-400">
                {copied ? <CheckCircle className="w-6 h-6 mr-2" /> : <ClipboardCopy className="w-6 h-6 mr-2" />}
                {copied ? 'Copied!' : 'Copy Link'}
            </button>
        </div>
    );
}

// --- Withdrawal View ---
function WithdrawalView({ user, setUser }: { user: User; setUser: (user: User) => void }) {
    const [platform, setPlatform] = useState(user.withdrawalInfo?.platform || 'easypaisa');
    const [accountNumber, setAccountNumber] = useState(user.withdrawalInfo?.accountNumber || '');
    const [accountHolderName, setAccountHolderName] = useState(user.withdrawalInfo?.accountHolderName || '');
    const [amount, setAmount] = useState('');
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const [isInfoSaved, setIsInfoSaved] = useState(!!(user.withdrawalInfo?.accountNumber && user.withdrawalInfo?.accountHolderName));

    useEffect(() => {
        const allRequests: WithdrawalRequest[] = JSON.parse(localStorage.getItem('withdrawalRequests') || '[]');
        setHistory(allRequests.filter(req => req.userId === user.id).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
    }, [user.id]);

    const handleSaveInfo = () => {
        if (!accountNumber || !accountHolderName) {
            Swal.fire('Error', 'Please fill in all account details.', 'error');
            return;
        }
        const updatedUser = { ...user, withdrawalInfo: { platform, accountNumber, accountHolderName } };
        setUser(updatedUser);
        setIsInfoSaved(true);
        Swal.fire('Saved!', 'Your account information has been updated.', 'success');
    };

    const handleWithdraw = () => {
        const withdrawalAmount = parseInt(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            Swal.fire({ icon: 'error', title: 'Invalid Amount', text: 'Please enter a valid positive amount.' });
            return;
        }
        if (withdrawalAmount > user.totalEarning) {
            Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: 'Withdrawal amount cannot exceed your total earning.' });
            return;
        }
        if (withdrawalAmount < 1000) {
            Swal.fire({ icon: 'info', title: 'Minimum Withdrawal', text: 'You must withdraw at least 1000 PKR.' });
            return;
        }
        if (user.isWithdrawalEnabled === false && (!user.referrals || user.referrals.length < 2)) {
            Swal.fire({ icon: 'warning', title: 'Referrals Required', text: 'Withdrawal is disabled. You need at least 2 referrals to make a withdrawal.' });
            return;
        }

        const newRequest: WithdrawalRequest = {
            id: `wd-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            amount: withdrawalAmount,
            status: 'pending',
            requestDate: new Date().toISOString(),
            withdrawalInfo: user.withdrawalInfo!,
        };

        const allRequests: WithdrawalRequest[] = JSON.parse(localStorage.getItem('withdrawalRequests') || '[]');
        allRequests.unshift(newRequest);
        localStorage.setItem('withdrawalRequests', JSON.stringify(allRequests));

        const updatedUser = { ...user, totalEarning: user.totalEarning - withdrawalAmount };
        setUser(updatedUser);
        setHistory([newRequest, ...history]);
        setAmount('');
        Swal.fire({ icon: 'success', title: 'Request Submitted!', text: 'Your withdrawal request has been sent for approval.' });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {!isInfoSaved ? (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="font-bold text-lg mb-1">Save Account Information</h3>
                    <p className="text-sm text-gray-500 mb-4">You must save your payment details before requesting a withdrawal.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Platform</label>
                            <select value={platform} onChange={e => setPlatform(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                                <option value="easypaisa">Easypaisa</option>
                                <option value="jazzcash">Jazzcash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                            <input type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <button onClick={handleSaveInfo} className="w-full py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all">Save Information</button>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center mb-6 flex justify-between items-center">
                        <p className="font-semibold text-green-700">Account Information Saved</p>
                        <button onClick={() => setIsInfoSaved(false)} className="text-sm text-blue-600 hover:underline">Edit</button>
                    </div>
                    <h3 className="font-bold text-lg mb-4">Request Withdrawal</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (PKR)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Max: ${user.totalEarning.toLocaleString()}`} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <button onClick={handleWithdraw} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">Request Withdrawal</button>
                    </div>
                </div>
            )}

            <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-4">Withdrawal History</h3>
                {history.length > 0 ? (
                    <ul className="space-y-3">
                        {history.map(req => (
                            <li key={req.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800">{req.amount.toLocaleString()} PKR</p>
                                    <p className="text-sm text-gray-500">{new Date(req.requestDate).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-800' : req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {req.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-500 py-4">No withdrawal history.</div>
                )}
            </div>
        </div>
    );
}