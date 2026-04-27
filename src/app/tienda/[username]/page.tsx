import { StoreFront } from '@/components/tienda/StoreFront'

export default async function TiendaPublicaPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  return <StoreFront isOwner={false} sellerSlug={resolvedParams.username} />
}
