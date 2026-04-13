import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nthcmtvncuevvczhlrhk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aGNtdHZuY3VldnZjemhscmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk5MjEsImV4cCI6MjA5MDEyNTkyMX0.svgyWgSBCg0SPqdLmgdngucAuEAAt6kozXMVsNY2xsk'
);

async function run() {
  const { data, error } = await supabase.from('prendas').select('*').limit(1);
  console.log("Prendas fetch result:", error ? "Error" : "Success");
  if (error) console.error(error);
  else console.log(data);
}

run();
