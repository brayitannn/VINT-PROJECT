'use client'

import { createClient } from '@/lib/supabase/client'

const TABLE = 'favoritos'
const ID_USUARIO = 1 // Temporal hasta tener auth real (integer para coincidir con el tipo de la tabla)

export interface FavoritoRow {
  id: string
  id_usuario: string
  id_prenda: string
  created_at: string
}

export async function getFavoritos(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('id_prenda')
    .eq('id_usuario', ID_USUARIO)

  if (error) {
    console.error('[favoritos] Error al obtener:', error.message)
    return []
  }
  return (data || []).map((row: { id_prenda: string }) => row.id_prenda)
}

export async function addFavorito(id_prenda: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .insert({ id_usuario: ID_USUARIO, id_prenda })

  if (error) {
    console.error('[favoritos] Error al agregar:', error.message)
    return false
  }
  return true
}

export async function removeFavorito(id_prenda: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id_usuario', ID_USUARIO)
    .eq('id_prenda', id_prenda)

  if (error) {
    console.error('[favoritos] Error al eliminar:', error.message)
    return false
  }
  return true
}
