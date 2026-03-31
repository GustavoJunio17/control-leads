'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getClinicId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()
  return clinicUser?.clinic_id ?? null
}

export async function fetchAgendaData(dateStr: string) {
  const clinicId = await getClinicId()
  if (!clinicId) return { appointments: [], professionals: [] }

  const start = new Date(dateStr)
  start.setHours(0, 0, 0, 0)
  const end = new Date(dateStr)
  end.setHours(23, 59, 59, 999)

  const [{ data: appointments }, { data: professionals }] = await Promise.all([
    supabaseAdmin
      .from('appointments')
      .select(`
        id, status, start_time, end_time,
        leads ( name, phone ),
        professionals ( id, name, role ),
        procedures ( name )
      `)
      .eq('clinic_id', clinicId)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      .order('start_time'),

    supabaseAdmin
      .from('professionals')
      .select('id, name, role')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('name'),
  ])

  return { appointments: appointments ?? [], professionals: professionals ?? [] }
}

export async function fetchMonthAppointmentDays(year: number, month: number) {
  const clinicId = await getClinicId()
  if (!clinicId) return []

  const start = new Date(year, month, 1).toISOString()
  const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  const { data } = await supabaseAdmin
    .from('appointments')
    .select('start_time')
    .eq('clinic_id', clinicId)
    .gte('start_time', start)
    .lte('start_time', end)

  const days = new Set(data?.map(a => new Date(a.start_time).getDate()))
  return Array.from(days)
}
