'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Main App Entry Point
export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userJson = localStorage.getItem('loggedInUser');
        if (userJson) {
            router.push('/dashboard');
        } else {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-purple-900">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        An Investment in Your Future
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Unlock your financial potential. Join a trusted community and see your investment grow.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/payment-proof')}
                            className="w-full sm:w-auto bg-purple-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-1"
                        >
                            Invest 6000 PKR
                        </button>
                        <Link href="/login" className="w-full sm:w-auto border border-purple-400 text-purple-400 font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-400 hover:text-white transition-all duration-300">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-900">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-12 text-gray-100">What Our Investors Say</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Testimonial 1 (English) */}
                        <div className="bg-gray-800 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <p className="text-gray-300 mb-6 text-lg italic">"This is a game-changer! I invested with some hesitation, but I'm incredibly happy with the returns. The platform is transparent and easy to use. I finally feel in control of my financial future."
                            </p>
                            <p className="text-purple-400 font-bold text-xl">Ayesha Khan</p>
                            <p className="text-gray-500">Lahore, Pakistan</p>
                        </div>

                        {/* Testimonial 2 (Urdu) */}
                        <div className="bg-gray-800 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <p className="text-gray-300 mb-6 text-lg italic" dir="rtl" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                                "یہ ایک بہترین پلیٹ فارم ہے۔ میں نے سرمایہ کاری کی اور اب میں بہت خوش ہوں۔ پیسہ کمانا اتنا آسان کبھی نہیں تھا۔ میں ہر کسی کو اس میں شامل ہونے کی سفارش کرتا ہوں۔"
                            </p>
                            <p className="text-purple-400 font-bold text-xl">Bilal Ahmed</p>
                            <p className="text-gray-500">Karachi, Pakistan</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
