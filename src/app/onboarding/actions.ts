'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cria cliente admin burlando RLS para o Setup da infraestrutura do Tenant
  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const name = formData.get('name') as string
  const document = formData.get('document') as string
  const phone = formData.get('phone') as string
  const aiName = formData.get('ai_name') as string

  // Create Clinic (Tenant)
  const { data: clinic, error: clinicError } = await supabaseAdmin
    .from('clinics')
    .insert([{ name, document, phone }])
    .select()
    .single()

  if (clinicError || !clinic) {
    console.error("ERRO CLINIC:", clinicError)
    redirect(`/onboarding?error=${encodeURIComponent(clinicError?.message || 'Could not create clinic profile')}`)
  }

  // Bind User to Clinic
  const { error: bindError } = await supabaseAdmin
    .from('clinic_users')
    .insert([{ clinic_id: clinic.id, user_id: user.id, role: 'admin' }])

  if (bindError) {
    console.error("ERRO BIND:", bindError)
    redirect(`/onboarding?error=${encodeURIComponent(bindError.message)}`)
  }

  // Setup Default AI Instance
  const { error: aiError } = await supabaseAdmin
    .from('ai_settings')
    .insert([{ 
      clinic_id: clinic.id, 
      assistant_name: aiName,
      base_prompt: `Você é ${aiName}, a assistente virtual da clínica ${name}. Seja sempre extremamente gentil, clara e prestativa.`
    }])

  if (aiError) {
    console.error("ERRO AI:", aiError)
    redirect(`/onboarding?error=${encodeURIComponent(aiError.message)}`)
  }

  redirect('/dashboard')
}
