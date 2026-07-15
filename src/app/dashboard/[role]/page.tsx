'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldAlert,
  Loader2,
  Lock,
  Tag,
  Users,
  Grid,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import Loader from '@/components/ui/Loader'
import { API_BASE_URL } from '@/lib/api'

interface PrendaAdmin {
  id_prenda: number
  titulo: string
  descripcion: string
  precio: number
  talla: string
  color: string
  genero: string
  condicion: string
  estado_publicacion: string
  fecha_publicacion: string
  id_usuario: number
  vendedor_email?: string
}

interface UsuarioAdmin {
  id_usuario: number
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  correo: string
  telefono?: string
  fecha_registro: string
  activo: boolean
  roles?: {
    nombre: string
  }
}

export default function CustomRoleDashboard() {
  const { role } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  // State
  const [activeTab, setActiveTab] = useState<'prendas' | 'usuarios'>('prendas')
  const [prendas, setPrendas] = useState<PrendaAdmin[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [stats, setStats] = useState({
    totalPrendas: 0,
    activas: 0,
    pausadas: 0,
    vendidas: 0,
    totalUsuarios: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch all garments and users
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Get all garments
      const { data: garments, error: gError } = await supabase
        .schema('catalogo')
        .from('prendas')
        .select(`
          id_prenda, titulo, descripcion, precio, talla, color, genero,
          condicion, estado_publicacion, fecha_publicacion, id_usuario
        `)
        .order('fecha_publicacion', { ascending: false })

      if (gError) throw gError

      // 2. Fetch full users list
      const { data: usersData, error: uError } = await supabase
        .schema('seguridad')
        .from('usuarios')
        .select(`
          id_usuario, primer_nombre, segundo_nombre,
          primer_apellido, segundo_apellido, correo, telefono,
          fecha_registro, activo, roles!left(nombre)
        `)
        .order('fecha_registro', { ascending: false })

      if (uError) throw uError

      const userMap = new Map((usersData || []).map((u: any) => [u.id_usuario, u.correo]))

      const mapped: PrendaAdmin[] = (garments || []).map((g: any) => ({
        ...g,
        vendedor_email: userMap.get(g.id_usuario) || 'Desconocido',
      }))

      setPrendas(mapped)
      setUsuarios(usersData || [])

      // Calculate stats
      const total = mapped.length
      const active = mapped.filter(p => p.estado_publicacion === 'DISPONIBLE').length
      const paused = mapped.filter(p => p.estado_publicacion === 'PAUSADA').length
      const sold = mapped.filter(p => p.estado_publicacion === 'VENDIDA').length

      setStats({
        totalPrendas: total,
        activas: active,
        pausadas: paused,
        vendidas: sold,
        totalUsuarios: usersData ? usersData.length : 0,
      })
    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      showToast('Error al cargar datos del catálogo o usuarios.', 'error')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllData()
    }
  }, [authLoading, user, fetchAllData])

  // Moderate: toggle active / paused status
  const handleToggleStatus = async (prendaId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'DISPONIBLE' ? 'PAUSADA' : 'DISPONIBLE'
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token || ''

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: String(prendaId),
          status: nextStatus === 'DISPONIBLE' ? 'published' : 'draft',
        }),
      })

      const json = await res.json()
      if (res.ok) {
        showToast(`Prenda ${nextStatus === 'DISPONIBLE' ? 'activada' : 'pausada'} correctamente.`)
        fetchAllData()
      } else {
        showToast(json.detail || 'Error al actualizar estado.', 'error')
      }
    } catch {
      showToast('Error al cambiar el estado de la prenda.', 'error')
    }
  }

  // Filter list of garments
  const filteredPrendas = prendas.filter(p => {
    const matchesSearch =
      p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendedor_email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.estado_publicacion === statusFilter
    return matchesSearch && matchesStatus
  })

  // Filter list of users
  const filteredUsuarios = usuarios.filter(u => {
    const fullName = `${u.primer_nombre} ${u.segundo_nombre || ''} ${u.primer_apellido} ${u.segundo_apellido || ''}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.telefono && u.telefono.includes(searchQuery))
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVO' && u.activo) || (statusFilter === 'INACTIVO' && !u.activo)
    return matchesSearch && matchesStatus
  })

  const formattedRoleName = String(role || '').toUpperCase()

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', gap: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Debes iniciar sesión</p>
        <a href="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Ir al Login →</a>
      </div>
    )
  }

  return (
    <>
      <Loader show={loading} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '14px 20px', borderRadius: 14,
          backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: 'white', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .control-row:hover { background-color: var(--bg-secondary) !important; }
        .role-badge {
          display: inline-block; padding: 4px 10px; borderRadius: 8px; fontSize: 11px; fontWeight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
      `}</style>

      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '28px 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  color: 'var(--text-muted)', marginBottom: 12, transition: 'color 0.2s',
                }}
              >
                <ArrowLeft size={16} />
                Volver al Panel
              </Link>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldAlert size={28} style={{ color: 'var(--accent)' }} />
                Panel de {formattedRoleName}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                Panel de control y visualización de recursos para roles de soporte y moderación
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Sesión activa: <strong>{user.email}</strong></span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {/* Stat 1 */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', padding: 12, borderRadius: 12 }}>
                <Grid size={22} />
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prendas en Catálogo</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{stats.totalPrendas}</h2>
              </div>
            </div>
            {/* Stat 2 */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)', padding: 12, borderRadius: 12 }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prendas Activas</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{stats.activas}</h2>
              </div>
            </div>
            {/* Stat 3 */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)', padding: 12, borderRadius: 12 }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prendas Pausadas</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{stats.pausadas}</h2>
              </div>
            </div>
            {/* Stat 4 */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'rgb(124, 58, 237)', padding: 12, borderRadius: 12 }}>
                <Users size={22} />
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Usuarios Totales</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{stats.totalUsuarios}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <button
              onClick={() => { setActiveTab('prendas'); setSearchQuery(''); setStatusFilter('ALL') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10, border: 'none',
                backgroundColor: activeTab === 'prendas' ? 'var(--accent-light)' : 'transparent',
                color: activeTab === 'prendas' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Grid size={16} />
              Moderación de Catálogo
            </button>
            <button
              onClick={() => { setActiveTab('usuarios'); setSearchQuery(''); setStatusFilter('ALL') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10, border: 'none',
                backgroundColor: activeTab === 'usuarios' ? 'var(--accent-light)' : 'transparent',
                color: activeTab === 'usuarios' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Users size={16} />
              Usuarios de la Plataforma
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 2rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 24,
          }}>
            {/* Toolbar Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeTab === 'prendas' ? 'Catálogo de Prendas' : 'Usuarios Registrados'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {activeTab === 'prendas'
                    ? 'Filtra y activa o pausa cualquier prenda publicada en la plataforma'
                    : 'Listado completo de usuarios en la base de datos (Vista de lectura)'}
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeTab === 'prendas' ? "Buscar por título o vendedor..." : "Buscar por nombre o correo..."}
                    style={{
                      padding: '8px 12px 8px 36px', borderRadius: 10, fontSize: 13,
                      border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)', outline: 'none', width: 240,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: 10, fontSize: 13,
                      border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)', outline: 'none',
                    }}
                  >
                    {activeTab === 'prendas' ? (
                      <>
                        <option value="ALL">Todos los estados</option>
                        <option value="DISPONIBLE">Disponibles</option>
                        <option value="PAUSADA">Pausadas</option>
                        <option value="VENDIDA">Vendidas</option>
                      </>
                    ) : (
                      <>
                        <option value="ALL">Todos los estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Area */}
            {activeTab === 'prendas' ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>ID</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Título</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Vendedor</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Precio / Talla</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Estado</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Moderación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrendas.map((p) => {
                      const isActive = p.estado_publicacion === 'DISPONIBLE'
                      const isPaused = p.estado_publicacion === 'PAUSADA'
                      const isSold = p.estado_publicacion === 'VENDIDA'

                      return (
                        <tr key={p.id_prenda} className="control-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)' }}>{p.id_prenda}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{p.titulo}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                              {p.descripcion || 'Sin descripción'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.vendedor_email}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', display: 'block' }}>
                              ${p.precio.toLocaleString('es-CO')}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Talla: {p.talla} | {p.color}</span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : isPaused ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: isActive ? 'rgb(16, 185, 129)' : isPaused ? 'rgb(245, 158, 11)' : 'rgb(59, 130, 246)',
                            }}>
                              {p.estado_publicacion}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {!isSold ? (
                              <button
                                onClick={() => handleToggleStatus(p.id_prenda, p.estado_publicacion)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  padding: '6px 12px', borderRadius: 8, border: 'none',
                                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: isActive ? 'rgb(245, 158, 11)' : 'rgb(16, 185, 129)',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {isActive ? (
                                  <>
                                    <Pause size={12} /> Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play size={12} /> Activar
                                  </>
                                )}
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Prenda Vendida
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredPrendas.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                          No se encontraron prendas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>ID</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Nombre Completo</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Contacto</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Rol Asignado</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Fecha Registro</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((u) => {
                      const fullNombre = `${u.primer_nombre} ${u.segundo_nombre || ''} ${u.primer_apellido} ${u.segundo_apellido || ''}`.trim()
                      const userRoleName = u.roles?.nombre || 'COMPRADOR'
                      const isUserActive = u.activo

                      return (
                        <tr key={u.id_usuario} className="control-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)' }}>{u.id_usuario}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{fullNombre}</span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {u.correo}
                            </span>
                            {u.telefono && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <Phone size={12} /> {u.telefono}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span className="role-badge" style={{
                              backgroundColor: userRoleName === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : userRoleName === 'VENDEDOR' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: userRoleName === 'ADMIN' ? 'rgb(239, 68, 68)' : userRoleName === 'VENDEDOR' ? 'rgb(245, 158, 11)' : 'rgb(59, 130, 246)',
                            }}>
                              {userRoleName}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={12} />
                              {new Date(u.fecha_registro).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                              backgroundColor: isUserActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isUserActive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                            }}>
                              {isUserActive ? 'Activo' : 'Baneado'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredUsuarios.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
