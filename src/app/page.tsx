'use client';

import * as React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Test task AMDY Group</h1>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Пользователи</h2>
              <p className="text-gray-600 mb-4">
                Таблица с ~100 пользователями, поиском, сортировкой и пагинацией.
              </p>
              <Link
                href="/users"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Перейти к пользователям
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">API Endpoints</h2>
              <p className="text-gray-600 mb-4">
                Доступные API маршруты для работы с пользователями.
              </p>
              <div className="text-sm space-y-1">
                <div><code className="bg-gray-100 px-2 py-1 rounded text-gray-800">GET /api/users</code></div>
                <div><code className="bg-gray-100 px-2 py-1 rounded text-gray-800">GET /api/users/[id]</code></div>
                <div><code className="bg-gray-100 px-2 py-1 rounded text-gray-800">POST /api/users/[id]/refresh</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}