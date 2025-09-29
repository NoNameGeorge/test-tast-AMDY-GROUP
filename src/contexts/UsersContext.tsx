'use client'

import React, { createContext, useContext, useReducer } from 'react'
import { SortBy, PageSize } from '@/types/api'

interface FiltersState {
    pageSize: PageSize
    sortBy: SortBy
    desc: boolean
}

type FiltersAction =
    | { type: 'SET_PAGE_SIZE'; payload: PageSize }
    | { type: 'SET_SORT_BY'; payload: SortBy }
    | { type: 'SET_DESC'; payload: boolean }

interface UsersContextType {
    filters: FiltersState
    actions: {
        setPageSize: (pageSize: PageSize) => void
        setSortBy: (sortBy: SortBy) => void
        setDesc: (desc: boolean) => void
    }
}

const initialState: FiltersState = {
    pageSize: 20,
    sortBy: 'email',
    desc: false,
}

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
    switch (action.type) {
        case 'SET_PAGE_SIZE':
            return { ...state, pageSize: action.payload }
        case 'SET_SORT_BY':
            return { ...state, sortBy: action.payload }
        case 'SET_DESC':
            return { ...state, desc: action.payload }
        default:
            return state
    }
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [filters, dispatch] = useReducer(filtersReducer, initialState)

    const actions = {
        setPageSize: (pageSize: PageSize) => dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize }),
        setSortBy: (sortBy: SortBy) => dispatch({ type: 'SET_SORT_BY', payload: sortBy }),
        setDesc: (desc: boolean) => dispatch({ type: 'SET_DESC', payload: desc }),
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
