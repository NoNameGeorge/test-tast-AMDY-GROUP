import { NextRequest, NextResponse } from 'next/server'

// Генерация ~100 пользователей
const generateUsers = () => {
    const users = []
    const roles = ['admin', 'editor', 'viewer']
    const plans = ['free', 'pro', 'enterprise', null]
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'test.com']
    const firstNames = [
        'Иван',
        'Петр',
        'Анна',
        'Мария',
        'Алексей',
        'Елена',
        'Дмитрий',
        'Ольга',
        'Сергей',
        'Наталья',
        'Андрей',
        'Татьяна',
        'Михаил',
        'Екатерина',
        'Владимир',
        'Светлана',
        'Николай',
        'Юлия',
        'Александр',
        'Ирина',
    ]
    const lastNames = [
        'Иванов',
        'Петров',
        'Сидорова',
        'Козлова',
        'Смирнов',
        'Кузнецова',
        'Попов',
        'Васильева',
        'Соколов',
        'Новикова',
        'Морозов',
        'Федорова',
        'Волков',
        'Морозова',
        'Алексеев',
        'Лебедева',
        'Семенов',
        'Егорова',
        'Павлов',
        'Козлова',
    ]

    for (let i = 1; i <= 100; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const domain = domains[Math.floor(Math.random() * domains.length)]
        const role = roles[Math.floor(Math.random() * roles.length)]
        const plan = plans[Math.floor(Math.random() * plans.length)]

        // Создаем дату в последние 2 года
        const createdAt = new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)

        users.push({
            id: i.toString(),
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domain}`,
            role,
            createdAt: createdAt.toISOString(),
            plan,
        })
    }

    return users
}

const mockUsers = generateUsers()

// GET /api/users - получить всех пользователей
export async function GET(request: NextRequest) {
    try {
        // Имитация задержки API
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const sortBy = searchParams.get('sortBy') || 'email'
        const desc = searchParams.get('desc') === 'true'

        let filteredUsers = mockUsers

        // Поиск по email
        if (search) {
            filteredUsers = mockUsers.filter((user) =>
                user.email.toLowerCase().includes(search.toLowerCase())
            )
        }

        // Сортировка
        filteredUsers.sort((a, b) => {
            let aVal, bVal
            switch (sortBy) {
                case 'email':
                    aVal = a.email
                    bVal = b.email
                    break
                case 'createdAt':
                    aVal = new Date(a.createdAt).getTime()
                    bVal = new Date(b.createdAt).getTime()
                    break
                case 'role':
                    aVal = a.role
                    bVal = b.role
                    break
                default:
                    aVal = a.email
                    bVal = b.email
            }

            if (aVal < bVal) return desc ? 1 : -1
            if (aVal > bVal) return desc ? -1 : 1
            return 0
        })

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
    } catch {
        return NextResponse.json({ error: 'Ошибка получения пользователей' }, { status: 500 })
    }
}

// POST /api/users - создать нового пользователя
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        // Валидация
        if (!email) {
            return NextResponse.json({ error: 'Email обязателен' }, { status: 400 })
        }

        // Имитация задержки
        await new Promise((resolve) => setTimeout(resolve, 300))

        const newUser = {
            id: (mockUsers.length + 1).toString(),
            email,
            role: 'viewer',
            createdAt: new Date().toISOString(),
            plan: null,
        }

        // В реальном приложении здесь был бы запрос к БД
        mockUsers.push(newUser)

        return NextResponse.json(newUser, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 })
    }
}
