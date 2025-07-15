'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PaymentForm from '@/app/components/PaymentForm';

function RegisterPage() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref');

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800">Create Your Account</h1>
                <p className="text-center text-gray-600">
                    Complete the payment to start your investment journey.
                </p>
                {refCode && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md text-center">
                        <p>You've been referred by a friend! Your referral code is: <strong>{refCode}</strong></p>
                    </div>
                )}
                <PaymentForm referralCode={refCode} />
            </div>
        </div>
    );
}

// Wrap the page in a Suspense boundary because useSearchParams() requires it.
export default function Register() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterPage />
        </Suspense>
    );
}
