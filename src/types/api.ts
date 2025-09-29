import { User } from './user'

export type SortBy = 'email' | 'createdAt' | 'role'
export type PageSize = 10 | 20 | 50

export interface FetchUsersParams {
    limit: PageSize
    search: string
    sortBy: SortBy
    desc: boolean
    page: number
}

export interface UsersResponse {
    users: User[]
    total: number
    totalPages: number
    currentPage: number
}

export const SORT_OPTIONS = [
    { value: 'email', label: 'Email' },
    { value: 'createdAt', label: 'Дата создания' },
    { value: 'role', label: 'Роль' },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
