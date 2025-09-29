'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // Инициализация состояния из URL параметров
    const [pageSize, setPageSize] = useState(() => parseInt(searchParams.get('limit') || '20'));
    const [search, setSearch] = useState(() => searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<'email' | 'createdAt' | 'role'>(() =>
        (searchParams.get('sortBy') as 'email' | 'createdAt' | 'role') || 'email'
    );
    const [desc, setDesc] = useState(() => searchParams.get('desc') === 'true');
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1'));

    // Debounce для поиска
    const debouncedSearch = useDebounce(search, 300);

    // Функция для обновления URL
    const updateURL = (params: {
        search?: string;
        sortBy?: string;
        desc?: boolean;
        pageSize?: number;
        page?: number;
    }) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        if (params.search !== undefined) {
            if (params.search) newSearchParams.set('search', params.search);
            else newSearchParams.delete('search');
        }
        if (params.sortBy !== undefined) newSearchParams.set('sortBy', params.sortBy);
        if (params.desc !== undefined) newSearchParams.set('desc', params.desc.toString());
        if (params.pageSize !== undefined) newSearchParams.set('limit', params.pageSize.toString());
        if (params.page !== undefined) newSearchParams.set('page', params.page.toString());

        router.replace(`/users?${newSearchParams.toString()}`, { scroll: false });
    };

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

    // Обновление URL при изменении параметров
    useEffect(() => {
        updateURL({ search: debouncedSearch });
    }, [debouncedSearch]);

    useEffect(() => {
        updateURL({ sortBy, desc });
    }, [sortBy, desc]);

    useEffect(() => {
        updateURL({ pageSize });
    }, [pageSize]);

    useEffect(() => {
        updateURL({ page: currentPage });
    }, [currentPage]);

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

    // Скелетон для загрузки
    const LoadingSkeleton = () => (
        <div className="rounded-xl border">
            <div className="p-3 bg-gray-50">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 border-t">
                    <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Компонент ошибки
    const ErrorComponent = ({ error }: { error: any }) => {
        const isNotFound = error?.message?.includes('404') || error?.message?.includes('not found');
        const isServerError = error?.message?.includes('500') || error?.message?.includes('server');

        return (
            <div className="rounded-xl border p-8 text-center">
                <div className="text-red-600 mb-4">
                    {isNotFound ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2">Пользователи не найдены</h3>
                            <p className="text-sm">Попробуйте изменить параметры поиска</p>
                        </>
                    ) : isServerError ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2">Что-то пошло не так</h3>
                            <p className="text-sm">Проблема на сервере, попробуйте позже</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
                            <p className="text-sm">Не удалось загрузить данные</p>
                        </>
                    )}
                </div>
                <div className="flex gap-2 justify-center">
                    {isNotFound ? (
                        <Button onClick={() => setSearch('')}>
                            Очистить фильтр
                        </Button>
                    ) : (
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>
                            Попробовать еще
                        </Button>
                    )}
                </div>
            </div>
        );
    };

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

            {usersQuery.isLoading ? (
                <LoadingSkeleton />
            ) : usersQuery.error ? (
                <ErrorComponent error={usersQuery.error} />
            ) : usersQuery.data?.data?.length === 0 ? (
                <div className="rounded-xl border p-8 text-center">
                    <div className="text-gray-600 mb-4">
                        <h3 className="text-lg font-semibold mb-2">Пользователи не найдены</h3>
                        <p className="text-sm">Попробуйте изменить параметры поиска или фильтры</p>
                    </div>
                    <Button onClick={() => {
                        setSearch('');
                        setCurrentPage(1);
                        setSortBy('email');
                        setDesc(false);
                        setPageSize(20);
                        queryClient.invalidateQueries({ queryKey: ['users'] });
                        router.replace('/users', { scroll: false });
                    }}>
                        Сбросить фильтры
                    </Button>
                </div>
            ) : (
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
            )}

            <div className="mt-4 flex gap-2">
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>Reload</Button>
                <Button onClick={() => console.log(JSON.stringify(usersQuery.data))}>Debug</Button>
            </div>

            {usersQuery?.data && !usersQuery.isLoading && !usersQuery.error && (
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
