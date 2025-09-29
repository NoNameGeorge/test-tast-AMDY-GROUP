import { FetchUsersParams, UsersResponse } from '@/types/api'

export async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
    const searchParams = new URLSearchParams({
        limit: params.limit.toString(),
        search: params.search,
        sortBy: params.sortBy,
        desc: params.desc.toString(),
        page: params.page.toString(),
    })

    const response = await fetch(`/api/users?${searchParams}`, { cache: 'no-store' })

    if (!response.ok) {
        throw new Error('Failed to fetch users')
    }

    const data = await response.json()

    return {
        users: data.data,
        total: data.total,
        totalPages: data.totalPages,
        currentPage: data.page,
    }
}

export async function refreshUser(userId: string): Promise<void> {
    const response = await fetch(`/api/users/${userId}/refresh`, {
        method: 'POST',
    })

    if (!response.ok) {
        throw new Error('Failed to refresh user')
    }
}

export async function deleteUser(userId: string): Promise<void> {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        throw new Error('Failed to delete user')
    }
}
