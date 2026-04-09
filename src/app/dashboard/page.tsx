'use client'

import { useRole } from '@/components/layout/RoleContext'
import { CompradorDashboard } from '@/components/dashboard/CompradorDashboard'
import { VendedorDashboard } from '@/components/dashboard/VendedorDashboard'
import { MOCK_USER } from '@/lib/supabase/mock-user'

export default function DashboardPage() {
  const { role } = useRole()
  const user = { ...MOCK_USER, role }

  return role === 'comprador'
    ? <CompradorDashboard user={user} />
    : <VendedorDashboard user={user} />
}