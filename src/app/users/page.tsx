'use client';

import { UsersTableFilter } from '@/components/users/UsersTableFilter';
import { UsersTable } from '@/components/users/UsersTable';
import { UsersProvider } from '@/contexts/UsersContext';

function UsersPageContent() {
    return (
        <div className="p-6">
            <UsersTableFilter />
            <UsersTable />
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
