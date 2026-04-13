import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nthcmtvncuevvczhlrhk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aGNtdHZuY3VldnZjemhscmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk5MjEsImV4cCI6MjA5MDEyNTkyMX0.svgyWgSBCg0SPqdLmgdngucAuEAAt6kozXMVsNY2xsk'
);

async function run() {
  const { data, error } = await supabase.rpc('get_tables');
  
  if (error) {
     // fallback if rpc is not there
     const fallback = await fetch('https://nthcmtvncuevvczhlrhk.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aGNtdHZuY3VldnZjemhscmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk5MjEsImV4cCI6MjA5MDEyNTkyMX0.svgyWgSBCg0SPqdLmgdngucAuEAAt6kozXMVsNY2xsk', {
       headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aGNtdHZuY3VldnZjemhscmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk5MjEsImV4cCI6MjA5MDEyNTkyMX0.svgyWgSBCg0SPqdLmgdngucAuEAAt6kozXMVsNY2xsk` }
     });
     console.log(await fallback.json());
  } else {
    console.log(data);
  }
}

run();
