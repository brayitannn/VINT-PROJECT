'use client'

import { useState } from 'react'
import { Plus, Edit3, Save, X, Shield, Check, Loader2 } from 'lucide-react'
import type { RolDB, PermisoDB } from '@/types/auth'

interface RolesManagerProps {
  roles: RolDB[]
  allPermisos: PermisoDB[]
  onCreateRole: (nombre: string) => Promise<void>
  onUpdateRole: (id_rol: number, nombre: string) => Promise<void>
  onUpdatePermissions: (roleId: number, permissionIds: number[]) => Promise<void>
  loading: boolean
}

export function RolesManager({ roles, allPermisos, onCreateRole, onUpdateRole, onUpdatePermissions, loading }: RolesManagerProps) {
  const [newRoleName, setNewRoleName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [savingPerms, setSavingPerms] = useState<number | null>(null)

  const handleCreate = async () => {
    if (!newRoleName.trim() || newRoleName.trim().length < 3) return
    setCreating(true)
    await onCreateRole(newRoleName.trim())
    setNewRoleName('')
    setCreating(false)
  }

  const handleSaveEdit = async (id_rol: number) => {
    if (!editName.trim()) return
    setSavingRole(true)
    await onUpdateRole(id_rol, editName.trim())
    setEditingId(null)
    setSavingRole(false)
  }

  const handlePermissionToggle = async (roleId: number, permisoId: number, currentPermisos: PermisoDB[]) => {
    setSavingPerms(roleId)
    const currentIds = currentPermisos.map(p => p.id_permiso)
    const newIds = currentIds.includes(permisoId)
      ? currentIds.filter(id => id !== permisoId)
      : [...currentIds, permisoId]
    await onUpdatePermissions(roleId, newIds)
    setSavingPerms(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Crear nuevo rol */}
      <div style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Crear nuevo rol
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Los nombres de roles se guardan en mayúsculas automáticamente.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Nombre del rol (ej: MODERADOR)"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 12, fontSize: 14,
              border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newRoleName.trim() || newRoleName.trim().length < 3}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none',
              backgroundColor: 'var(--accent)', color: 'white',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: creating || !newRoleName.trim() ? 0.6 : 1,
            }}
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Crear
          </button>
        </div>
      </div>

      {/* Lista de roles con permisos */}
      <div style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Roles y Permisos
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Activa o desactiva permisos para cada rol. Los cambios se guardan automáticamente.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {roles.map(rol => {
            const isEditing = editingId === rol.id_rol
            const rolPermisoIds = (rol.permisos || []).map(p => p.id_permiso)

            return (
              <div key={rol.id_rol} style={{
                border: '1px solid var(--border)', borderRadius: 16,
                overflow: 'hidden',
              }}>
                {/* Rol header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={16} style={{ color: 'var(--accent)' }} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(rol.id_rol)}
                        autoFocus
                        style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                          border: '1px solid var(--accent)', backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)', outline: 'none',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {rol.nombre}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      backgroundColor: 'rgba(139, 94, 60, 0.1)', color: 'var(--accent)',
                    }}>
                      {rolPermisoIds.length} permiso{rolPermisoIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(rol.id_rol)} disabled={savingRole} style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex' }}>
                          {savingRole ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex' }}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingId(rol.id_rol); setEditName(rol.nombre) }}
                        style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--text-muted)', display: 'flex' }}
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permisos grid */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                    {allPermisos.map(permiso => {
                      const isChecked = rolPermisoIds.includes(permiso.id_permiso)
                      const isSaving = savingPerms === rol.id_rol

                      return (
                        <button
                          key={permiso.id_permiso}
                          onClick={() => handlePermissionToggle(rol.id_rol, permiso.id_permiso, rol.permisos || [])}
                          disabled={isSaving}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 12,
                            border: `1px solid ${isChecked ? 'var(--accent)' : 'var(--border)'}`,
                            backgroundColor: isChecked ? 'rgba(139, 94, 60, 0.06)' : 'transparent',
                            cursor: isSaving ? 'wait' : 'pointer',
                            transition: 'all 0.15s', textAlign: 'left',
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                            border: isChecked ? 'none' : '1.5px solid var(--border)',
                            backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}>
                            {isChecked && <Check size={12} color="white" strokeWidth={3} />}
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                              {permiso.nombre.replace(/_/g, ' ')}
                            </p>
                            {permiso.descripcion && (
                              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.3 }}>
                                {permiso.descripcion}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
