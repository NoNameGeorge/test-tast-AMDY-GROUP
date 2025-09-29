import { useCallback } from 'react'
import { useUsersContext } from '@/contexts/UsersContext'
import { SortBy, PageSize } from '@/types/api'

export function useUsersHandlers() {
    const { actions, filters } = useUsersContext()

    const search = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            actions.setSearch(e.target.value)
        },
        [actions]
    )

    const sortBy = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            actions.setSortBy(e.target.value as SortBy)
        },
        [actions]
    )

    const pageSize = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            actions.setPageSize(Number(e.target.value) as PageSize)
        },
        [actions]
    )

    const sortToggle = useCallback(() => {
        actions.setDesc(!filters.desc)
    }, [actions, filters.desc])

    const previousPage = useCallback(() => {
        actions.setCurrentPage(Math.max(filters.currentPage - 1, 1))
    }, [actions, filters.currentPage])

    const nextPage = useCallback(
        (totalPages: number) => {
            actions.setCurrentPage(Math.min(filters.currentPage + 1, totalPages))
        },
        [actions, filters.currentPage]
    )

    const clearSearch = useCallback(() => {
        actions.setSearch('')
    }, [actions])

    return {
        search,
        sortBy,
        pageSize,
        sortToggle,
        previousPage,
        nextPage,
        clearSearch,
    }
}
