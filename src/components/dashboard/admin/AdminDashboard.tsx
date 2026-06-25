'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Shield, Key, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { UsersTable } from './UsersTable'
import { RolesManager } from './RolesManager'
import type { UsuarioAdmin, RolDB, PermisoDB } from '@/types/auth'
import Loader from '@/components/ui/Loader'

type Tab = 'usuarios' | 'roles' | 'permisos'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'roles', label: 'Roles y Permisos', icon: Shield },
]

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('usuarios')

  // Users state
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState('')
  const [usersRoleFilter, setUsersRoleFilter] = useState('')
  const [usersStatusFilter, setUsersStatusFilter] = useState('')
  const [usersLoading, setUsersLoading] = useState(true)

  // Roles state
  const [roles, setRoles] = useState<RolDB[]>([])
  const [allPermisos, setAllPermisos] = useState<PermisoDB[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch Users ──
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams()
      if (usersSearch) params.set('search', usersSearch)
      if (usersRoleFilter) params.set('role', usersRoleFilter)
      if (usersStatusFilter) params.set('status', usersStatusFilter)
      params.set('page', usersPage.toString())
      params.set('limit', '15')

      const res = await fetch(`/api/admin/users?${params}`)
      const json = await res.json()

      if (json.success) {
        setUsuarios(json.data.usuarios)
        setTotalUsers(json.data.total)
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al cargar usuarios.', 'error')
    } finally {
      setUsersLoading(false)
    }
  }, [usersSearch, usersRoleFilter, usersStatusFilter, usersPage])

  // ── Fetch Roles ──
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true)
    try {
      const [rolesRes, permisosRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions'),
      ])
      const [rolesJson, permisosJson] = await Promise.all([rolesRes.json(), permisosRes.json()])

      if (rolesJson.success) setRoles(rolesJson.data.roles)
      if (permisosJson.success) setAllPermisos(permisosJson.data.permisos)
    } catch {
      showToast('Error al cargar roles.', 'error')
    } finally {
      setRolesLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchRoles() }, [fetchRoles])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setUsersPage(1); fetchUsers() }, 400)
    return () => clearTimeout(timer)
  }, [usersSearch])

  // ── Actions ──
  const handleToggleStatus = async (userId: number, activo: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activo }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(json.message)
        fetchUsers()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al cambiar estado.', 'error')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-confirm-delete': 'true' },
      })
      const json = await res.json()
      if (json.success) {
        showToast(json.message)
        fetchUsers()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al eliminar usuario.', 'error')
    }
  }

  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      const res = await fetch('/api/admin/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(json.message)
        fetchUsers()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al asignar rol.', 'error')
    }
  }

  const handleCreateRole = async (nombre: string) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(json.message)
        fetchRoles()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al crear rol.', 'error')
    }
  }

  const handleUpdateRole = async (id_rol: number, nombre: string) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rol, nombre }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(json.message)
        fetchRoles()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al actualizar rol.', 'error')
    }
  }

  const handleUpdatePermissions = async (roleId: number, permissionIds: number[]) => {
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, permissionIds }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(json.message)
        fetchRoles()
      } else {
        showToast(json.message, 'error')
      }
    } catch {
      showToast('Error al actualizar permisos.', 'error')
    }
  }

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
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Debes iniciar sesión como administrador</p>
        <a href="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Ir al Login →</a>
      </div>
    )
  }

  return (
    <>
      <Loader show={usersLoading || rolesLoading} />
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
        .admin-tab:hover { background-color: var(--bg-secondary) !important; }
      `}</style>

      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '28px 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: 'var(--text-muted)', marginBottom: 16, transition: 'color 0.2s',
              }}
            >
              <ArrowLeft size={16} />
              Volver al Dashboard
            </Link>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Panel de Administración
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Gestiona usuarios, roles y permisos de la plataforma
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', gap: 4 }}>
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className="admin-tab"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 20px', border: 'none', cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 2rem' }}>
          {activeTab === 'usuarios' && (
            <UsersTable
              usuarios={usuarios}
              roles={roles}
              total={totalUsers}
              page={usersPage}
              limit={15}
              search={usersSearch}
              roleFilter={usersRoleFilter}
              statusFilter={usersStatusFilter}
              onSearchChange={setUsersSearch}
              onRoleFilterChange={(v) => { setUsersRoleFilter(v); setUsersPage(1) }}
              onStatusFilterChange={(v) => { setUsersStatusFilter(v); setUsersPage(1) }}
              onPageChange={setUsersPage}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={handleDeleteUser}
              onAssignRole={handleAssignRole}
              loading={usersLoading}
            />
          )}

          {activeTab === 'roles' && (
            <RolesManager
              roles={roles}
              allPermisos={allPermisos}
              onCreateRole={handleCreateRole}
              onUpdateRole={handleUpdateRole}
              onUpdatePermissions={handleUpdatePermissions}
              loading={rolesLoading}
            />
          )}
        </div>
      </main>
    </>
  )
}
