'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard'

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  )
}
