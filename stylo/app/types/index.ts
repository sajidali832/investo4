export interface EarningsRecord {
    date: string; // ISO date string
    amount: number;
    description: string;
}

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    password?: string;
    isApproved: boolean;
    isWithdrawalEnabled: boolean;
    lastEarningsUpdate?: string; // ISO date string
    currentBalance: number; // This will represent the total investment
    totalInvestment: number;
    totalEarning: number; // This will be the new withdrawable balance
    totalWithdrawals: number;
    referralCode?: string;
    referredBy?: string;
    referrals?: string[];
    withdrawalInfo?: {
        platform: string;
        accountNumber: string;
        accountHolderName: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    approvalDate?: string;
    applicationDate: string;
    paymentMethod?: string;
    screenshot?: string;
    lastLogin?: string;
    earningsHistory?: EarningsRecord[];
    username: string;
}

export interface WithdrawalRequest {
    id: string;
    userId: string;
    userName: string;
    userBalance: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
}

