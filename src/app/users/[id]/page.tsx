'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

type User = {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer' | string;
    createdAt: string;
    plan?: 'free' | 'pro' | 'enterprise' | null;
};

async function fetchUser(id: string) {
    const res = await fetch(`/api/users/${id}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to load user');
    }
    return res.json();
}

export default function UserPage({ params }: { params: { id: string } }) {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['user', params.id],
        queryFn: () => fetchUser(params.id),
    });

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error loading user</div>;
    }

    if (!user) {
        return <div className="p-6">User not found</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/users" className="text-blue-600 hover:underline">
                    ← Back to Users
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">User Details</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID</label>
                        <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <span className="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plan</label>
                        <span className="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {user.plan || 'No plan'}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Created At</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
