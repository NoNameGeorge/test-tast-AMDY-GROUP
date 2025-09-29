'use client'

import React, { createContext, useContext } from 'react'

interface UsersContextType {
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
    return (
        <UsersContext.Provider value={{}}>
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
