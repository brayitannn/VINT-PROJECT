'use client'

import { createClient } from '@/lib/supabase/client'

const TABLE = 'favoritos'

export interface FavoritoRow {
  id: string
  id_usuario: string
  id_prenda: string
  created_at: string
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getFavoritos(): Promise<string[]> {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from(TABLE)
    .select('id_prenda')
    .eq('id_usuario', userId)

  if (error) {
    console.error('[favoritos] Error al obtener:', error.message)
    return []
  }
  return (data || []).map((row: { id_prenda: string }) => row.id_prenda)
}

export async function addFavorito(id_prenda: string): Promise<boolean> {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) {
    console.warn('[favoritos] No hay usuario autenticado')
    return false
  }

  const { error } = await supabase
    .from(TABLE)
    .insert({ id_usuario: userId, id_prenda })

  if (error) {
    console.error('[favoritos] Error al agregar:', error.message)
    return false
  }
  return true
}

export async function removeFavorito(id_prenda: string): Promise<boolean> {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return false

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id_usuario', userId)
    .eq('id_prenda', id_prenda)

  if (error) {
    console.error('[favoritos] Error al eliminar:', error.message)
    return false
  }
  return true
}
