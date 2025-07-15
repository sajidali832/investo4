'use client';

import Link from 'next/link';
import { Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import PaymentForm from '../components/PaymentForm';

const PaymentDetail = ({ label, value, isCopyable = false }: { label: string; value: string; isCopyable?: boolean }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copied!', showConfirmButton: false, timer: 1500 });
    };

    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-gray-900">{value}</span>
                {isCopyable && (
                    <button onClick={handleCopy} type="button" className="p-1 text-gray-500 hover:text-purple-600">
                        <Copy size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default function PaymentProofPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Submit Payment Proof</h1>
                <p className="text-center text-sm text-gray-500 mb-6">Send your payment to the details below, then submit this form.</p>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 border">
                    <h2 className="font-semibold text-center text-gray-700">Payment Details</h2>
                    <PaymentDetail label="Platform" value="Easypaisa" />
                    <PaymentDetail label="Account Name" value="Zulekhan" />
                    <PaymentDetail label="Account Number" value="03130306344" isCopyable />
                </div>

                <PaymentForm />

                <div className="text-center mt-6">
                    <Link href="/" className="text-sm font-medium text-purple-600 hover:text-purple-500">Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
