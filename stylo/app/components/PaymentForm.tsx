'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PaymentSubmission, User } from '../types';

interface PaymentFormProps {
    referralCode?: string | null;
}

export default function PaymentForm({ referralCode }: PaymentFormProps) {
    const [holderName, setHolderName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [platform, setPlatform] = useState('Easypaisa');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const router = useRouter();
    const [emailExists, setEmailExists] = useState(false);

    useEffect(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        setEmailExists(email.length > 0 && allUsers.some(user => user.email && user.email.toLowerCase() === email.toLowerCase()));
    }, [email]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (emailExists) {
            Swal.fire('Error', 'This email is already registered. Please use a different email.', 'error');
            return;
        }

        if (!screenshot) {
            Swal.fire('Error', 'Please upload a screenshot of your payment.', 'error');
            return;
        }

        const newSubmissionId = `sub-${Date.now()}`;
        const reader = new FileReader();
        reader.onloadend = () => {
            const newSubmission: PaymentSubmission = {
                id: newSubmissionId,
                holderName,
                email,
                phone,
                platform,
                screenshot: reader.result as string,
                status: 'pending',
                submissionDate: new Date().toISOString(),
                referralCode: referralCode || undefined,
            };

            const submissions = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');
            submissions.push(newSubmission);
            const trimmedSubmissions = submissions.slice(-10);
            localStorage.setItem('paymentSubmissions', JSON.stringify(trimmedSubmissions));
            localStorage.setItem('currentSubmissionId', newSubmissionId);

            Swal.fire(
                'Submission Successful!',
                'Your payment proof is pending review. You will now be taken to the status page.',
                'success'
            ).then(() => {
                router.push('/approval-status');
            });
        };

        reader.readAsDataURL(screenshot);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="holderName" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input type="text" id="holderName" value={holderName} onChange={(e) => setHolderName(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" required />
                {emailExists && (
                    <p className="text-red-600 text-xs mt-1">This email is already registered. Please use a different email.</p>
                )}
            </div>
            <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Your Phone Number</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder="03123456789" required />
            </div>
            <div>
                <label htmlFor="platform" className="text-sm font-medium text-gray-700">Your Payment Platform</label>
                <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm">
                    <option>Easypaisa</option>
                    <option>JazzCash</option>
                </select>
            </div>
            <div>
                <label htmlFor="screenshot" className="text-sm font-medium text-gray-700">Payment Screenshot</label>
                <input
                    id="screenshot"
                    type="file"
                    onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    accept="image/*"
                    required
                />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-all" disabled={emailExists}>
                Submit for Approval
            </button>
        </form>
    );
}
