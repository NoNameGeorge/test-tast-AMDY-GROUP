export type UserRole = 'admin' | 'editor' | 'viewer'
export type UserPlan = 'free' | 'pro' | 'enterprise' | null

export interface User {
    id: string
    email: string
    role: UserRole
    createdAt: string
    plan: UserPlan
}
