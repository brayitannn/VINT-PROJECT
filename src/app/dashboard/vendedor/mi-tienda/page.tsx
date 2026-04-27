'use client'

import { useAuth } from '@/context/AuthContext'
import { StoreFront } from '@/components/tienda/StoreFront'
import { Loader2 } from 'lucide-react'

export default function MiTiendaPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) return null

  return <StoreFront isOwner={true} sellerId={user.id} />
}
