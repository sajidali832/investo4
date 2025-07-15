'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// This component receives a callback function to signal a successful login.
export default function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, this would be a secure check against a backend.
        if (password === 'admin') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                if (onLoginSuccess) {
                    onLoginSuccess(); // Notify the layout that login was successful
                }
                router.push('/admin/dashboard'); // Redirect to the dashboard
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Incorrect password!',
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">INVESTO</h1>
                    <p className="text-md text-gray-500">Admin Panel Login</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-lg text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Password"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
