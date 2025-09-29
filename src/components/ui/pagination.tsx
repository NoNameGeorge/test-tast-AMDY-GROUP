'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

export function Pagination({
    currentPage,
    totalPages,
    total,
    pageSize,
    onPreviousPage,
    onNextPage
}: PaginationProps) {
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
                Показано {startItem}-{endItem} из {total} пользователей
            </div>
            <div className="flex items-center gap-2">
                <Button
                    onClick={onPreviousPage}
                    disabled={currentPage === 1}
                >
                    Назад
                </Button>
                <span className="px-3 py-1 text-sm">
                    Страница {currentPage} из {totalPages}
                </span>
                <Button
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages}
                >
                    Вперед
                </Button>
            </div>
        </div>
    );
}
