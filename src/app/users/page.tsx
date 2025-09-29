'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

type FetchUsersParams = {
    limit: PageSize;
    search: string;
    sortBy: SortBy;
    desc: boolean;
};

type SortBy = 'email' | 'createdAt' | 'role';
type UserRole = 'admin' | 'editor' | 'viewer';
type UserPlan = 'free' | 'pro' | 'enterprise' | null;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'email', label: 'Email' },
    { value: 'createdAt', label: 'Дата создания' },
    { value: 'role', label: 'Роль' }
];

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

type User = {
    id: string;
    email: string;
    role: UserRole;
    createdAt: string;
    plan: UserPlan;
};

type UsersResponse = {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
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

    const [pageSize, setPageSize] = useState<PageSize>(() => {
        const limit = parseInt(searchParams.get('limit') || '20');
        return PAGE_SIZE_OPTIONS.includes(limit as PageSize) ? (limit as PageSize) : 20;
    });
    const [search, setSearch] = useState(() => searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<SortBy>(() =>
        (searchParams.get('sortBy') as SortBy) || 'email'
    );
    const [desc, setDesc] = useState(() => searchParams.get('desc') === 'true');
    const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1'));

    const debouncedSearch = useDebounce(search, 300);

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

    const usersQuery = useQuery<UsersResponse>({
        queryKey: ['users', { limit: pageSize, search: debouncedSearch, sortBy, desc, page: currentPage }],
        queryFn: () => fetchUsers({ limit: pageSize, search: debouncedSearch, sortBy, desc }),
        refetchOnWindowFocus: true,
        retry: 3,
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
                    <div>
                        <Link href={`/users/${u.id}`} className="text-blue-600 hover:underline">
                            {u.email}
                        </Link>
                        <div className="text-sm text-gray-500">{new Date(u.createdAt).toLocaleString()}</div>
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
            cell: (info) => {
                const plan = info.getValue();
                return plan ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {plan}
                    </span>
                ) : (
                    <span className="text-gray-400">—</span>
                );
            },
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
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="border px-2 py-2 rounded-md"
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <Button onClick={() => setDesc((d) => !d)}>{desc ? 'Desc' : 'Asc'}</Button>
                <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
                    className="border px-2 py-2 rounded-md"
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                            {size}/страница
                        </option>
                    ))}
                </select>
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
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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
