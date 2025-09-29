import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUsersContext } from '@/contexts/UsersContext'

export function useUsersURLSync() {
    const { filters } = useUsersContext()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())

        if (filters.debouncedSearch) {
            newSearchParams.set('search', filters.debouncedSearch)
        } else {
            newSearchParams.delete('search')
        }

        if (filters.sortBy !== 'email') {
            newSearchParams.set('sortBy', filters.sortBy)
        } else {
            newSearchParams.delete('sortBy')
        }

        if (filters.desc) {
            newSearchParams.set('desc', 'true')
        } else {
            newSearchParams.delete('desc')
        }

        if (filters.pageSize !== 20) {
            newSearchParams.set('limit', filters.pageSize.toString())
        } else {
            newSearchParams.delete('limit')
        }

        if (filters.currentPage !== 1) {
            newSearchParams.set('page', filters.currentPage.toString())
        } else {
            newSearchParams.delete('page')
        }

        const newURL = `/users?${newSearchParams.toString()}`
        const currentURL = `/users?${searchParams.toString()}`

        if (newURL !== currentURL) {
            router.replace(newURL, { scroll: false })
        }
    }, [
        filters.debouncedSearch,
        filters.sortBy,
        filters.desc,
        filters.pageSize,
        filters.currentPage,
        router,
        searchParams,
    ])
}
