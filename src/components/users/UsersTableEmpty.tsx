'use client';

import { Button } from '@/components/ui/button';

interface UsersTableEmptyProps {
    onResetFilters: () => void;
}

export function UsersTableEmpty({ onResetFilters }: UsersTableEmptyProps) {
    return (
        <div className="rounded-xl border p-8 text-center">
            <div className="text-gray-600 mb-4">
                <h3 className="text-lg font-semibold mb-2">Пользователи не найдены</h3>
                <p className="text-sm">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
            <Button onClick={onResetFilters}>
                Сбросить фильтры
            </Button>
        </div>
    );
}
