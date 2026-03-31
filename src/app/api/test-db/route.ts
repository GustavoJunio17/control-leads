
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { count: clinics } = await supabase.from('clinics').select('*', { count: 'exact', head: true })
    const { count: users } = await supabase.from('clinic_users').select('*', { count: 'exact', head: true })
    const { count: leads } = await supabase.from('leads').select('*', { count: 'exact', head: true })
    const { count: convs } = await supabase.from('conversations').select('*', { count: 'exact', head: true })
    const { count: msgs } = await supabase.from('messages').select('*', { count: 'exact', head: true })
    const { data: qrs } = await supabase.from('whatsapp_sessions').select('*')

    return NextResponse.json({
      clinics,
      users,
      leads,
      convs,
      msgs,
      sessions: qrs
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
