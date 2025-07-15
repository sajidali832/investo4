'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Define the User type
interface User {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  phone: string;
  // other properties...
}

// A simple way to track the "logged in" user. 
// After form submission, we can store the phone number.
const getSessionUserPhone = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('currentUserPhone');
    }
    return null;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userPhone = getSessionUserPhone();
    if (!userPhone) {
        // If no user is in session, they should be on the homepage.
        // If they try to access dashboard directly, redirect them.
        if (pathname.includes('/dashboard')) {
            router.replace('/');
        } else {
            setIsLoading(false);
        }
        return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(u => u.phone === userPhone);

    if (currentUser?.status === 'approved') {
        // If approved, they should be on the dashboard.
        if (!pathname.includes('/dashboard')) {
            router.replace('/dashboard');
        } else {
            setIsLoading(false);
        }
    } else {
        // If pending or rejected, they should be on the homepage.
        if (pathname.includes('/dashboard')) {
            router.replace('/');
        } else {
            setIsLoading(false);
        }
    }
  }, [pathname, router]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-lg font-semibold text-gray-700">Loading...</div>
        </div>
    );
  }

  return <>{children}</>;
}
