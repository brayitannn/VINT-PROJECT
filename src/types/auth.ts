// Tipos compartidos para el módulo de autenticación y administración

export type UserRole = 'comprador' | 'vendedor' | 'admin'

/** Mapeo de la tabla seguridad.usuarios */
export interface UsuarioDB {
  id_usuario: number
  id_auth_supabase: string
  id_rol: number
  primer_nombre: string
  segundo_nombre: string | null
  primer_apellido: string
  segundo_apellido: string | null
  correo: string
  telefono: string | null
  fecha_registro: string
  activo: boolean
  genero: string | null
  fecha_nacimiento: string | null
  // Campo virtual del JOIN
  rol_nombre?: string
}

/** Mapeo de la tabla seguridad.roles */
export interface RolDB {
  id_rol: number
  nombre: string
  permisos?: PermisoDB[]
}

/** Mapeo de la tabla seguridad.permisos */
export interface PermisoDB {
  id_permiso: number
  nombre: string
  descripcion: string | null
}

/** Payload para cambio de contraseña */
export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

/** Payload para restablecimiento de contraseña */
export interface ResetPasswordPayload {
  newPassword: string
}

/** Respuesta genérica de las APIs */
export interface ApiResponse<T = undefined> {
  success: boolean
  message: string
  data?: T
}

/** Usuario formateado para la tabla del admin */
export interface UsuarioAdmin {
  id_usuario: number
  id_auth_supabase: string
  nombre_completo: string
  correo: string
  telefono: string | null
  rol: string
  id_rol: number
  activo: boolean
  fecha_registro: string
  genero: string | null
}

/** Payload para asignar rol */
export interface AssignRolePayload {
  userId: number
  roleId: number
}

/** Payload para permisos de un rol */
export interface RolePermissionsPayload {
  roleId: number
  permissionIds: number[]
}
