'use client'

import { Suspense } from 'react'
import { PerfilClient } from '@/components/perfil/PerfilClient'

export default function PerfilPage() {
  return (
    <Suspense>
      <PerfilClient />
    </Suspense>
  )
}
