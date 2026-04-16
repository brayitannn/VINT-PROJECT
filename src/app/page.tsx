import Link from 'next/link'
import { Search, ShieldCheck, Leaf, Tag } from 'lucide-react'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/supabase'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { AutoCarousel } from '@/components/products/AutoCarousel'
import { FeatureCard } from '@/components/infoApp/FeatureCard'

const VALUES = [
  { icon: ShieldCheck, title: 'Compra Segura', description: 'Todos los vendedores son verificados. Tu pago está protegido hasta que recibas tu prenda.' },
  { icon: Leaf, title: 'Moda Sostenible', description: 'Cada compra en VINT es una prenda menos en el vertedero. Moda circular, planeta feliz.' },
  { icon: Tag, title: 'Mejores Precios', description: 'Ropa de calidad hasta un 70% más barata. Tu estilo no tiene que costar una fortuna.' },
]

function mapCondicion(condicion: string): Product['condition'] {
  switch (condicion?.toUpperCase()) {
    case 'NUEVO': return 'Excelente'
    case 'COMO_NUEVO': return 'Excelente'
    case 'USADO': return 'Muy Bueno'
    case 'DESGASTADO': return 'Bueno'
    default: return 'Bueno'
  }
}

export default async function HomePage() {
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .select('*')
    .limit(6)


  if (error) console.error('Error cargando prendas:', error.message)

  const products: Product[] = (data ?? []).map((item: any) => ({
    id: item.id_prenda,
    name: item.titulo,
    price: Number(item.precio),
    size: item.talla ?? 'M',
    condition: mapCondicion(item.condicion),
    seller: item.vendedor ?? 'Vendedor',
    image: item.imagen_principal ?? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop',
    rating: 4.5,
  }))

  return (
    <main style={{ minHeight: '100vh' }}>
      <PublicNavbar />
      {/* HERO */}
      <section style={{
        padding: '120px 2rem 140px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}>
        {/* Background Image with Blur */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/hero-bg.jpg"
            alt="Hero Background"
            fill
            style={{ objectFit: 'cover', filter: 'blur(4px)', scale: '1.05' }}
            priority
          />
          {/* Overlay to ensure text readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--bg-primary)',
            opacity: 0.75,
            backgroundImage: 'radial-gradient(circle at center, transparent 0%, var(--bg-primary) 100%)'
          }} />
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 999,
            backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 32,
            backdropFilter: 'blur(4px)'
          }}>
            <span>✦</span> Todo el estilo que quieres a un click de distancia
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(44px, 7vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 28
          }}>
            Ropa con estilo<br />
            <span style={{
              color: 'var(--accent)',
              textShadow: '0 0 30px rgba(var(--accent-rgb), 0.2)'
            }}>De primer Nivel</span>
          </h1>
          <p style={{
            fontSize: 19,
            color: 'var(--text-secondary)',
            maxWidth: 620,
            margin: '0 auto 48px',
            lineHeight: 1.8,
            fontWeight: 450
          }}>
            Compra y vende ropa única con estilo. VINT conecta a personas que aman la moda sostenible y los precios que sí tienen sentido.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register?role=vendedor" className="vint-btn-primary" style={{ padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700 }}>
              Comenzar a Vender →
            </Link>
            <Link href="/login" className="vint-btn-secondary" style={{ padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700 }}>
              Explorar Productos
            </Link>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <FeatureCard
                  key={value.title}
                  icon={<Icon size={26} style={{ color: 'var(--accent)' }} />}  // 👈 JSX directo
                  title={value.title}
                  description={value.description}
                  ctaLabel="Saber más"
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section style={{ backgroundColor: 'var(--bg-primary)', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'var(--text-primary)' }}>De lo mejor que podras encontrar</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>Selección precisa de las mejores publicaciones del día</p>
            </div>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Ver todas →</Link>
          </div>

          <AutoCarousel>
            {products.map((product) => (
              <li key={product.id} style={{
                flex: '0 0 calc(33.333% - 16px)',
                minWidth: 280,
                scrollSnapAlign: 'start'
              }}>
                <ProductCard product={product} />
              </li>
            ))}
          </AutoCarousel>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/login" className="vint-btn-primary" style={{ padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
              Ver Todos los Productos →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '48px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'absolute', left: 0 }}>
            <Image src="/logo1.png" alt="Vint" width={32} height={32} />
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>Vint</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 Vint · Moda de segunda mano a nivel de todos · Made in Colombia</p>
        </div>
      </footer>
    </main>
  )
}