'use server'

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

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

export async function updateLeadStage(leadId: string, stage: string) {
  const clinicId = await getClinicId()
  if (!clinicId) throw new Error("Não autorizado")

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ funnel_stage: stage })
    .eq('id', leadId)
    .eq('clinic_id', clinicId)

  if (error) throw error
  revalidatePath('/dashboard/leads')
}

export async function createLead(data: { name: string, phone: string, email?: string }) {
  const clinicId = await getClinicId()
  if (!clinicId) throw new Error("Não autorizado")

  const { error } = await supabaseAdmin
    .from('leads')
    .insert({
      clinic_id: clinicId,
      name: data.name,
      phone: data.phone.includes('@') ? data.phone : `${data.phone}@c.us`,
      email: data.email,
      funnel_stage: 'Novo',
      source: 'manual'
    })

  if (error) throw error
  revalidatePath('/dashboard/leads')
}
