'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdminAuthenticated') === 'true';
        setIsAuthenticated(isAdmin);
        if (!isAdmin) {
            router.replace('/admin/login');
        }
    }, [router]);

    if (isAuthenticated === null) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>; // Or a proper loading spinner
    }

    if (!isAuthenticated) {
        return <div className="flex items-center justify-center h-screen">Redirecting to login...</div>; // This will be shown briefly before redirect
    }

    return (
        <>
            {children}
        </>
    );
}
