'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, UserX, LogOut, CircleDollarSign, Share2, ShieldCheck, CheckSquare } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        router.push('/admin/login');
    };

    const navLinks = [
        {
            href: '/admin/dashboard',
            label: 'All Users',
            icon: LayoutDashboard,
            exact: true
        },
        {
            href: '/admin/dashboard/pending',
            label: 'Pending',
            icon: Users
        },
        {
            href: '/admin/dashboard/approved',
            label: 'Approved',
            icon: UserCheck
        },
        {
            href: '/admin/dashboard/rejected',
            label: 'Rejected',
            icon: UserX
        },
        {
            href: '/admin/dashboard/withdrawals',
            label: 'Withdrawals',
            icon: CircleDollarSign
        },
        {
            href: '/admin/dashboard/referrals',
            label: 'Referrals',
            icon: Share2
        },
        {
            href: '/admin/dashboard/accounts',
            label: 'Accounts',
            icon: ShieldCheck
        },
        {
            href: '/admin/dashboard/approvals',
            label: 'Approvals',
            icon: CheckSquare
        }
    ];

    return (
        <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed">
            <div className="p-6">
                <h1 className="text-2xl font-bold">INVESTO</h1>
                <p className="text-sm text-gray-400">Admin Panel</p>
            </div>
            <nav className="flex-1 px-4 py-2 space-y-2">
                {navLinks.map((link) => {
                    const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                    return (
                        <Link href={link.href} key={link.href}>
                            <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                                isActive
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}>
                                <link.icon className="w-5 h-5 mr-3" />
                                <span>{link.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
