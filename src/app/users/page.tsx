'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchUsers, refreshUser, deleteUser } from '@/api/users';
import { SortBy, PageSize, SORT_OPTIONS, PAGE_SIZE_OPTIONS, UsersResponse } from '@/types/api';
import { User } from '@/types/user';
import { UsersProvider } from '@/contexts/UsersContext';

function UsersPageContent() {
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortBy);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value) as PageSize);
    };

    const handleSortDirectionToggle = () => {
        setDesc((d) => !d);
    };

    const handleReload = () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
    };

    const handleDebug = () => {
        console.log(JSON.stringify(usersQuery.data));
    };

    const handleResetFilters = () => {
        setSearch('');
        setCurrentPage(1);
        setSortBy('email');
        setDesc(false);
        setPageSize(20);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        router.replace('/users', { scroll: false });
    };

    const handleClearSearch = () => {
        setSearch('');
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, usersQuery.data?.totalPages || 1));
    };

    const handleRefreshUser = async (userId: string) => {
        try {
            await refreshUser(userId);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
        }
    };

    const queryParams = React.useMemo(() => ({
        limit: pageSize,
        search: debouncedSearch,
        sortBy,
        desc,
        page: currentPage
    }), [pageSize, debouncedSearch, sortBy, desc, currentPage]);

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
        queryKey: ['users', queryParams],
        queryFn: () => fetchUsers(queryParams),
        refetchOnWindowFocus: true,
        retry: 3,
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
    }, [queryParams, currentPage, queryClient]);

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

    const columns = React.useMemo(() => {
        const columnHelper = createColumnHelper<User>();

        return [
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
                                onClick={() => handleRefreshUser(user.id)}
                                disabled={!canEdit}
                            >
                                Refresh
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={!canEdit}
                            >
                                Delete
                            </Button>
                        </div>
                    );
                },
            }),
        ];
    }, [queryClient]);

    const data: User[] = usersQuery.data?.users || [];

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
                        <Button onClick={handleClearSearch}>
                            Очистить фильтр
                        </Button>
                    ) : (
                        <Button onClick={handleReload}>
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
                <Input
                    placeholder="Поиск по email"
                    value={search}
                    onChange={handleSearchChange}
                    className="w-64"
                />
                <Select
                    value={sortBy}
                    onChange={handleSortByChange}
                    options={SORT_OPTIONS}
                />
                <Button onClick={handleSortDirectionToggle}>
                    {desc ? '↓ По убыванию' : '↑ По возрастанию'}
                </Button>
                <Select
                    value={pageSize.toString()}
                    onChange={handlePageSizeChange}
                    options={PAGE_SIZE_OPTIONS.map(size => ({
                        value: size.toString(),
                        label: `${size}/страница`
                    }))}
                />
            </div>

            {usersQuery.isLoading ? (
                <LoadingSkeleton />
            ) : usersQuery.error ? (
                <ErrorComponent error={usersQuery.error} />
            ) : usersQuery.data?.users?.length === 0 ? (
                <div className="rounded-xl border p-8 text-center">
                    <div className="text-gray-600 mb-4">
                        <h3 className="text-lg font-semibold mb-2">Пользователи не найдены</h3>
                        <p className="text-sm">Попробуйте изменить параметры поиска или фильтры</p>
                    </div>
                    <Button onClick={handleResetFilters}>
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
                <Button onClick={handleReload}>Reload</Button>
                <Button onClick={handleDebug}>Debug</Button>
            </div>

            {usersQuery?.data && !usersQuery.isLoading && !usersQuery.error && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Показано {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, usersQuery.data.total)} из {usersQuery.data.total} пользователей
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Назад
                        </Button>
                        <span className="px-3 py-1 text-sm">
                            Страница {currentPage} из {usersQuery.data.totalPages}
                        </span>
                        <Button
                            onClick={handleNextPage}
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

export default function UsersPage() {
    return (
        <UsersProvider>
            <UsersPageContent />
        </UsersProvider>
    );
}
