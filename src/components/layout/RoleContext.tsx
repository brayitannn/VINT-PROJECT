'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { MOCK_USER, type UserRole } from '@/lib/supabase/mock-user'

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextType>({
  role: MOCK_USER.role,
  setRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(MOCK_USER.role)
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}