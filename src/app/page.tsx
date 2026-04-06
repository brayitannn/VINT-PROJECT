import Link from 'next/link'
import { Search, ShieldCheck, Leaf, Tag } from 'lucide-react'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import Image from 'next/image'


const MOCK_PRODUCTS: Product[] = [
  { id:1, name:'Chaqueta de cuero vintage café', price:85000, size:'M', condition:'Excelente', seller:'María V.', image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', rating:4.9 },
  { id:2, name:'Jean wide leg azul oscuro', price:45000, size:'S', condition:'Muy Bueno', seller:'Camila R.', image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', rating:4.7 },
  { id:3, name:'Blazer oversize verde oliva', price:72000, size:'L', condition:'Excelente', seller:'Laura M.', image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop', rating:5.0 },
  { id:4, name:'Vestido floral midi años 90', price:38000, size:'XS', condition:'Bueno', seller:'Sofía T.', image:'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=500&fit=crop', rating:4.5 },
  { id:5, name:'Sweater de punto crema oversize', price:52000, size:'M', condition:'Excelente', seller:'Valentina O.', image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop', rating:4.8 },
  { id:6, name:'Falda de cuadros escoceses', price:29000, size:'S', condition:'Muy Bueno', seller:'Isabela C.', image:'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop', rating:4.6 },
  { id:7, name:'Camiseta graphic tee banda rock', price:22000, size:'L', condition:'Bueno', seller:'Daniela P.', image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', rating:4.4 },
  { id:8, name:'Abrigo largo camel', price:120000, size:'M', condition:'Excelente', seller:'Andrea S.', image:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop', rating:4.9 },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Compra Segura', description: 'Todos los vendedores son verificados. Tu pago está protegido hasta que recibas tu prenda.' },
  { icon: Leaf, title: 'Moda Sostenible', description: 'Cada compra en VINT es una prenda menos en el vertedero. Moda circular, planeta feliz.' },
  { icon: Tag, title: 'Mejores Precios', description: 'Ropa de calidad hasta un 70% más barata. Tu estilo no tiene que costar una fortuna.' },
]

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh' }}>

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
          <div style={{ maxWidth: 560, margin: '0 auto 24px', display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 16, padding: '10px 10px 10px 16px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input type="search" placeholder="Busca chaquetas, jeans, vestidos..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }} />
            <button style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Buscar</button>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/vender" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Comenzar a Vender →</Link>
            <Link href="/explorar" style={{ backgroundColor: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Explorar Productos</Link>
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
            <Link href="/explorar" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Ver todas →</Link>
          </div>

          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, listStyle: 'none' }}>
            {MOCK_PRODUCTS.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/explorar" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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