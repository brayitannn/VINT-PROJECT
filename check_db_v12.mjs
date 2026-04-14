import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('--- Checking if v_catalogo_publico is updatable (public) ---')
  
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .insert([{ 
      titulo: 'Test Prenda View', 
      precio: 1000,
      talla: 'M',
      color: 'Test',
      generos: 'Unisex', // Spelling mistake in genero maybe?
      condicion: 'Nuevo'
    }])
    .select()

  if (error) {
    console.log('Error inserting into view:', error.message, error.code)
  } else {
    console.log('SUCCESS inserting into view:', data)
  }
}

check()
