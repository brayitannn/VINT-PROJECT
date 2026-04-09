'use client'

import { useEffect, useRef } from 'react'
import { Bell, X, ShoppingBag, Heart, MessageCircle, Star, Package, Settings, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { RealtimeNotification } from '@/hooks/useNotifications'

export interface NotificationPrefs {
  emailOfertas: boolean
  emailNuevas: boolean
  emailResumen: boolean
  pushMensajes: boolean
  pushVentas: boolean
  pushFavoritos: boolean
}

// Mapeo tipo → estilo visual
const TIPO_STYLES: Record<string, { icon: React.ElementType; color: string }> = {
  mensaje:  { icon: MessageCircle, color: '#6366F1' },
  venta:    { icon: ShoppingBag,   color: '#10B981' },
  favorito: { icon: Heart,         color: '#EF4444' },
  oferta:   { icon: Star,          color: '#F59E0B' },
  nuevas:   { icon: Package,       color: '#8B5E3C' },
  resumen:  { icon: Bell,          color: '#64748B' },
}

function formatTime(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
    if (diff < 60) return rtf.format(-Math.floor(diff), 'second')
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute')
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour')
    return rtf.format(-Math.floor(diff / 86400), 'day')
  } catch {
    return ''
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  notifications: RealtimeNotification[]
  unreadCount: number
  loading: boolean
  markAllRead: () => Promise<void>
  dismiss: (id: number) => Promise<void>
}

export function NotificationsPanel({ isOpen, onClose, notifications, unreadCount, loading, markAllRead, dismiss }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: 380,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'notifSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes notifSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .notif-item:hover { background-color: var(--bg-secondary) !important; }
        .notif-dismiss:hover { opacity: 1 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
            Notificaciones
          </h3>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              padding: '2px 8px',
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8, display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: 'var(--accent)', opacity: 0.5, animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Bell size={36} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              No tienes notificaciones aún.<br />
              <span style={{ fontSize: 12 }}>Aquí aparecerán tus mensajes, ventas y más.</span>
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const style = TIPO_STYLES[notif.tipo] ?? { icon: Bell, color: '#8B5E3C' }
            const Icon = style.icon
            return (
              <div
                key={notif.id}
                className="notif-item"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: !notif.leida ? `${style.color}06` : 'transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                {!notif.leida && (
                  <div style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 6, height: 6, borderRadius: '50%', backgroundColor: style.color,
                  }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  backgroundColor: `${style.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color: style.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {notif.titulo}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {notif.cuerpo}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatTime(notif.created_at)}
                  </p>
                </div>
                <button
                  className="notif-dismiss"
                  onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', opacity: 0.4,
                    padding: 4, borderRadius: 6, flexShrink: 0,
                    transition: 'opacity 0.2s', display: 'flex',
                  }}
                  title="Descartar"
                >
                  <X size={13} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={markAllRead}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}
        >
          Marcar todas como leídas
        </button>
        <Link
          href="/perfil?tab=notificaciones"
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
        >
          <Settings size={12} />
          Configurar
        </Link>
      </div>
    </div>
  )
}
