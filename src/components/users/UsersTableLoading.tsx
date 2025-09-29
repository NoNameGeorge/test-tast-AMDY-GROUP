'use client';

export function UsersTableLoading() {
    return (
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
}
