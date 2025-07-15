'use client';

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HomePage() {
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [accountName, setAccountName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferredBy(refCode);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Referral code applied!',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }, []);

  const copyToClipboard = () => {
    const paymentNumber = '03130306344';
    navigator.clipboard.writeText(paymentNumber);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Copied to clipboard!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !phoneNumber || !screenshot) {
        Swal.fire('Error', 'Please fill all fields and upload a screenshot.', 'error');
        return;
    }

    // Prevent duplicate phone numbers
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const phoneExists = users.some((u: any) => u.phone === phoneNumber);
    if (phoneExists) {
      Swal.fire('Error', 'This phone number is already registered. Please use another.', 'error');
      return;
    }

    const newUser = {
        id: phoneNumber, // Use phone number as a unique ID
        name: accountName,
        phone: phoneNumber,
        paymentMethod,
        screenshot,
        amount: 6000,
        status: 'pending', // pending, approved, rejected
        applicationDate: new Date().toISOString(),
        referredBy: referredBy,
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    // Set the current user's phone in session for routing
    localStorage.setItem('currentUserPhone', phoneNumber);

    Swal.fire(
        'Request Submitted!',
        'Thank you. Please wait up to 10 minutes for admin approval.',
        'success'
    );

    // Reset form
    setAccountName('');
    setPhoneNumber('');
    setScreenshot(null);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="text-center my-8">
        <h1 className="text-5xl font-extrabold text-gray-800">INVESTO</h1>
      </header>

      <main className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h2 className="text-3xl font-bold text-indigo-600">Invest PKR 6000 & Earn Daily Profit</h2>
          <p className="text-gray-500 mt-2">Withdraw anytime after your balance reaches PKR 1000.</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 my-6 rounded-lg shadow">
          <h3 className="font-bold">Payment Instructions</h3>
          <p className="mt-1">Please send exactly <strong>PKR 6000</strong> to the following account:</p>
          <div className="flex items-center justify-between mt-3 bg-gray-200 p-3 rounded-md">
            <div>
                <span className="block text-sm text-gray-600">Account Holder: Sajid</span>
                <span id="payment-number" className="font-mono text-lg">03130306344</span>
            </div>
            <button onClick={copyToClipboard} className="p-2 rounded-md hover:bg-gray-200" title="Copy to Clipboard">
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-center text-gray-700">Submit Your Investment</h3>
            <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Platform</label>
                <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>JazzCash</option>
                    <option>EasyPaisa</option>
                </select>
            </div>
             <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input type="text" id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Your Phone Number</label>
                <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">Upload Payment Screenshot</label>
                <input type="file" id="screenshot" accept="image/*" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {screenshot && <img src={screenshot} alt="Screenshot Preview" className="mt-2 rounded-md max-h-40"/>}
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Investment Amount</label>
                <p className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm">PKR 6000</p>
            </div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
                Submit for Approval
            </button>
        </form>
      </main>
    </div>
  );
}
