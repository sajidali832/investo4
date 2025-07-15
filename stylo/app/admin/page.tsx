'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page acts as a redirector to the admin dashboard.
export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/dashboard');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            Redirecting to admin dashboard...
        </div>
    );
}
