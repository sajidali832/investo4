'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { User } from '@/app/types';

export default function SignupPage() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [referral, setReferral] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Get referral code from URL if present
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref) setReferral(ref);
        }
    }, []);

    const handleVerifyPhone = (e: React.FormEvent) => {
        e.preventDefault();
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = allUsers.find(u => u.phone === phone);

        if (foundUser && foundUser.isApproved && !foundUser.email) {
            setUserId(foundUser.id);
            setName(foundUser.name);
            setStep(2);
        } else if (foundUser && foundUser.email) {
            Swal.fire('Account Already Exists', 'An account with this phone number has already been set up. Please log in.', 'info');
        } else {
            Swal.fire('Verification Failed', 'This phone number is not associated with an approved user, or registration is not yet permitted.', 'error');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        // Duplicate email/username check
        const emailExists = allUsers.some(u => u.email?.toLowerCase() === email.toLowerCase());
        const usernameExists = allUsers.some(u => u.username?.toLowerCase() === username.toLowerCase());
        if (emailExists) {
            Swal.fire('Email Exists', 'This email is already registered. Please use another.', 'error');
            return;
        }
        if (usernameExists) {
            Swal.fire('Username Exists', 'This username is already taken. Please choose another.', 'error');
            return;
        }
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            allUsers[userIndex].name = name;
            allUsers[userIndex].email = email;
            allUsers[userIndex].password = password;
            allUsers[userIndex].username = username;
            if (referral) allUsers[userIndex].referredBy = referral;
            localStorage.setItem('users', JSON.stringify(allUsers));
            Swal.fire('Signup Successful!', 'Your account has been created. Please log in.', 'success');
            router.push('/login');
        } else {
            Swal.fire('Error', 'An unexpected error occurred. Please try again.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                {step === 1 ? (
                    <form onSubmit={handleVerifyPhone} className="space-y-6">
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your Account</h1>
                        <p className="text-center text-sm text-gray-600">First, please verify the phone number you used for your investment.</p>
                        <div>
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="03123456789"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                            Verify Phone Number
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-6">
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Complete Registration</h1>
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder="Choose a username" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder="you@example.com" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder="••••••••" required />
                        </div>
                        {referral && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Referral</label>
                                <input type="text" value={referral} disabled className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100" />
                            </div>
                        )}
                        <button type="submit" className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                            Create Account
                        </button>
                    </form>
                )}
                 <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account? <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
