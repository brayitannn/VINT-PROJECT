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
  console.log('--- Checking default schema (public) ---')
  
  // Try to create a dummy prenda in 'prendas' table (public)
  const { data, error } = await supabase
    .from('prendas')
    .insert([{ 
      titulo: 'Test Prenda', 
      id_usuario: '00000000-0000-0000-0000-000000000000', // Dummy UUID 
      precio: 1000,
      talla: 'M',
      color: 'Test',
      genero: 'Unisex',
      condicion: 'Nuevo',
      id_categoria: 1,
      id_marca: 1
    }])
    .select()

  if (error) {
    console.log('Error inserting into prendas (public):', error.message, error.code)
  } else {
    console.log('Success inserting into prendas (public):', data)
  }

  // Try 'products' table (public)
  const { data: pData, error: pError } = await supabase
    .from('products')
    .insert([{ name: 'Test Product', price: 1000 }])
    .select()

  if (pError) {
    console.log('Error inserting into products (public):', pError.message, pError.code)
  } else {
    console.log('Success inserting into products (public):', pData)
  }
}

check()
