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

export async function fetchAgendaData(start: string, end: string) {
  const clinicId = await getClinicId()
  if (!clinicId) return { appointments: [], professionals: [] }

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
      .gte('start_time', start)
      .lte('start_time', end)
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

export async function fetchInitialData() {
  const clinicId = await getClinicId()
  if (!clinicId) return { professionals: [], procedures: [], leads: [] }

  const [{ data: professionals }, { data: procedures }, { data: leads }] = await Promise.all([
    supabaseAdmin.from('professionals').select('id, name').eq('clinic_id', clinicId).eq('is_active', true),
    supabaseAdmin.from('procedures').select('id, name, duration_minutes').eq('clinic_id', clinicId),
    supabaseAdmin.from('leads').select('id, name, phone').eq('clinic_id', clinicId)
  ])

  return { professionals: professionals ?? [], procedures: procedures ?? [], leads: leads ?? [] }
}

export async function createAppointment(data: any) {
  const clinicId = await getClinicId()
  if (!clinicId) throw new Error("Clinic not found")

  const { error } = await supabaseAdmin.from('appointments').insert([{
    clinic_id: clinicId,
    lead_id: data.lead_id,
    professional_id: data.professional_id,
    procedure_id: data.procedure_id,
    start_time: data.start_time,
    end_time: data.end_time,
    status: 'pending'
  }])

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { error } = await supabaseAdmin.from('appointments').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function deleteAppointment(id: string) {
  const { error } = await supabaseAdmin.from('appointments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
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
