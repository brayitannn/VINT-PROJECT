import { StoreFront } from '@/components/tienda/StoreFront'

export default async function TiendaPublicaPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const decodedUsername = resolvedParams?.username ? decodeURIComponent(resolvedParams.username) : '';
  return <StoreFront isOwner={false} sellerSlug={decodedUsername} />
}
