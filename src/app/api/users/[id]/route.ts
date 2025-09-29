import { NextRequest, NextResponse } from 'next/server'

// Моковые данные (в реальном приложении это было бы в БД)
let mockUsers = [
    {
        id: '1',
        email: 'ivan.ivanov1@gmail.com',
        role: 'admin',
        createdAt: '2023-01-15T10:30:00Z',
        plan: 'enterprise',
    },
    {
        id: '2',
        email: 'petr.petrov2@yahoo.com',
        role: 'editor',
        createdAt: '2023-02-20T14:45:00Z',
        plan: 'pro',
    },
    {
        id: '3',
        email: 'anna.sidorova3@outlook.com',
        role: 'viewer',
        createdAt: '2023-03-10T09:15:00Z',
        plan: 'free',
    },
    {
        id: '4',
        email: 'maria.kozlov4@company.com',
        role: 'editor',
        createdAt: '2023-04-05T16:20:00Z',
        plan: null,
    },
]

// GET /api/users/[id] - получить пользователя по ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        // Имитация задержки
        await new Promise((resolve) => setTimeout(resolve, 200))

        const user = mockUsers.find((u) => u.id === id)

        if (!user) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Ошибка получения пользователя' }, { status: 500 })
    }
}

// PUT /api/users/[id] - обновить пользователя
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const body = await request.json()
        const { email, role, plan } = body

        // Имитация задержки
        await new Promise((resolve) => setTimeout(resolve, 300))

        const userIndex = mockUsers.findIndex((u) => u.id === id)

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
        }

        // Обновляем пользователя
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            email: email || mockUsers[userIndex].email,
            role: role || mockUsers[userIndex].role,
            plan: plan !== undefined ? plan : mockUsers[userIndex].plan,
        }

        return NextResponse.json(mockUsers[userIndex])
    } catch (error) {
        return NextResponse.json({ error: 'Ошибка обновления пользователя' }, { status: 500 })
    }
}

// DELETE /api/users/[id] - удалить пользователя
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        // Имитация задержки
        await new Promise((resolve) => setTimeout(resolve, 200))

        const userIndex = mockUsers.findIndex((u) => u.id === id)

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
        }

        const deletedUser = mockUsers[userIndex]
        mockUsers = mockUsers.filter((u) => u.id !== id)

        return NextResponse.json({
            message: 'Пользователь удален',
            user: deletedUser,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Ошибка удаления пользователя' }, { status: 500 })
    }
}
