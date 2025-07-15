'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { User } from '@/app/types';

export default function ApprovalStatusPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [emailExists, setEmailExists] = useState(false);
    const [usernameExists, setUsernameExists] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // This logic assumes an admin has just approved a submission, creating a user record without credentials.
        // We find this user to allow them to set their credentials.
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const approvedUserWithoutCredentials = allUsers.find(u => u.isApproved && !u.email && !u.password);
        
        if (approvedUserWithoutCredentials) {
            setUser(approvedUserWithoutCredentials);
        } 
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        setEmailExists(email.length > 0 && allUsers.some(u => u.email?.toLowerCase() === email.toLowerCase()));
        setUsernameExists(username.length > 0 && allUsers.some(u => u.username?.toLowerCase() === username.toLowerCase()));
    }, [email, username]);

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !email || !password || !username) {
            Swal.fire('Error', 'Please fill in all fields.', 'error');
            return;
        }
        if (emailExists) {
            Swal.fire('Error', 'This email is already registered.', 'error');
            return;
        }
        if (usernameExists) {
            Swal.fire('Error', 'This username is already taken.', 'error');
            return;
        }
        // Optionally, add password strength check here

        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = allUsers.findIndex(u => u.id === user.id);

        if (userIndex !== -1) {
            // Update user with the new credentials
            allUsers[userIndex].email = email;
            allUsers[userIndex].password = password;
            allUsers[userIndex].username = username;
            localStorage.setItem('users', JSON.stringify(allUsers));

            // Automatically log the user in
            localStorage.setItem('loggedInUser', JSON.stringify(allUsers[userIndex]));
            
            // Clean up the submission tracker from localStorage if it exists
            localStorage.removeItem('currentSubmissionId');

            Swal.fire({
                title: 'Account Created!',
                text: 'You will now be redirected to your dashboard.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                router.push('/'); // Redirect to the main user dashboard
            });
        } else {
            Swal.fire('Error', 'Could not find your user record. Please contact support.', 'error');
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Verifying your status...</div>;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="p-10 bg-white rounded-lg shadow-xl text-center">
                    <h1 className="text-3xl font-bold mb-4 text-yellow-600">Status Pending or Not Found</h1>
                    <p className="text-lg text-gray-700">Your submission is under review, or no pending approval was found. Please check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome, {user.name}!</h2>
                <p className="text-center text-gray-600 mb-6">Your account is approved. Create your credentials to continue.</p>
                <form onSubmit={handleCreateAccount} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="text-sm font-bold text-gray-600 block">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full p-3 mt-1 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                        {usernameExists && (
                            <p className="text-red-600 text-xs mt-1">This username is already taken.</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-600 block">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full p-3 mt-1 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                        {emailExists && (
                            <p className="text-red-600 text-xs mt-1">This email is already registered.</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full p-3 mt-1 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                        />
                    </div>
                    <button type="submit" className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all" disabled={emailExists || usernameExists}>
                        Create Account & Login
                    </button>
                </form>
            </div>
        </div>
    );
}
