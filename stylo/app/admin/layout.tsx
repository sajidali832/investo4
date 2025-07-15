'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../components/admin/Sidebar';
import AdminLoginPage from './login/page';

// This layout component enforces a login gate for the admin panel.
// It shows only the login page if not authenticated,
// and the full dashboard layout if authenticated, preventing content flashes.

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start with loading state
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Check authentication status from localStorage
        const authStatus = localStorage.getItem('isAdminAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
        setIsLoading(false); // Finished checking

        // If not authenticated and not on the login page, redirect there
        if (!authStatus && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [pathname, router]);

    // While checking auth status, render a blank screen to prevent flashes
    if (isLoading) {
        return <div className="w-screen h-screen bg-gray-100"></div>;
    }

    // If the user is not authenticated, show the login page.
    // The `onLoginSuccess` callback updates the state and triggers a re-render.
    if (!isAuthenticated) {
        return <AdminLoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    // If authenticated, render the full admin dashboard layout
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64"> {/* Add margin to avoid overlap */}
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
