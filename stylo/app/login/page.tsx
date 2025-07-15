'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { User } from '../types';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState(''); // Can be email, username, or phone
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        
        const foundUser = allUsers.find(u => 
            u.email?.toLowerCase() === identifier.toLowerCase() || 
            u.username?.toLowerCase() === identifier.toLowerCase() || 
            u.phone === identifier
        );

        if (!foundUser) {
            Swal.fire('Login Failed', 'User not found. Please check your credentials.', 'error');
            return;
        }

        // If user is approved but hasn't completed their profile, redirect to setup
        if (foundUser.isApproved && !foundUser.profileComplete) {
            localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
            router.push('/profile-setup');
            return;
        }

        // For users with complete profiles, password is required
        if (foundUser.profileComplete) {
            if (foundUser.password === password) {
                localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
                router.push('/dashboard');
            } else {
                Swal.fire('Login Failed', 'Invalid password. Please try again.', 'error');
            }
            return;
        }
        
        // Handle cases for users who are not yet approved
        if (!foundUser.isApproved) {
             Swal.fire('Login Failed', 'Your account has not been approved yet.', 'error');
             return;
        }

        // Fallback for any other unexpected state
        Swal.fire('Login Failed', 'An unexpected error occurred. Please contact support.', 'error');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="identifier" className="text-sm font-medium text-gray-700">Email, Username, or Phone</label>
                        <input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your email, username, or phone"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter password (if set)"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                    >
                        Sign In
                    </button>
                </form>
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
