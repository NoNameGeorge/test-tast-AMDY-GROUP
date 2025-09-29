'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { SortBy, PageSize } from '@/types/api'

interface FiltersState {
    pageSize: PageSize
    sortBy: SortBy
    desc: boolean
    search: string
    debouncedSearch: string
    currentPage: number
}

type FiltersAction =
    | { type: 'SET_PAGE_SIZE'; payload: PageSize }
    | { type: 'SET_SORT_BY'; payload: SortBy }
    | { type: 'SET_DESC'; payload: boolean }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_DEBOUNCED_SEARCH'; payload: string }
    | { type: 'SET_CURRENT_PAGE'; payload: number }

interface UsersContextType {
    filters: FiltersState
    actions: {
        setPageSize: (pageSize: PageSize) => void
        setSortBy: (sortBy: SortBy) => void
        setDesc: (desc: boolean) => void
        setSearch: (search: string) => void
        setCurrentPage: (page: number) => void
    }
}

const initialState: FiltersState = {
    pageSize: 20,
    sortBy: 'email',
    desc: false,
    search: '',
    debouncedSearch: '',
    currentPage: 1,
}

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
    switch (action.type) {
        case 'SET_PAGE_SIZE':
            return { ...state, pageSize: action.payload, currentPage: 1 }
        case 'SET_SORT_BY':
            return { ...state, sortBy: action.payload }
        case 'SET_DESC':
            return { ...state, desc: action.payload }
        case 'SET_SEARCH':
            return { ...state, search: action.payload, currentPage: 1 }
        case 'SET_DEBOUNCED_SEARCH':
            return { ...state, debouncedSearch: action.payload }
        case 'SET_CURRENT_PAGE':
            return { ...state, currentPage: action.payload }
        default:
            return state
    }
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [filters, dispatch] = useReducer(filtersReducer, initialState)

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch({ type: 'SET_DEBOUNCED_SEARCH', payload: filters.search })
        }, 300)

        return () => clearTimeout(timer)
    }, [filters.search])

    const actions = {
        setPageSize: (pageSize: PageSize) => dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize }),
        setSortBy: (sortBy: SortBy) => dispatch({ type: 'SET_SORT_BY', payload: sortBy }),
        setDesc: (desc: boolean) => dispatch({ type: 'SET_DESC', payload: desc }),
        setSearch: (search: string) => dispatch({ type: 'SET_SEARCH', payload: search }),
        setCurrentPage: (page: number) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page }),
    }

    return (
        <UsersContext.Provider value={{ filters, actions }}>
            {children}
        </UsersContext.Provider>
    )
}

export function useUsersContext() {
    const context = useContext(UsersContext)
    if (context === undefined) {
        throw new Error('useUsersContext must be used within a UsersProvider')
    }
    return context
}
