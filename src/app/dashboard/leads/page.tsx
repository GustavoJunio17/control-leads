import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import LeadsKanban from "./kanban"

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

export default async function LeadsCRMPage() {
  const clinicId = await getClinicId()
  if (!clinicId) return <p className="text-slate-500">Clínica não encontrada.</p>

  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select(`
      id,
      name,
      phone,
      funnel_stage,
      created_at,
      conversations (
        status,
        last_message_at
      )
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  return <LeadsKanban leads={leads ?? []} />
}
