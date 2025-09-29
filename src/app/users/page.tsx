'use client';

import * as React from 'react';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { UsersTableError } from '@/components/users/UsersTableError';
import { UsersTableLoading } from '@/components/users/UsersTableLoading';
import { UsersTableEmpty } from '@/components/users/UsersTableEmpty';
import { UsersTableFilter } from '@/components/users/UsersTableFilter';
import Link from 'next/link';
import { User } from '@/types/user';
import { UsersProvider, useUsersContext } from '@/contexts/UsersContext';
import { useUsersHandlers } from '@/hooks/useUsersHandlers';
import { useUsersActions } from '@/hooks/useUsersActions';
import { useUsersURLSync } from '@/hooks/useUsersURLSync';
import { useUsersQuery } from '@/hooks/useUsersQuery';

function UsersPageContent() {
    const { filters } = useUsersContext();
    const handlers = useUsersHandlers();
    const actions = useUsersActions();
    const usersQuery = useUsersQuery();
    useUsersURLSync();

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
    }, []);

    const data: User[] = usersQuery.data?.users || [];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        debugTable: process.env.NODE_ENV !== 'production',
    });

    return (
        <div className="p-6">
            <UsersTableFilter />

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
