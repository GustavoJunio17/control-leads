import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis de ambiente (SUPABASE_URL ou SERVICE_ROLE_KEY).");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log("Limpando ambiente de Testes (Mock) para iniciar a Produção...");
  await supabaseAdmin.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('whatsapp_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Database resetada com sucesso! Sem dados faker agora.");
}

clean();
