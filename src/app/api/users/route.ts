import { NextRequest, NextResponse } from 'next/server'

// Моковые данные
const mockUsers = [
    { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', age: 25, city: 'Москва' },
    { id: 2, name: 'Петр Петров', email: 'petr@example.com', age: 30, city: 'Санкт-Петербург' },
    { id: 3, name: 'Анна Сидорова', email: 'anna@example.com', age: 28, city: 'Новосибирск' },
    { id: 4, name: 'Мария Козлова', email: 'maria@example.com', age: 35, city: 'Екатеринбург' },
    { id: 5, name: 'Алексей Смирнов', email: 'alex@example.com', age: 42, city: 'Казань' },
]

// GET /api/users - получить всех пользователей
export async function GET(request: NextRequest) {
    try {
        // Имитация задержки API
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        let filteredUsers = mockUsers

        // Поиск по имени или email
        if (search) {
            filteredUsers = mockUsers.filter(
                (user) =>
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase())
            )
        }

        // Пагинация
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

        return NextResponse.json({
            data: paginatedUsers,
            total: filteredUsers.length,
            page,
            limit,
            totalPages: Math.ceil(filteredUsers.length / limit),
        })
    } catch (error) {
        return NextResponse.json({ error: 'Ошибка получения пользователей' }, { status: 500 })
    }
}

// POST /api/users - создать нового пользователя
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, age, city } = body

        // Валидация
        if (!name || !email || !age || !city) {
            return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
        }

        // Имитация задержки
        await new Promise((resolve) => setTimeout(resolve, 300))

        const newUser = {
            id: mockUsers.length + 1,
            name,
            email,
            age: parseInt(age),
            city,
        }

        // В реальном приложении здесь был бы запрос к БД
        mockUsers.push(newUser)

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 })
    }
}
