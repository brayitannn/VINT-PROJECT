'use client'

import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Shield, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import type { UsuarioAdmin, RolDB } from '@/types/auth'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'

interface UsersTableProps {
  usuarios: UsuarioAdmin[]
  roles: RolDB[]
  total: number
  page: number
  limit: number
  search: string
  roleFilter: string
  statusFilter: string
  onSearchChange: (v: string) => void
  onRoleFilterChange: (v: string) => void
  onStatusFilterChange: (v: string) => void
  onPageChange: (p: number) => void
  onToggleStatus: (userId: number, activo: boolean) => Promise<void>
  onDeleteUser: (userId: number) => Promise<void>
  onAssignRole: (userId: number, roleId: number) => Promise<void>
  loading: boolean
}

export function UsersTable({
  usuarios, roles, total, page, limit,
  search, roleFilter, statusFilter,
  onSearchChange, onRoleFilterChange, onStatusFilterChange, onPageChange,
  onToggleStatus, onDeleteUser, onAssignRole, loading,
}: UsersTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<UsuarioAdmin | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const totalPages = Math.ceil(total / limit)

  const handleToggle = async (user: UsuarioAdmin) => {
    setActionLoading(user.id_usuario)
    await onToggleStatus(user.id_usuario, !user.activo)
    setActionLoading(null)
  }

  const handleRoleChange = async (user: UsuarioAdmin, newRoleId: number) => {
    setActionLoading(user.id_usuario)
    await onAssignRole(user.id_usuario, newRoleId)
    setActionLoading(null)
  }

  return (
    <>
      {/* Filtros */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12, fontSize: 13,
              border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)', outline: 'none', fontFamily: "'DM Sans', sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 12, fontSize: 13,
            border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)', outline: 'none', fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
          }}
        >
          <option value="">Todos los roles</option>
          {roles.map(r => (
            <option key={r.id_rol} value={r.nombre}>{r.nombre}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 12, fontSize: 13,
            border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)', outline: 'none', fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {total} usuario{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
            No se encontraron usuarios.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nombre', 'Correo', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '14px 16px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                      color: 'var(--text-muted)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr
                    key={user.id_usuario}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Nombre */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          backgroundColor: 'var(--accent)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, flexShrink: 0,
                        }}>
                          {user.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {user.nombre_completo}
                        </span>
                      </div>
                    </td>

                    {/* Correo */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {user.correo}
                    </td>

                    {/* Rol */}
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={user.id_rol}
                        onChange={(e) => handleRoleChange(user, parseInt(e.target.value))}
                        disabled={actionLoading === user.id_usuario}
                        style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 12,
                          border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {roles.map(r => (
                          <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                        ))}
                      </select>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        backgroundColor: user.activo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: user.activo ? '#10B981' : '#EF4444',
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          backgroundColor: user.activo ? '#10B981' : '#EF4444',
                        }} />
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(user.fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={actionLoading === user.id_usuario}
                          title={user.activo ? 'Desactivar' : 'Activar'}
                          style={{
                            padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer',
                            backgroundColor: 'transparent', color: user.activo ? '#F59E0B' : '#10B981',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          {actionLoading === user.id_usuario
                            ? <Loader2 size={16} className="animate-spin" />
                            : user.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Eliminar"
                          style={{
                            padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer',
                            backgroundColor: 'transparent', color: '#EF4444',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, padding: 16, borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                backgroundColor: 'transparent', cursor: page > 1 ? 'pointer' : 'not-allowed',
                color: page > 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
              }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                backgroundColor: 'transparent', cursor: page < totalPages ? 'pointer' : 'not-allowed',
                color: page < totalPages ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
              }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget ? onDeleteUser(deleteTarget.id_usuario) : Promise.resolve()}
        userName={deleteTarget?.nombre_completo || ''}
        userEmail={deleteTarget?.correo || ''}
      />
    </>
  )
}
