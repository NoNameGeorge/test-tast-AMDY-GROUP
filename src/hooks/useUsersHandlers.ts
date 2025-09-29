import { useMemo } from 'react'
import { useUsersContext } from '@/contexts/UsersContext'
import { SortBy, PageSize } from '@/types/api'

export function useUsersHandlers() {
    const { actions, filters } = useUsersContext()

    return useMemo(
        () => ({
            search: (e: React.ChangeEvent<HTMLInputElement>) => {
                actions.setSearch(e.target.value)
            },
            sortBy: (e: React.ChangeEvent<HTMLSelectElement>) => {
                actions.setSortBy(e.target.value as SortBy)
            },
            pageSize: (e: React.ChangeEvent<HTMLSelectElement>) => {
                actions.setPageSize(Number(e.target.value) as PageSize)
            },
            sortToggle: () => {
                actions.setDesc(!filters.desc)
            },
            previousPage: () => {
                actions.setCurrentPage(Math.max(filters.currentPage - 1, 1))
            },
            nextPage: (totalPages: number) => {
                actions.setCurrentPage(Math.min(filters.currentPage + 1, totalPages))
            },
            clearSearch: () => {
                actions.setSearch('')
            },
        }),
        [actions, filters.desc, filters.currentPage]
    )
}
