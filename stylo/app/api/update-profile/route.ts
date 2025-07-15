import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/app/types';

const dbPath = path.join(process.cwd(), 'db.json');

async function getDb() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

async function saveDb(data: any) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
    const { userId, username, email, password } = await request.json();

    if (!userId || !username || !email || !password) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const userIndex = db.users.findIndex((u: User) => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check if username is already taken by another user
        const isUsernameTaken = db.users.some((u: User) => u.id !== userId && u.username?.toLowerCase() === username.toLowerCase());
        if (isUsernameTaken) {
            return NextResponse.json({ message: 'Username is already taken' }, { status: 409 });
        }

        // In a real app, hash the password. For now, storing it as is.
        db.users[userIndex] = {
            ...db.users[userIndex],
            username,
            email,
            password, // WARNING: Storing plain text passwords is not secure.
            profileComplete: true,
        };

        await saveDb(db);

        return NextResponse.json(db.users[userIndex]);

    } catch (error) {
        console.error('Failed to update profile:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
