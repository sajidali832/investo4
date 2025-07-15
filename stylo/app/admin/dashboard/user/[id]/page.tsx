'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/app/types/index';
import { ArrowLeft, Edit, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

const ToggleSwitch = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void; }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">{checked ? 'Enabled' : 'Disabled'}</span>
        </label>
    </div>
);

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');

    const fetchUser = useCallback(() => {
        if (!id) return;
        setIsLoading(true);
        try {
            const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = usersFromStorage.find((u: User) => u.id === id);
            if (currentUser) {
                setUser(currentUser);
                setEditedName(currentUser.name);
                setEditedPhone(currentUser.phone);
            } else {
                Swal.fire('Error', 'User not found.', 'error').then(() => router.push('/admin/dashboard'));
            }
        } catch (error) {
            console.error("Failed to fetch user data", error);
            Swal.fire('Error', 'Failed to load user data.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const updateUserInStorage = (updatedUser: User) => {
        try {
            // Update the general users list
            const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = usersFromStorage.map((u: User) => (u.id === updatedUser.id ? updatedUser : u));
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            // If the updated user is the currently logged-in user, update their specific object too
            const loggedInUserJson = localStorage.getItem('loggedInUser');
            if (loggedInUserJson) {
                const loggedInUser = JSON.parse(loggedInUserJson);
                if (loggedInUser.id === updatedUser.id) {
                    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
                }
            }

            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to update user data", error);
            Swal.fire('Error', 'Failed to save user data.', 'error');
        }
    };

    const handleSaveDetails = () => {
        if (user) {
            const updatedUser = { ...user, name: editedName, phone: editedPhone };
            updateUserInStorage(updatedUser);
            setIsEditMode(false);
            Swal.fire('Saved!', 'User details have been updated.', 'success');
        }
    };

    const handleBalanceChange = async (balanceType: 'totalInvestment' | 'totalEarning', operation: 'add' | 'subtract') => {
        if (!user) return;

        const { value: amount } = await Swal.fire({
            title: `${operation === 'add' ? 'Add to' : 'Subtract from'} ${balanceType === 'totalInvestment' ? 'Investment' : 'Earning'} Balance`,
            input: 'number',
            inputLabel: 'Amount (PKR)',
            inputValue: 0,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            inputValidator: (value) => {
                if (!value || parseFloat(value) <= 0) return 'Please enter a valid positive amount!';
                return null;
            }
        });

        if (amount) {
            const numericAmount = parseFloat(amount);
            const currentBalance = user[balanceType] || 0;
            let newBalance = operation === 'add' ? currentBalance + numericAmount : currentBalance - numericAmount;

            if (newBalance < 0) {
                newBalance = 0;
                Swal.fire('Warning', 'Balance cannot be negative. It has been set to 0.', 'warning');
            }

            const updatedUser = { ...user, [balanceType]: newBalance };
            updateUserInStorage(updatedUser);
            Swal.fire('Success', `Balance updated successfully. New balance: ${newBalance.toFixed(2)} PKR`, 'success');
        }
    };

    const handleToggleWithdrawal = () => {
        if (user) {
            const updatedUser = { ...user, isWithdrawalEnabled: !user.isWithdrawalEnabled };
            updateUserInStorage(updatedUser);
            Swal.fire('Status Updated', `Withdrawals are now ${updatedUser.isWithdrawalEnabled ? 'enabled' : 'disabled'}.`, 'success');
        }
    };

    const handleDeleteUser = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the user.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
                    const updatedUsers = usersFromStorage.filter((u: User) => u.id !== id);
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    Swal.fire('Deleted!', 'The user has been deleted.', 'success').then(() => {
                        router.push('/admin/dashboard');
                    });
                } catch (error) {
                    console.error("Failed to delete user", error);
                    Swal.fire('Error', 'Failed to delete user.', 'error');
                }
            }
        });
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!user) return <div className="flex items-center justify-center h-screen">User not found. Redirecting...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/dashboard" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 space-y-8">
                    
                    <div className="border-b pb-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
                            <button onClick={() => setIsEditMode(!isEditMode)} className="p-2 rounded-full hover:bg-gray-100">
                                {isEditMode ? <Save size={20} className="text-blue-600"/> : <Edit size={20} className="text-gray-500"/>}
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Name</label>
                                {isEditMode ? (
                                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                                ) : (
                                    <p className="text-gray-900 font-semibold">{user.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Phone</label>
                                {isEditMode ? (
                                    <input type="text" value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                                ) : (
                                    <p className="text-gray-900 font-semibold">{user.phone}</p>
                                )}
                            </div>
                        </div>
                        {isEditMode && <button onClick={handleSaveDetails} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"><Save size={16} className="mr-2"/>Save Changes</button>}
                    </div>

                    <div className="border-b pb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Financials</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Investment Balance</p>
                                <p className="text-2xl font-bold text-gray-800">PKR {(user.totalInvestment || 0).toFixed(2)}</p>
                                <div className="mt-2 space-x-2">
                                    <button onClick={() => handleBalanceChange('totalInvestment', 'add')} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200">Add</button>
                                    <button onClick={() => handleBalanceChange('totalInvestment', 'subtract')} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200">Subtract</button>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Earning Balance</p>
                                <p className="text-2xl font-bold text-gray-800">PKR {(user.totalEarning || 0).toFixed(2)}</p>
                                <div className="mt-2 space-x-2">
                                    <button onClick={() => handleBalanceChange('totalEarning', 'add')} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200">Add</button>
                                    <button onClick={() => handleBalanceChange('totalEarning', 'subtract')} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200">Subtract</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b pb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Settings</h2>
                        <ToggleSwitch label="Withdrawal Status" checked={user.isWithdrawalEnabled} onChange={handleToggleWithdrawal} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
                        <button onClick={handleDeleteUser} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            <Trash2 size={16} className="mr-2" />
                            Delete User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
