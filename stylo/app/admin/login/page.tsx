'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import LoginPage from './components/LoginPage';

// This component receives a callback function to signal a successful login.
export default function AdminLogin() {
    return <LoginPage />;
}
