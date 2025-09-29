import { NextRequest, NextResponse } from 'next/server'

// POST /api/users/[id]/refresh - обновить данные пользователя
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // Имитация задержки
        await new Promise((resolve) => setTimeout(resolve, 300))

        // В реальном приложении здесь был бы запрос к внешнему API или БД
        // для обновления данных пользователя

        return NextResponse.json({
            message: 'Данные пользователя обновлены',
            userId: id,
            timestamp: new Date().toISOString(),
        })
    } catch {
        return NextResponse.json(
            { error: 'Ошибка обновления данных пользователя' },
            { status: 500 }
        )
    }
}
