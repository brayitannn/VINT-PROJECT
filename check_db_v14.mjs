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
  console.log('--- Testing sp_publicar_prenda RPC ---')
  
  const payload = {
    p_correo_vendedor: 'test@example.com', // Must be an active user's email if the SP checks it
    p_id_categoria: 1,
    p_id_marca: 9,
    p_titulo: 'Test via RPC',
    p_descripcion: 'Decsription',
    p_talla: 'M',
    p_color: 'Varios',
    p_precio: 5000,
    p_genero: 'Unisex',
    p_condicion: 'Bueno',
    p_url_imagen: null
  }

  const { data, error } = await supabase.rpc('sp_publicar_prenda', payload)
  if (error) {
    console.log('Error calling RPC:', error.message, error.code)
  } else {
    console.log('SUCCESS calling RPC:', data)
  }
}

check()
