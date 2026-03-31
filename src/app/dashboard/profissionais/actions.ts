'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getClinicId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin
    .from('clinic_users').select('clinic_id').eq('user_id', user.id).single()
  return data?.clinic_id ?? null
}

export async function getProfessionals() {
  const clinicId = await getClinicId()
  if (!clinicId) return []

  const { data } = await supabaseAdmin
    .from('professionals')
    .select(`*, professional_schedules(*)`)
    .eq('clinic_id', clinicId)
    .order('name')

  return data ?? []
}

export async function saveProfessional(formData: FormData) {
  const clinicId = await getClinicId()
  if (!clinicId) throw new Error('Não autorizado')

  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const role = formData.get('role') as string

  if (id) {
    await supabaseAdmin.from('professionals').update({ name, role }).eq('id', id)
  } else {
    await supabaseAdmin.from('professionals').insert([{ clinic_id: clinicId, name, role, is_active: true }])
  }

  revalidatePath('/dashboard/profissionais')
  revalidatePath('/dashboard/agenda')
}

export async function deleteProfessional(id: string) {
  await supabaseAdmin.from('professionals').delete().eq('id', id)
  revalidatePath('/dashboard/profissionais')
  revalidatePath('/dashboard/agenda')
}

export async function saveSchedules(professionalId: string, schedules: {
  day_of_week: number
  start_time: string
  end_time: string
  active: boolean
}[]) {
  // Upsert todos os dias de uma vez
  const rows = schedules.map(s => ({
    professional_id: professionalId,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
    active: s.active
  }))

  await supabaseAdmin
    .from('professional_schedules')
    .upsert(rows, { onConflict: 'professional_id,day_of_week' })

  revalidatePath('/dashboard/profissionais')
  revalidatePath('/dashboard/agenda')
  return { success: true }
}
