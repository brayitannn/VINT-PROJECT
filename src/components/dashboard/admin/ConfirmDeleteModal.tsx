'use client'

import { useState } from 'react'
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  userName: string
  userEmail: string
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, userName, userEmail }: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const canConfirm = confirmText === 'ELIMINAR'

  const handleConfirm = async () => {
    if (!canConfirm) return
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false)
      setConfirmText('')
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '100%', maxWidth: 460,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: 32,
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        animation: 'scaleIn 0.2s ease',
      }}>
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 8,
          }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <AlertTriangle size={28} style={{ color: '#EF4444' }} />
        </div>

        {/* Content */}
        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Eliminar usuario
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          Estás a punto de eliminar permanentemente a <strong style={{ color: 'var(--text-primary)' }}>{userName}</strong> ({userEmail}).
          Esta acción no se puede deshacer. Se eliminarán todos sus datos, publicaciones y transacciones.
        </p>

        {/* Confirm input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Escribe ELIMINAR para confirmar
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            style={{
              width: '100%', marginTop: 8, padding: '12px 16px',
              borderRadius: 12, fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${canConfirm ? '#EF4444' : 'var(--border)'}`,
              backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
              outline: 'none', boxSizing: 'border-box',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12,
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12,
              border: 'none',
              backgroundColor: canConfirm ? '#EF4444' : 'var(--bg-secondary)',
              color: canConfirm ? 'white' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 700,
              cursor: canConfirm && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
      `}</style>
    </>
  )
}
