'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Settings, MapPin, Calendar, Star, Package, MessageCircle, UserPlus, MessageSquare, Trash2, Send, Check } from 'lucide-react'
import Link from 'next/link'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import { useAuth } from '@/context/AuthContext'
import { ChatModal } from '@/components/chat/ChatModal'

interface StoreFrontProps {
  isOwner: boolean;
  sellerId?: string;
  sellerEmail?: string; // Email del vendedor para filtrar en v_catalogo_publico
  sellerSlug?: string;
}

export function StoreFront({ isOwner, sellerId, sellerEmail, sellerSlug }: StoreFrontProps) {
  const [perfilData, setPerfilData] = useState<any>(null)
  const [productos, setProductos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [location, setLocation] = useState<string>('Colombia')
  const [joinYear, setJoinYear] = useState<number>(new Date().getFullYear())

  const supabase = createClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'catalogo' | 'comentarios'>('catalogo')
  const [comentarios, setComentarios] = useState<any[]>([])
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const sellerIdentifier = sellerId || sellerSlug || 'general';

  const fetchComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('vendedor_comentarios')
        .select('*')
        .eq('vendedor_id', sellerIdentifier)
        .order('fecha', { ascending: false })

      if (error) throw error;
      
      if (data && data.length > 0) {
        setComentarios(data);
      } else {
        loadFromLocalStorage();
      }
    } catch (e) {
      console.log('Error cargando de Supabase, usando localStorage:', e);
      loadFromLocalStorage();
    }
  }

  const loadFromLocalStorage = () => {
    const local = localStorage.getItem(`vint_comments_${sellerIdentifier}`);
    if (local) {
      setComentarios(JSON.parse(local));
    } else {
      const mockComments = [
        {
          id: 'mock-c1',
          vendedor_id: sellerIdentifier,
          autor_id: 'mock-a1',
          autor_nombre: 'Santiago Gómez',
          autor_avatar: null,
          calificacion: 5,
          contenido: '¡Excelente vendedora! La prenda llegó impecable, súper bien empacada y con un detalle muy lindo. Envío súper rápido.',
          fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-c2',
          vendedor_id: sellerIdentifier,
          autor_id: 'mock-a2',
          autor_nombre: 'Mariana Restrepo',
          autor_avatar: null,
          calificacion: 4,
          contenido: 'La chaqueta está en muy buen estado, tal como se describía. La comunicación fue excelente.',
          fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-c3',
          vendedor_id: sellerIdentifier,
          autor_id: 'mock-a3',
          autor_nombre: 'Mateo Díaz',
          autor_avatar: null,
          calificacion: 5,
          contenido: 'Todo perfecto, recomendado 100%. Volveré a comprar sin duda.',
          fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem(`vint_comments_${sellerIdentifier}`, JSON.stringify(mockComments));
      setComentarios(mockComments);
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !user) return;

    setSubmittingComment(true);

    let autorNombre = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario Vint';
    let autorAvatar = user.user_metadata?.avatar_url || null;

    try {
      let { data: perfil } = await supabase
        .from('usuarios')
        .select('primer_nombre, primer_apellido')
        .eq('id_auth_supabase', user.id)
        .maybeSingle()

      if (!perfil) {
        let res = await supabase.schema('seguridad').from('usuarios')
          .select('primer_nombre, primer_apellido')
          .eq('id_auth_supabase', user.id).maybeSingle()
        perfil = res.data
      }

      if (perfil) {
        autorNombre = `${perfil.primer_nombre} ${perfil.primer_apellido || ''}`.trim();
      }
    } catch (e) {
      console.log('Error obteniendo perfil del autor:', e);
    }

    const nuevoObj = {
      vendedor_id: sellerIdentifier,
      autor_id: user.id,
      autor_nombre: autorNombre,
      autor_avatar: autorAvatar,
      calificacion: nuevaCalificacion,
      contenido: nuevoComentario,
      fecha: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('vendedor_comentarios')
        .insert([nuevoObj]);

      if (error) throw error;
      await fetchComentarios();
    } catch (e) {
      console.log('Error insertando en Supabase, guardando en localStorage:', e);
      const local = localStorage.getItem(`vint_comments_${sellerIdentifier}`);
      const list = local ? JSON.parse(local) : [];
      const newCommentWithId = { ...nuevoObj, id: 'local-' + Date.now() };
      const updatedList = [newCommentWithId, ...list];
      localStorage.setItem(`vint_comments_${sellerIdentifier}`, JSON.stringify(updatedList));
      setComentarios(updatedList);
    }

    setNuevoComentario('');
    setNuevaCalificacion(5);
    setSubmittingComment(false);
  }

  const handleDeleteComment = async (id: string, autorId?: string) => {
    const isCommentAuthor = user && autorId === user.id;
    if (!isCommentAuthor) {
      alert("No tienes permiso para eliminar este comentario.");
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

    const isLocal = id.toString().startsWith('local-') || id.toString().startsWith('mock-');

    if (isLocal) {
      // Borrar directamente de localStorage y actualizar estado local
      const local = localStorage.getItem(`vint_comments_${sellerIdentifier}`);
      if (local) {
        const list = JSON.parse(local);
        const updatedList = list.filter((c: any) => c.id !== id);
        localStorage.setItem(`vint_comments_${sellerIdentifier}`, JSON.stringify(updatedList));
        setComentarios(updatedList);
      }
    } else {
      // Borrar de Supabase
      try {
        const { error } = await supabase
          .from('vendedor_comentarios')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        await fetchComentarios();
      } catch (e) {
        console.log('Error borrando en Supabase, borrando de localStorage como fallback:', e);
        const local = localStorage.getItem(`vint_comments_${sellerIdentifier}`);
        if (local) {
          const list = JSON.parse(local);
          const updatedList = list.filter((c: any) => c.id !== id);
          localStorage.setItem(`vint_comments_${sellerIdentifier}`, JSON.stringify(updatedList));
          setComentarios(updatedList);
        }
      }
    }
  }

  useEffect(() => {
    fetchComentarios();
  }, [sellerIdentifier]);

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

        // Obtener info de auth para avatar/ubicación
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setAvatarUrl(authUser.user_metadata?.avatar_url || null)
          setLocation(authUser.user_metadata?.location || 'Colombia')
          setJoinYear(new Date(authUser.created_at || new Date()).getFullYear())
          if (authUser.user_metadata?.username) setUsername(authUser.user_metadata.username)
        }

        // Cargar prendas usando el email del vendedor (prop o auth)
        const emailToUse = sellerEmail || authUser?.email
        if (emailToUse) {
          const { data: prods } = await supabase
            .from('v_catalogo_publico')
            .select('*')
            .eq('correo_vendedor', emailToUse)
            .order('fecha_publicacion', { ascending: false })
          fetchedProducts = prods || []
        } else if (nombreLimpio) {
          // Fallback por nombre
          const { data: prods } = await supabase
            .from('v_catalogo_publico')
            .select('*')
            .ilike('vendedor', `%${nombreLimpio.split(' ')[0]}%`)
            .order('fecha_publicacion', { ascending: false })
          fetchedProducts = prods || []
        }

      } else if (!isOwner && sellerSlug) {
        // --- VISTA PÚBLICA ---
        nombreLimpio = sellerSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        setUsername(sellerSlug.replace(/-/g, ''))
        
        // Buscar por nombre del vendedor en la vista pública
        const { data: prods } = await supabase
          .from('v_catalogo_publico')
          .select('*')
          .ilike('vendedor', `%${nombreLimpio.split(' ')[0]}%`)
          .order('fecha_publicacion', { ascending: false })
        
        fetchedProducts = prods || []

        if (fetchedProducts.length > 0) {
          const exactSellerName = fetchedProducts[0].vendedor || nombreLimpio
          const parts = exactSellerName.split(' ')
          setPerfilData({ 
            primer_nombre: parts[0] || '', 
            primer_apellido: parts.slice(1).join(' ') || '' 
          })
        } else {
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
  const firstInitial = (username ? username[0] : (nombreCompleto ? nombreCompleto[0] : 'V')).toUpperCase()

  return (
    <>
      <style>{`
        .store-banner {
          height: 250px;
          width: 100%;
          background: linear-gradient(to bottom, color-mix(in srgb, var(--accent) 30%, transparent) 0%, color-mix(in srgb, var(--text-primary) 85%, transparent) 100%), url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop');
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
          font-size: 48px;
          font-weight: 700;
          font-family: var(--font-serif);
          color: var(--bg-card);
          position: absolute;
          bottom: -70px;
          left: 48px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          overflow: visible;
        }

        .store-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-card);
          color: var(--accent);
          border: 3px solid var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 2;
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
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 20px;
          width: 100%;
          max-width: 600px;
        }

        .stat-block p { margin: 0; }
        .stat-block .val { font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .stat-block .lbl { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

        @media (max-width: 768px) {
          .store-info { flex-direction: column; padding: 85px 24px 32px; }
          .store-avatar { left: 50%; transform: translateX(-50%); bottom: -50px; width: 100px; height: 100px; }
          .store-actions { margin-top: 24px; width: 100%; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
          .store-stats { grid-template-columns: 1fr; width: 100%; max-width: 100%; }
          .comments-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }

        /* PREMIUM ACTIONS BUTTONS */
        .store-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border: 1px solid var(--border);
          cursor: pointer;
          background-color: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .store-btn-primary:hover {
          transform: translateY(-2px);
          background-color: var(--accent);
          color: var(--bg-card);
          border-color: transparent;
          box-shadow: 0 8px 20px -4px color-mix(in srgb, var(--accent) 65%, transparent);
        }

        .store-btn-primary:active {
          transform: translateY(1px);
          box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--accent) 40%, transparent);
        }

        .store-btn-primary svg {
          transition: transform 0.25s ease;
        }

        .store-btn-primary:hover svg {
          transform: scale(1.1) rotate(-5deg);
        }

        .store-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .store-btn-secondary:hover {
          transform: translateY(-2px);
          background: var(--bg-card-hover);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 6px 16px rgba(139, 94, 60, 0.08);
        }

        .store-btn-secondary:active {
          transform: translateY(1px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .store-btn-secondary svg {
          transition: transform 0.25s ease;
        }

        .store-btn-secondary:hover svg {
          transform: scale(1.1) translateY(-1px);
        }

        /* PREMIUM STATS CARDS */
        .store-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 4px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }

        .store-stat-card.clickable {
          cursor: pointer;
        }

        .store-stat-card .val {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
          transition: all 0.3s ease;
        }

        .store-stat-card .lbl {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          transition: all 0.3s ease;
        }

        .store-stat-card .star-icon {
          fill: var(--accent);
          color: var(--accent);
          transition: all 0.3s ease;
        }

        /* Hover State - turns brown */
        .store-stat-card:hover {
          transform: translateY(-2px);
          background: var(--accent);
          border-color: transparent;
          box-shadow: 0 8px 20px -4px color-mix(in srgb, var(--accent) 65%, transparent);
        }

        .store-stat-card:hover .val {
          color: var(--bg-card);
          font-weight: 700;
        }

        .store-stat-card:hover .lbl {
          color: var(--accent-light);
        }

        .store-stat-card:hover .star-icon {
          fill: var(--bg-card);
          color: var(--bg-card);
        }

        .store-stat-card:active {
          transform: translateY(1px);
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
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="store-avatar-img" /> : firstInitial}
              {/* Badge verificado */}
              <div className="avatar-badge" title="Vendedor Verificado">
                <Check size={14} strokeWidth={3.5} />
              </div>
            </div>
          </div>
          
          <div className="store-info">
            <div>
              {/* Rol Vendedor Chip */}
              <div style={{
                display: 'inline-block',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 8,
                border: '1px solid var(--border)'
              }}>
                Vendedor
              </div>

              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
                {nombreCompleto}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '2px 0 16px', fontWeight: 500 }}>
                @{username}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} /> {location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} /> En Vint desde {joinYear}
                </span>
              </div>

              {/* Separador Horizontal */}
              <div style={{ borderBottom: '1px solid var(--border)', margin: '20px 0' }} />

              <div className="store-stats">
                {/* Calificación */}
                <div 
                  onClick={() => {
                    setActiveTab('comentarios');
                    setTimeout(() => {
                      document.getElementById('comentarios-tab-btn')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="store-stat-card clickable"
                >
                  <p className="val">
                    {comentarios.length > 0 ? (comentarios.reduce((acc, c) => acc + c.calificacion, 0) / comentarios.length).toFixed(1) : '5.0'} 
                    <Star size={16} className="star-icon" />
                  </p>
                  <p className="lbl">
                    Calificación
                  </p>
                </div>

                {/* Prendas en Venta */}
                <div className="store-stat-card">
                  <p className="val">
                    {productos.length}
                  </p>
                  <p className="lbl">
                    Prendas en Venta
                  </p>
                </div>

                {/* Ventas Exitosas */}
                <div className="store-stat-card">
                  <p className="val">
                    +100
                  </p>
                  <p className="lbl">
                    Ventas Exitosas
                  </p>
                </div>
              </div>
            </div>

            <div className="store-actions">
              {isOwner ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link
                    href="/perfil"
                    className="store-btn-primary"
                  >
                    <Settings size={18} /> Editar Perfil
                  </Link>
                  <button
                    onClick={() => {
                      setActiveTab('comentarios');
                      setTimeout(() => {
                        document.getElementById('comentarios-tab-btn')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="store-btn-secondary"
                  >
                    <MessageSquare size={18} /> Ver Comentarios
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="store-btn-primary"
                  >
                    <UserPlus size={18} /> Seguir Tienda
                  </button>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="store-btn-secondary"
                  >
                    <MessageCircle size={18} /> Contactar
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('comentarios');
                      setTimeout(() => {
                        document.getElementById('comentarios-tab-btn')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="store-btn-secondary"
                  >
                    <MessageSquare size={18} /> Comentarios
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación y Contenido */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 24px' }}>
          
          {/* Barra de Pestañas */}
          <div style={{
            display: 'flex',
            gap: 24,
            borderBottom: '1px solid var(--border)',
            marginBottom: 40,
          }}>
            <button
              onClick={() => setActiveTab('catalogo')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'catalogo' ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeTab === 'catalogo' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 18,
                fontWeight: 700,
                padding: '12px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <Package size={20} />
              Prendas en Venta ({productos.length})
            </button>
            <button
              onClick={() => setActiveTab('comentarios')}
              id="comentarios-tab-btn"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'comentarios' ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeTab === 'comentarios' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 18,
                fontWeight: 700,
                padding: '12px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <MessageSquare size={20} />
              Comentarios ({comentarios.length})
            </button>
          </div>

          {activeTab === 'catalogo' ? (
            <div>
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
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 40,
              alignItems: 'start'
            }} className="comments-grid">
              
              {/* Panel Izquierdo: Resumen y Formulario */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Resumen de Calificaciones */}
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  padding: 32,
                  boxShadow: '0 4px 20px var(--shadow)'
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
                    Resumen de valoraciones
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {comentarios.length > 0 ? (comentarios.reduce((acc, c) => acc + c.calificacion, 0) / comentarios.length).toFixed(1) : '5.0'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const avg = comentarios.length > 0 ? comentarios.reduce((acc, c) => acc + c.calificacion, 0) / comentarios.length : 5;
                          return (
                            <Star
                              key={star}
                              size={18}
                              fill={star <= Math.round(avg) ? '#F59E0B' : 'transparent'}
                              color={star <= Math.round(avg) ? '#F59E0B' : 'var(--text-muted)'}
                            />
                          );
                        })}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                        Basado en {comentarios.length} {comentarios.length === 1 ? 'valoración' : 'valoraciones'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Desglose de estrellas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = comentarios.filter(c => c.calificacion === stars).length;
                      const percentage = comentarios.length > 0 ? (count / comentarios.length) * 100 : 0;
                      return (
                        <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                          <span style={{ minWidth: 48, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {stars} <Star size={12} fill="#F59E0B" color="#F59E0B" />
                          </span>
                          <div style={{ flex: 1, height: 8, backgroundColor: 'var(--bg-secondary)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: 999, transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ minWidth: 28, textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulario de Calificación */}
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  padding: 32,
                  boxShadow: '0 4px 20px var(--shadow)'
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Deja tu valoración
                  </h3>
                  
                  {!user ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Debes iniciar sesión para escribir un comentario sobre este vendedor.
                      </p>
                      <Link
                        href="/login"
                        style={{
                          display: 'inline-block',
                          padding: '10px 20px',
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          borderRadius: 12,
                          fontWeight: 700,
                          textDecoration: 'none',
                          fontSize: 14,
                          transition: 'all 0.2s'
                        }}
                        className="hover:scale-105"
                      >
                        Iniciar sesión
                      </Link>
                    </div>
                  ) : isOwner ? (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      Esta es tu propia tienda. Los compradores calificarán tu servicio aquí.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitComment} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Tu calificación
                        </label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNuevaCalificacion(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
                                transition: 'transform 0.1s'
                              }}
                              className="hover:scale-110"
                            >
                              <Star
                                size={28}
                                fill={(hoverRating !== null ? star <= hoverRating : star <= nuevaCalificacion) ? '#F59E0B' : 'transparent'}
                                color={(hoverRating !== null ? star <= hoverRating : star <= nuevaCalificacion) ? '#F59E0B' : 'var(--border)'}
                                style={{ transition: 'fill 0.1s, color 0.1s' }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Tu comentario
                        </label>
                        <textarea
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          placeholder="Escribe tu opinión sobre el vendedor, calidad de la prenda, velocidad de envío..."
                          required
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: 14,
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: 14,
                            outline: 'none',
                            resize: 'none',
                            lineHeight: 1.5,
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submittingComment || !nuevoComentario.trim()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: '12px 24px',
                          borderRadius: 14,
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(139,94,60,0.2)'
                        }}
                        className="hover:scale-105"
                      >
                        <Send size={16} /> Enviar comentario
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Panel Derecho: Lista de Comentarios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Opiniones de la comunidad
                </h3>
                
                {comentarios.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: 24,
                    border: '1px dashed var(--border)'
                  }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                      Sin comentarios aún
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                      Sé el primero en valorar la tienda de {nombreCompleto}.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {comentarios.map((comment) => {
                      const commentDate = new Date(comment.fecha);
                      const isCommentAuthor = user && comment.autor_id === user.id;
                      const isProfileOwner = isOwner;
                      const initialLetter = comment.autor_nombre ? comment.autor_nombre[0].toUpperCase() : 'U';
                      
                      return (
                        <div
                          key={comment.id}
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 20,
                            padding: 24,
                            boxShadow: '0 2px 12px var(--shadow)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 16,
                                overflow: 'hidden'
                              }}>
                                {comment.autor_avatar ? (
                                  <img src={comment.autor_avatar} alt={comment.autor_nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  initialLetter
                                )}
                              </div>
                              <div>
                                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                  {comment.autor_nombre}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                  <div style={{ display: 'flex', gap: 2 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={12}
                                        fill={star <= comment.calificacion ? '#F59E0B' : 'transparent'}
                                        color={star <= comment.calificacion ? '#F59E0B' : 'var(--text-muted)'}
                                      />
                                    ))}
                                  </div>
                                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                                    {commentDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {isCommentAuthor && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, comment.autor_id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: 6,
                                  borderRadius: 8,
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                className="hover:bg-red-50 hover:text-red-500"
                                title="Eliminar comentario"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          
                          <p style={{
                            fontSize: 14,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            margin: 0,
                            whiteSpace: 'pre-line'
                          }}>
                            {comment.contenido}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          sellerName={nombreCompleto}
          sellerSlug={sellerSlug}
          sellerId={sellerId}
        />
      </main>
    </>
  )
}
