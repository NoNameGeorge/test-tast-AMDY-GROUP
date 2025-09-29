'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Типизация параметров для fetchUsers
type FetchUsersParams = {
    limit: number;
    search: string;
    sortBy: 'email' | 'createdAt' | 'role';
    desc: boolean;
};

// Хук для debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

type User = {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer' | string;
    createdAt: string;
    plan?: 'free' | 'pro' | 'enterprise' | null;
};

async function fetchUsers(params: FetchUsersParams) {
    const q = new URLSearchParams({
        limit: params.limit.toString(),
        search: params.search,
        sortBy: params.sortBy,
        desc: params.desc.toString()
    }).toString();

    const res = await fetch('/api/users?' + q, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to load');
    }
    return res.json();
}

export default function UsersPage() {
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'email' | 'createdAt' | 'role'>('email');
    const [desc, setDesc] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();

    // Debounce для поиска
    const debouncedSearch = useDebounce(search, 300);

    const usersQuery = useQuery({
        queryKey: ['users', { limit: pageSize, search: debouncedSearch, sortBy, desc, page: currentPage }],
        queryFn: () => fetchUsers({ limit: pageSize, search: debouncedSearch, sortBy, desc }),
        refetchOnWindowFocus: true,
        retry: 3,
        // onSuccess: (payload: any) => {
        //     if (payload?.data?.length === 1) {
        //         setSelectedRowId(payload.data[0].id);
        //     }
        // },
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
    }, [debouncedSearch, sortBy, desc, pageSize, currentPage, queryClient]);

    const columnHelper = createColumnHelper<User>();
    const columns = [
        columnHelper.accessor('email', {
            header: () => <span>Email</span>,
            cell: (info) => {
                const u = info.row.original;
                return (
                    <div onClick={() => setSelectedRowId(u.id)}>
                        <Link href={`/users/${u.id}`}>{u.email}</Link>
                        <div>{new Date(u.createdAt).toLocaleString()}</div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('role', {
            header: 'Role',
            cell: (info) => <span>{info.getValue()}</span>,
        }),
        columnHelper.accessor('plan', {
            header: 'Plan',
            cell: (info) => info.getValue() || '—',
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => {
                const user = info.row.original;
                const canEdit = user.role !== 'admin';
                return (
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                const res = await fetch('/api/users/' + user.id + '/refresh', { method: 'POST' });
                                if (res.ok) {
                                    queryClient.invalidateQueries({ queryKey: ['users'] });
                                }
                            }}
                            disabled={!canEdit}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => fetch('/api/users/' + user.id, { method: 'DELETE' })}
                            disabled={!canEdit}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        }),
    ];

    const data: User[] = usersQuery.data?.data || [];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        debugTable: process.env.NODE_ENV !== 'production',
    });

    const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

    if (usersQuery.isLoading) {
        return <div>Loading...</div>;
    }
    if (usersQuery.error) {
        return <div role="alert">Something went wrong</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <input
                    placeholder="Search email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-3 py-2 rounded-md w-64"
                />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border px-2 py-2 rounded-md">
                    <option value="email">Email</option>
                    <option value="createdAt">Created</option>
                    <option value="role">Role</option>
                </select>
                <Button onClick={() => setDesc((d) => !d)}>{desc ? 'Desc' : 'Asc'}</Button>
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border px-2 py-2 rounded-md">
                    {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}/page</option>
                    ))}
                </select>
                {isTouch && <span className="text-xs opacity-60">Touch mode</span>}
            </div>

            <div className="rounded-xl border">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((h) => (
                                    <th key={h.id} className="text-left p-3">
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className={row.original.id === selectedRowId ? 'bg-muted' : ''}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3 border-t">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2">
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>Reload</Button>
                <Button onClick={() => console.log(JSON.stringify(usersQuery.data))}>Debug</Button>
            </div>

            {usersQuery?.data && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Показано {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, usersQuery.data.total)} из {usersQuery.data.total} пользователей
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Назад
                        </Button>
                        <span className="px-3 py-1 text-sm">
                            Страница {currentPage} из {usersQuery.data.totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, usersQuery.data.totalPages))}
                            disabled={currentPage >= usersQuery.data.totalPages}
                        >
                            Вперед
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
