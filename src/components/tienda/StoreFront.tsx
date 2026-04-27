'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Settings, MapPin, Calendar, Star, Package, MessageCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { ProductCard, type Product } from '@/components/products/ProductCard'

interface StoreFrontProps {
  isOwner: boolean;
  sellerId?: string; // Si es dueño, pasamos el ID para asegurar los datos exactos
  sellerSlug?: string; // Si es visitante, pasamos el slug (ej. brayan-felipe)
}

export function StoreFront({ isOwner, sellerId, sellerSlug }: StoreFrontProps) {
  const [perfilData, setPerfilData] = useState<any>(null)
  const [productos, setProductos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [location, setLocation] = useState<string>('Colombia')
  const [joinYear, setJoinYear] = useState<number>(new Date().getFullYear())

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      let fetchedProducts: any[] = []
      let nombreLimpio = ''

      if (isOwner && sellerId) {
        // --- VISTA DE DUEÑO ---
        let { data: perfil } = await supabase
          .from('usuarios')
          .select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento')
          .eq('id_auth_supabase', sellerId)
          .maybeSingle()
        
        if (!perfil) {
          let res = await supabase.schema('seguridad').from('usuarios')
            .select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento')
            .eq('id_auth_supabase', sellerId).maybeSingle()
          perfil = res.data
        }
        setPerfilData(perfil)
        nombreLimpio = perfil ? `${perfil.primer_nombre} ${perfil.primer_apellido}`.replace(/\s+/g, ' ').trim() : 'Vendedor'
        setUsername(nombreLimpio.toLowerCase().replace(/\s+/g, ''))

        // Intentar obtener info de auth si es posible (solo funciona para el usuario actual)
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.id === sellerId) {
          setAvatarUrl(user.user_metadata?.avatar_url || null)
          setLocation(user.user_metadata?.location || 'Colombia')
          setJoinYear(new Date(user.created_at || new Date()).getFullYear())
          if (user.user_metadata?.username) setUsername(user.user_metadata.username)
        }

        const { data: prods } = await supabase
          .from('productos')
          .select('*')
          .eq('usuario_id', sellerId)
          .order('fecha_publicacion', { ascending: false })
        
        fetchedProducts = prods || []

      } else if (!isOwner && sellerSlug) {
        // --- VISTA PÚBLICA ---
        // Convertir slug a nombre aproximado
        nombreLimpio = sellerSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        setUsername(sellerSlug.replace(/-/g, ''))
        
        // Cargar productos desde el catálogo público filtrando por vendedor
        const { data: prods } = await supabase
          .from('v_catalogo_publico')
          .select('*')
          .ilike('vendedor', `%${nombreLimpio.split(' ')[0]}%`) // Búsqueda flexible por primer nombre
          .order('fecha_publicacion', { ascending: false })
        
        fetchedProducts = prods || []

        if (fetchedProducts.length > 0) {
          // Obtener el nombre exacto del publicador desde el primer producto
          const exactSellerName = fetchedProducts[0].vendedor || nombreLimpio
          const parts = exactSellerName.split(' ')
          
          setPerfilData({ 
            primer_nombre: parts[0] || '', 
            primer_apellido: parts.slice(1).join(' ') || '' 
          })

          // Si necesitamos el ID real para otras cosas (como rating o avatar si existiera en la DB)
          const firstProductId = fetchedProducts[0].id_prenda
          const { data: realProduct } = await supabase.from('productos').select('usuario_id').eq('id_prenda', firstProductId).maybeSingle()
          
          if (realProduct && realProduct.usuario_id) {
            let { data: perfilReal } = await supabase
              .from('usuarios')
              .select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento')
              .eq('id_auth_supabase', realProduct.usuario_id)
              .maybeSingle()
            
            if (!perfilReal) {
              let res = await supabase.schema('seguridad').from('usuarios')
                .select('primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento')
                .eq('id_auth_supabase', realProduct.usuario_id).maybeSingle()
              perfilReal = res.data
            }

            if (perfilReal) {
              setPerfilData(perfilReal)
            }
          }
        } else {
          // Si no tiene productos, usamos el nombre del slug como fallback
          setPerfilData({ primer_nombre: nombreLimpio.split(' ')[0], primer_apellido: nombreLimpio.split(' ').slice(1).join(' ') })
        }
      }

      const mapped: Product[] = fetchedProducts.map((p: any) => ({
        id: p.id_prenda,
        name: p.titulo || 'Sin título',
        price: Number(p.precio) || 0,
        image: p.imagen_principal || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop',
        size: p.talla || 'M',
        condition: mapConditionDBtoUI(p.condicion || p.estado_publicacion),
        seller: p.vendedor || nombreLimpio,
        rating: 4.8
      }))

      setProductos(mapped)
      setLoading(false)
    }

    fetchData()
  }, [isOwner, sellerId, sellerSlug])

  const mapConditionDBtoUI = (condicion: string) => {
    switch(condicion?.toUpperCase()) {
      case 'NUEVO':
      case 'COMO_NUEVO': return 'Excelente'
      case 'USADO': return 'Muy Bueno'
      case 'DESGASTADO': return 'Bueno'
      default: return 'Bueno'
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Cargando tienda...</p>
      </div>
    )
  }

  const nombreCompleto = perfilData 
    ? `${perfilData.primer_nombre} ${perfilData.primer_apellido || ''}`.replace(/\s+/g, ' ').trim()
    : (sellerSlug ? sellerSlug.replace(/-/g, ' ') : 'Vendedor')
  
  const initials = nombreCompleto.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'US'

  return (
    <>
      <style>{`
        .store-banner {
          height: 250px;
          width: 100%;
          background: linear-gradient(135deg, rgba(139,94,60,0.8) 0%, rgba(16,185,129,0.8) 100%), url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop');
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .store-avatar {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 6px solid var(--bg-primary);
          background-color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 900;
          color: white;
          position: absolute;
          bottom: -70px;
          left: 48px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        .store-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .store-info {
          padding: 85px 48px 48px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .store-stats {
          display: flex;
          gap: 32px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px dashed var(--border);
        }

        .stat-block p { margin: 0; }
        .stat-block .val { font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .stat-block .lbl { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

        @media (max-width: 768px) {
          .store-info { flex-direction: column; padding: 85px 24px 32px; }
          .store-avatar { left: 50%; transform: translateX(-50%); bottom: -50px; width: 100px; height: 100px; }
          .store-actions { margin-top: 24px; width: 100%; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
          .store-stats { flex-wrap: wrap; justify-content: center; text-align: center; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: 80 }}>
        
        <div style={{ background: 'var(--bg-primary)' }}>
          <div className="store-banner">
            
            {/* Botón Volver Flotante (Glassmorphism) */}
            <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
              <Link 
                href={isOwner ? "/dashboard" : "/explorar"} 
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: '999px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                }}
              >
                <ArrowLeft size={18} /> {isOwner ? "Volver al Dashboard" : "Volver a Explorar"}
              </Link>
            </div>
            
            <div className="store-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : initials}
            </div>
          </div>
          
          <div className="store-info">
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1 }}>
                {nombreCompleto}
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 16px', fontWeight: 500 }}>
                @{username}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} /> {location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} /> En Vint desde {joinYear}
                </span>
              </div>

              <div className="store-stats">
                <div className="stat-block">
                  <p className="val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>4.8 <Star size={16} fill="#F59E0B" color="#F59E0B" /></p>
                  <p className="lbl">Calificación</p>
                </div>
                <div className="stat-block">
                  <p className="val">{productos.length}</p>
                  <p className="lbl">Prendas en Venta</p>
                </div>
                <div className="stat-block">
                  <p className="val">+100</p>
                  <p className="lbl">Ventas Exitosas</p>
                </div>
              </div>
            </div>

            <div className="store-actions">
              {isOwner ? (
                <Link
                  href="/perfil"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 14,
                    backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    fontSize: 15, fontWeight: 700, textDecoration: 'none',
                    border: '1px solid var(--border)', transition: 'all 0.2s',
                  }}
                  className="hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <Settings size={18} /> Editar Perfil
                </Link>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 14,
                      backgroundColor: 'var(--accent)', color: 'white',
                      fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139,94,60,0.3)',
                    }}
                    className="hover:scale-105"
                  >
                    <UserPlus size={18} /> Seguir Tienda
                  </button>
                  <button
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 14,
                      backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      fontSize: 15, fontWeight: 700, border: '1px solid var(--border)', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <MessageCircle size={18} /> Contactar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grilla de Publicaciones */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,94,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Package size={20} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Catálogo de {isOwner ? 'Mis Publicaciones' : nombreCompleto}
            </h2>
          </div>

          {productos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-primary)', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>El catálogo está vacío</p>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 24px' }}>
                {isOwner ? 'Aún no has publicado ninguna prenda para la venta.' : 'Este vendedor aún no ha publicado prendas.'}
              </p>
              {isOwner && (
                <Link href="/products?new=true" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 12, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>
                  Publicar mi primera prenda
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {productos.map((prod) => (
                <div key={prod.id} style={{ position: 'relative' }}>
                  <ProductCard product={prod} />
                  {/* Etiqueta decorativa sobre el producto propio */}
                  {isOwner && (
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, zIndex: 10 }}>
                      TU PUBLICACIÓN
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}
