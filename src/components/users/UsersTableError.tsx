'use client';

import { Button } from '@/components/ui/button';

interface UsersTableErrorProps {
    error: Error | null;
    onReload: () => void;
    onClearSearch: () => void;
}

export function UsersTableError({ error, onReload, onClearSearch }: UsersTableErrorProps) {
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
                    <Button onClick={onClearSearch}>
                        Очистить фильтр
                    </Button>
                ) : (
                    <Button onClick={onReload}>
                        Попробовать еще
                    </Button>
                )}
            </div>
        </div>
    );
}