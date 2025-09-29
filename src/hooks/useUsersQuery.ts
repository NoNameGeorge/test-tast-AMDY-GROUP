import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUsersContext } from '@/contexts/UsersContext'
import { fetchUsers } from '@/api/users'
import { UsersResponse } from '@/types/api'

export function useUsersQuery() {
    const { filters } = useUsersContext()
    const queryClient = useQueryClient()

    const queryParams = useMemo(
        () => ({
            limit: filters.pageSize,
            search: filters.debouncedSearch,
            sortBy: filters.sortBy,
            desc: filters.desc,
            page: filters.currentPage,
        }),
        [
            filters.pageSize,
            filters.debouncedSearch,
            filters.sortBy,
            filters.desc,
            filters.currentPage,
        ]
    )

    const usersQuery = useQuery<UsersResponse>({
        queryKey: ['users', queryParams],
        queryFn: () => fetchUsers(queryParams),
        refetchOnWindowFocus: true,
        retry: 3,
    })

    useMemo(() => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
    }, [queryParams, queryClient])

    return {
        ...usersQuery,
        queryParams,
    }
}
