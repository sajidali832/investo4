export interface EarningsRecord {
    date: string;
    amount: number;
    description: string;
}

export interface User {
    id: string;
    name: string;
    phone: string;
    username: string;
    email?: string;
    password?: string;
    isApproved: boolean;
    isWithdrawalEnabled: boolean;
    totalInvestment: number;
    totalEarning: number;
    totalWithdrawals: number;
    referralCode: string;
    referredBy?: string;
    referrals?: string[];
    approvalDate: string;
    applicationDate: string;
    status: 'pending' | 'approved' | 'rejected';
    withdrawalInfo?: {
        platform: string;
        accountNumber: string;
        accountHolderName: string;
    };
    lastEarningUpdate?: string;
    earningsHistory?: EarningsRecord[];
    // Properties for admin panel
    paymentMethod?: string;
    screenshot?: string;
    lastLogin?: string;
    currentBalance?: number;
    profileComplete?: boolean;
}

export interface PaymentSubmission {
    id: string;
    holderName: string;
    email: string;
    phone: string;
    platform: string;
    screenshot: string;
    status: 'pending' | 'approved' | 'rejected';
    submissionDate: string;
    referralCode?: string;
}

export interface WithdrawalRequest {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
    withdrawalInfo: {
        platform: string;
        accountNumber: string;
        accountHolderName: string;
    };
}
