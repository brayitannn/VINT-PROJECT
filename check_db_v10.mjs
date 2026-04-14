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
  const rpcs = ['get_catalogo_publico', 'publicar_prenda', 'sp_publicar_prenda', 'crear_prenda', 'insertar_prenda']
  
  for (const rpc of rpcs) {
    console.log(`Checking RPC ${rpc}...`)
    // We call with dummy data to see if it exists (it will fail with 'invalid arguments' if it exists but args don't match, or 'not found')
    const { error } = await supabase.rpc(rpc, {})
    if (error) {
      if (error.code === 'PGRST202') {
        console.log(`  - RPC ${rpc} NOT FOUND`)
      } else {
        console.log(`  - RPC ${rpc} EXISTS (returned ${error.code}: ${error.message})`)
      }
    } else {
      console.log(`  - RPC ${rpc} EXISTS and returned success (unexpected)`)
    }
  }
}

check()
