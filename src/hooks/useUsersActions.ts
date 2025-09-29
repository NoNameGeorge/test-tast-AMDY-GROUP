import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useUsersContext } from '@/contexts/UsersContext'
import { refreshUser, deleteUser } from '@/api/users'

export function useUsersActions() {
    const { actions } = useUsersContext()
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMemo(
        () => ({
            reload: () => {
                queryClient.invalidateQueries({ queryKey: ['users'] })
            },
            debug: (data: unknown) => {
                console.log(JSON.stringify(data))
            },
            resetFilters: () => {
                actions.setSearch('')
                actions.setCurrentPage(1)
                actions.setSortBy('email')
                actions.setDesc(false)
                actions.setPageSize(20)
                queryClient.invalidateQueries({ queryKey: ['users'] })
                router.replace('/users', { scroll: false })
            },
            refreshUser: async (userId: string) => {
                try {
                    await refreshUser(userId)
                    queryClient.invalidateQueries({ queryKey: ['users'] })
                } catch (error) {
                    console.error('Ошибка при обновлении пользователя:', error)
                }
            },
            deleteUser: async (userId: string) => {
                try {
                    await deleteUser(userId)
                    queryClient.invalidateQueries({ queryKey: ['users'] })
                } catch (error) {
                    console.error('Ошибка при удалении пользователя:', error)
                }
            },
        }),
        [actions, queryClient, router]
    )
}
