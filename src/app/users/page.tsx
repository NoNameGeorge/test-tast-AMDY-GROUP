'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { UsersTableError } from '@/components/users/UsersTableError';
import { UsersTableLoading } from '@/components/users/UsersTableLoading';
import { UsersTableEmpty } from '@/components/users/UsersTableEmpty';
import Link from 'next/link';
import { fetchUsers } from '@/api/users';
import { SORT_OPTIONS, PAGE_SIZE_OPTIONS, UsersResponse } from '@/types/api';
import { User } from '@/types/user';
import { UsersProvider, useUsersContext } from '@/contexts/UsersContext';
import { useUsersHandlers } from '@/hooks/useUsersHandlers';
import { useUsersActions } from '@/hooks/useUsersActions';
import { useUsersURLSync } from '@/hooks/useUsersURLSync';

function UsersPageContent() {
    const queryClient = useQueryClient();
    const { filters } = useUsersContext();
    const handlers = useUsersHandlers();
    const actions = useUsersActions();
    useUsersURLSync();


    const queryParams = React.useMemo(() => ({
        limit: filters.pageSize,
        search: filters.debouncedSearch,
        sortBy: filters.sortBy,
        desc: filters.desc,
        page: filters.currentPage
    }), [filters.pageSize, filters.debouncedSearch, filters.sortBy, filters.desc, filters.currentPage]);


    const usersQuery = useQuery<UsersResponse>({
        queryKey: ['users', queryParams],
        queryFn: () => fetchUsers(queryParams),
        refetchOnWindowFocus: true,
        retry: 3,
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
    }, [queryParams, queryClient]);

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
                                onClick={() => actions.refreshUser(user.id)}
                                disabled={!canEdit}
                            >
                                Refresh
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => actions.deleteUser(user.id)}
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




    return (
        <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <Input
                    placeholder="Поиск по email"
                    value={filters.search}
                    onChange={handlers.search}
                    className="w-64"
                />
                <Select
                    value={filters.sortBy}
                    onChange={handlers.sortBy}
                    options={SORT_OPTIONS}
                />
                <Button onClick={handlers.sortToggle}>
                    {filters.desc ? '↓ По убыванию' : '↑ По возрастанию'}
                </Button>
                <Select
                    value={filters.pageSize.toString()}
                    onChange={handlers.pageSize}
                    options={PAGE_SIZE_OPTIONS.map(size => ({
                        value: size.toString(),
                        label: `${size}/страница`
                    }))}
                />
            </div>

            {usersQuery.isLoading ? (
                <UsersTableLoading />
            ) : usersQuery.error ? (
                <UsersTableError
                    error={usersQuery.error}
                    onReload={actions.reload}
                    onClearSearch={handlers.clearSearch}
                />
            ) : usersQuery.data?.users?.length === 0 ? (
                <UsersTableEmpty onResetFilters={actions.resetFilters} />
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
                <Button onClick={actions.reload}>Reload</Button>
                <Button onClick={() => actions.debug(usersQuery.data)}>Debug</Button>
            </div>

            {usersQuery?.data && !usersQuery.isLoading && !usersQuery.error && (
                <Pagination
                    currentPage={filters.currentPage}
                    totalPages={usersQuery.data.totalPages}
                    total={usersQuery.data.total}
                    pageSize={filters.pageSize}
                    onPreviousPage={handlers.previousPage}
                    onNextPage={() => handlers.nextPage(usersQuery.data.totalPages)}
                />
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
