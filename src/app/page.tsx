import Link from 'next/link'
import { Search, ShieldCheck, Leaf, Tag, ArrowRight } from 'lucide-react'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/supabase'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { AutoCarousel } from '@/components/products/AutoCarousel'
import { FeatureCard } from '@/components/infoApp/FeatureCard'
import { HeroParallax } from '@/components/ui/HeroParallax'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { ParticlesBg } from '@/components/ui/ParticlesBg'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ReadingBar } from '@/components/ui/ReadingBar'
import { FooterLogo } from '@/components/ui/FooterLogo'

const VALUES = [
  { 
    icon: ShieldCheck, 
    title: 'Compra Segura', 
    description: 'Tu tranquilidad es nuestra prioridad. Protegemos cada centavo de tu compra mediante verificación rigurosa.',
  },
  { 
    icon: Leaf, 
    title: 'Moda Sostenible', 
    description: 'Vístete con propósito. Cada prenda en VINT es una historia que continúa y un respiro para el planeta.',
  },
  { 
    icon: Tag, 
    title: 'Mejores Precios', 
    description: 'Estilo de alta gama, precio de comunidad. Accede a marcas exclusivas con hasta un 70% de descuento.',
  },
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
    .limit(50)

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
    sellerEmail: item.correo_vendedor,
  }))

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        .hero-text-1 { animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .hero-text-2 { animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .hero-text-3 { animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .hero-text-4 { animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
        .live-dot { animation: pulseDot 1.4s ease-in-out infinite; }
        .btn-cta-primary:hover { filter: brightness(1.1); transform: translateY(-3px) scale(1.02); }
        .btn-cta-primary { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .btn-cta-secondary:hover { background-color: var(--bg-card); transform: translateY(-3px); }
        .btn-cta-secondary { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .features-grid:has(.feature-card-wrapper:hover) .feature-card-wrapper:not(:hover) {
          filter: blur(5px) opacity(0.6);
          transform: scale(0.95);
        }
        @media (max-width: 900px) {
          .hero-split { flex-direction: column !important; gap: 48px !important; }
          .hero-right { display: none !important; }
          .hero-left { max-width: 100% !important; text-align: center !important; }
          .hero-left-btns { justify-content: center !important; }
          .hero-left-badge { margin: 0 auto 24px !important; }
        }
      `}} />

      {/* ── Barra de progreso de lectura (fija arriba) ── */}
      <ReadingBar />

      <PublicNavbar />

      {/* ══════════════════════════════════════════
          HERO — SPLIT LAYOUT
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: '60px 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Puntitos flotantes de fondo */}
        <ParticlesBg />

        {/* Decorative background blobs */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-8%',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,94,60,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-6%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,94,60,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="hero-split" style={{
          maxWidth: 1280, margin: '0 auto', width: '100%',
          display: 'flex', alignItems: 'center',
          gap: 72, position: 'relative', zIndex: 1,
        }}>

          {/* ── LEFT: Copy ── */}
          <div className="hero-left" style={{ flex: '1 1 0', maxWidth: 580, zIndex: 1 }}>

            {/* Badge live */}
            <div className="hero-text-1 hero-left-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 999,
              backgroundColor: 'rgba(139,94,60,0.10)',
              border: '1px solid rgba(139,94,60,0.30)',
              marginBottom: 28,
            }}>
              <span className="live-dot" style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: '#10B981', display: 'inline-block',
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Moda circular · Colombia
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-text-2" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(42px, 5.5vw, 76px)',
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}>
              Ropa con<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #C58A62 50%, var(--accent) 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 4s linear infinite',
              }}>
                estilo propio.
              </span>
            </h1>

            {/* Sub-headline con efecto typewriter */}
            <TypewriterText
              text="Compra y vende prendas únicas. VINT conecta a personas que aman la moda sostenible — con precios que sí tienen sentido."
              delay={1100}
              speed={22}
              style={{
                fontSize: 18,
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                maxWidth: 500,
                marginBottom: 40,
                fontWeight: 400,
                minHeight: 88,
              }}
            />

            {/* CTA Buttons */}
            <div className="hero-text-4 hero-left-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/register?role=vendedor" className="btn-cta-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700,
                backgroundColor: 'var(--accent)', color: 'white', textDecoration: 'none',
                boxShadow: '0 12px 32px rgba(139,94,60,0.30)',
              }}>
                Comenzar a Vender <ArrowRight size={16} />
              </Link>
              <Link href="/products" className="btn-cta-secondary" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700,
                backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', textDecoration: 'none',
                border: '1.5px solid var(--border)',
                boxShadow: '0 4px 16px rgba(44,36,30,0.06)',
              }}>
                <Search size={16} /> Explorar Productos
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Imagen con Parallax 3D ── */}
          <HeroParallax />

        </div>
      </section>

      {/* VALORES — aparecen al bajar con ScrollReveal */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <ScrollReveal>
            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {VALUES.map((value, i) => {
                const Icon = value.icon
                return (
                  <ScrollReveal key={value.title} delay={i * 120}>
                    <FeatureCard
                      icon={<Icon size={26} style={{ color: 'var(--accent)' }} />}
                      title={value.title}
                      description={value.description}
                      ctaLabel="Saber más"
                    />
                  </ScrollReveal>
                )
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PRODUCTOS — aparecen al bajar con ScrollReveal */}
      <section style={{ backgroundColor: 'var(--bg-primary)', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'var(--text-primary)' }}>De lo mejor que podrás encontrar</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>Selección precisa de las mejores publicaciones del día</p>
              </div>
              <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Ver todas →</Link>
            </div>
          </ScrollReveal>

          <AutoCarousel>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AutoCarousel>

          <ScrollReveal delay={200}>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link href="/login" className="vint-btn-primary" style={{ padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
                Ver Todos los Productos →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER — logo con bounce al hover */}
      <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '48px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', left: 0 }}>
            <FooterLogo />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 Vint · Moda de segunda mano a nivel de todos · Made in Colombia</p>
        </div>
      </footer>
    </main>
  )
}