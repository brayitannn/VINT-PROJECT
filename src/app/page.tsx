import Link from 'next/link'
import { Search, ShieldCheck, Leaf, Tag } from 'lucide-react'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/supabase'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { AutoCarousel } from '@/components/products/AutoCarousel'

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
      <section style={{ backgroundColor: 'var(--bg-primary)', padding: '80px 2rem 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', backgroundColor: 'var(--accent)', opacity: 0.05, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, backgroundColor: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)', fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
            <span>✦</span> Todo el estilo que quieres a un click de distancia
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 24 }}>
            Ropa con estilo<br />
            <span style={{ color: 'var(--accent)' }}>De primer Nivel</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Compra y vende ropa única con estilo. VINT conecta a personas que aman la moda sostenible y los precios que sí tienen sentido.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register?role=vendedor" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Comenzar a Vender →</Link>
            <Link href="/login" style={{ backgroundColor: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Explorar Productos</Link>
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
                <div key={value.title} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Icon size={26} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 12 }}>{value.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{value.description}</p>
                </div>
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
            <Link href="/login" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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