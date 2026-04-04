/*
  page.tsx — Landing Page principal de VINT

  Es Server Component por defecto en Next.js 15 App Router.
  Se renderiza en el servidor: mejor SEO y carga más rápida.
  No puede tener useState ni eventos del usuario.

  Estructura:
  1. Hero Section     — título + barra de búsqueda
  2. Valores Section  — 3 tarjetas de propuesta de valor
  3. Productos Section — grid de 8 productos
  4. Footer
*/

/*
  page.tsx — Landing Page principal de VINT
  Next.js 15 App Router.
*/

import Link from 'next/link'
import { Search, ShieldCheck, Leaf, Tag } from 'lucide-react'
import { ProductCard, type Product } from '@/components/products/ProductCard'

// MOCK DATA — Datos de ejemplo
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Chaqueta de cuero vintage café',
    price: 85000,
    size: 'M',
    condition: 'Excelente',
    seller: 'María V.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Jean wide leg azul oscuro',
    price: 45000,
    size: 'S',
    condition: 'Muy Bueno',
    seller: 'Camila R.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    rating: 4.7,
  },
  {
    id: 3,
    name: 'Blazer oversize verde oliva',
    price: 72000,
    size: 'L',
    condition: 'Excelente',
    seller: 'Laura M.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
    rating: 5.0,
  },
  {
    id: 4,
    name: 'Vestido floral midi años 90',
    price: 38000,
    size: 'XS',
    condition: 'Bueno',
    seller: 'Sofía T.',
    image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=500&fit=crop',
    rating: 4.5,
  },
  {
    id: 5,
    name: 'Sweater de punto crema oversize',
    price: 52000,
    size: 'M',
    condition: 'Excelente',
    seller: 'Valentina O.',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Falda de cuadros escoceses',
    price: 29000,
    size: 'S',
    condition: 'Muy Bueno',
    seller: 'Isabela C.',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop',
    rating: 4.6,
  },
  {
    id: 7,
    name: 'Camiseta graphic tee banda rock',
    price: 22000,
    size: 'L',
    condition: 'Bueno',
    seller: 'Daniela P.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
    rating: 4.4,
  },
  {
    id: 8,
    name: 'Abrigo largo camel',
    price: 120000,
    size: 'M',
    condition: 'Excelente',
    seller: 'Andrea S.',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop',
    rating: 4.9,
  },
]

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    description: 'Todos los vendedores son verificados. Tu pago está protegido hasta que recibas tu prenda.',
  },
  {
    icon: Leaf,
    title: 'Moda Sostenible',
    description: 'Cada compra en VINT es una prenda menos en el vertedero. Moda circular, planeta feliz.',
  },
  {
    icon: Tag,
    title: 'Mejores Precios',
    description: 'Ropa de calidad hasta un 70% más barata. Tu estilo no tiene que costar una fortuna.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">

      {/* ── HERO ── */}
      <section
        style={{ backgroundColor: 'var(--bg-primary)' }}
        className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8"
        aria-labelledby="hero-title"
      >
        <div
          style={{ backgroundColor: 'var(--accent)' }}
          className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          >
            <span aria-hidden="true">✦</span>
            Más de 2.400 prendas disponibles
          </div>

          <h1
            id="hero-title"
            style={{ color: 'var(--text-primary)' }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6"
          >
            Ropa de{' '}
            <span style={{ color: 'var(--accent)' }}>Segunda Mano,</span>
            <br />
            Primer Nivel.
          </h1>

          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Compra y vende ropa única con estilo. VINT conecta a personas que aman
            la moda sostenible y los precios que sí tienen sentido.
          </p>

          <div className="max-w-xl mx-auto" role="search">
            <label htmlFor="search-input" className="sr-only">
              Buscar prendas, marcas o vendedores
            </label>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--border)',
              }}
              className="flex items-center rounded-2xl px-4 py-3 gap-3 focus-within:border-[var(--accent)] transition-all"
            >
              <Search
                size={20}
                style={{ color: 'var(--text-muted)' }}
                className="shrink-0"
              />
              <input
                id="search-input"
                type="search"
                placeholder="Busca chaquetas, jeans, vestidos..."
                style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                className="flex-1 outline-none text-base"
              />
              <button
                style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
                className="px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
          >
            ¿Por qué elegir VINT?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                  className="rounded-2xl p-8 text-center hover:shadow-md transition-shadow"
                >
                  <div
                    style={{ backgroundColor: 'var(--accent-light)' }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  >
                    <Icon size={26} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3
                    style={{ color: 'var(--text-primary)' }}
                    className="font-bold text-xl mb-3"
                  >
                    {value.title}
                  </h3>
                  <p
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-sm leading-relaxed"
                  >
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS ── */}
      <section
        style={{ backgroundColor: 'var(--bg-primary)' }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2
                style={{ color: 'var(--text-primary)' }}
                className="text-3xl sm:text-4xl font-bold"
              >
                Prendas destacadas
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="mt-2 text-sm">
                Selección curada de las mejores publicaciones del día
              </p>
            </div>
            <Link 
              href="/explorar"
              style={{ color: 'var(--accent)' }}
              className="text-sm font-semibold hover:underline hidden sm:block"
            >
              Ver todas →
            </Link>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {MOCK_PRODUCTS.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
        }}
        className="py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: 'var(--accent)' }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
            >
              <span className="font-black text-white text-sm">V</span>
            </div>
            <span style={{ color: 'var(--text-primary)' }} className="font-bold text-lg">
              Vint
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)' }} className="text-xs text-center">
            © 2025 Vint · Moda de segunda mano, primer nivel · Hecho con 💛 en Colombia
          </p>

          <nav>
            <ul className="flex gap-5">
              {['Términos', 'Privacidad', 'Contacto'].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    style={{ color: 'var(--text-muted)' }}
                    className="text-xs hover:text-[var(--accent)] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>

    </main>
  )
}