import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/app/types';

const dbPath = path.join(process.cwd(), 'db.json');

async function getUsers(): Promise<User[]> {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data).users || [];
    } catch (error) {
        return [];
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    try {
        const users = await getUsers();
        const isTaken = users.some(user => user.username?.toLowerCase() === username.toLowerCase());

        return NextResponse.json({ available: !isTaken });

    } catch (error) {
        console.error('Failed to check username:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
