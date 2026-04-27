import { ArmarioPublico } from '@/components/perfil/ArmarioPublico'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function ArmarioPage({ params }: PageProps) {
  const resolvedParams = await params
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <ArmarioPublico buyerSlug={resolvedParams.username} />
    </div>
  )
}
