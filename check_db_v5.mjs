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
  const { data, error } = await supabase.from('products').select('*').limit(1)
  if (error) {
    console.log('Error products select *:', error.message)
    // Try 'prendas'
    const { data: pData, error: pError } = await supabase.from('prendas').select('*').limit(1)
    if (pError) console.log('Error prendas select *:', pError.message)
    else console.log('prendas columns:', Object.keys(pData[0] || {}))
  } else {
    console.log('products columns:', Object.keys(data[0] || {}))
  }
}

check()
