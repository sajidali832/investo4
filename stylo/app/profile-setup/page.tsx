'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';

// Debounce function to limit API calls
function debounce(func: Function, delay: number) {
    let timeout: NodeJS.Timeout;
    return function(...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

export default function ProfileSetup() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        if (!loggedInUser.id) {
            router.push('/login');
        } else {
            setUser(loggedInUser);
            setEmail(loggedInUser.email || '');
        }
    }, [router]);

    const checkUsername = async (name: string) => {
        if (name.length < 3) {
            setIsUsernameAvailable(null);
            return;
        }
        try {
            const res = await fetch(`/api/check-username?username=${name}`);
            const data = await res.json();
            setIsUsernameAvailable(data.available);
        } catch (err) {
            console.error('Failed to check username', err);
            setIsUsernameAvailable(null);
        }
    };

    const debouncedCheckUsername = debounce(checkUsername, 500);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        setUsername(name);
        debouncedCheckUsername(name);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !isUsernameAvailable) {
            setError('Please choose an available username.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, username, email, password }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Failed to update profile.');
            }

            const updatedUser = await response.json();
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 text-purple-400">Complete Your Profile</h1>
                <p className="text-center text-gray-400 mb-8">Choose a username and set your password to get started.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                        <div className="relative">
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm">
                                {isUsernameAvailable === true && <span className="text-green-500">Available</span>}
                                {isUsernameAvailable === false && <span className="text-red-500">Taken</span>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading || !isUsernameAvailable}
                        className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-gray-500"
                    >
                        {isLoading ? 'Saving...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
