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
  // Since we can't easily query information_schema via RPC without permissions, 
  // let's try a few more common names or check where 'v_catalogo_publico' comes from.
  const tablesToTry = ['products', 'prendas', 'items', 'catalogo', 'articulos', 'users', 'profiles', 'vendedores']
  
  for (const t of tablesToTry) {
    const { error } = await supabase.from(t).select('count', { count: 'exact', head: true })
    if (!error) {
      console.log(`Found table: ${t}`)
    } else if (error.code !== 'PGRST116' && error.code !== '42P01') {
      // PGRST116 is usually 'not found' in some contexts, 42P01 is standard Postgres 'undefined_table'
      // If we get a different error, the table might exist but we have no access
      // console.log(`Table ${t} error: ${error.code} - ${error.message}`)
    }
  }

  // Also try to get the views if possible (though .from() works for views too)
  const { data: vData, error: vError } = await supabase.from('v_catalogo_publico').select('*').limit(1)
  if (!vError) {
    console.log('v_catalogo_publico exists. Sample keys:', Object.keys(vData[0] || {}))
  } else {
    console.log('v_catalogo_publico error:', vError.message)
  }
}

check()
