'use client'

import { useState } from 'react'

interface Props {
  open: boolean
  count?: number         // bulk delete
  productName?: string   // single delete
  onClose: () => void
  onConfirm: () => Promise<{ error: string | null }>
}

export function ProductDeleteDialog({ open, count, productName, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isBulk = !!count && count > 1

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    const { error } = await onConfirm()
    setLoading(false)
    if (error) setError(error)
    else onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-sm">
        <div className="delete-icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6m4-6v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>

        <h2 className="delete-title">
          {isBulk ? `Eliminar ${count} productos` : 'Eliminar producto'}
        </h2>
        <p className="delete-body">
          {isBulk
            ? `¿Estás seguro de que quieres eliminar estos ${count} productos? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`}
        </p>

        {error && (
          <div className="form-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
            {error}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}