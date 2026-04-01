'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function ensureSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminCheck } = await supabaseAdmin
    .from('clinic_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .single()

  if (!adminCheck) throw new Error('Only Super Admins can perform this action')
  return user
}

export async function createClinic(formData: FormData) {
  await ensureSuperAdmin()
  
  const name = formData.get('name') as string
  const document = formData.get('document') as string
  const phone = formData.get('phone') as string
  const planId = formData.get('plan_id') as string || null

  const { data: clinic, error } = await supabaseAdmin
    .from('clinics')
    .insert([{ name, document, phone, plan_id: planId }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/saas/clinics')
  return clinic
}

export async function updateClinic(formData: FormData) {
  await ensureSuperAdmin()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const document = formData.get('document') as string
  const phone = formData.get('phone') as string
  const planId = formData.get('plan_id') as string || null
  const active = formData.get('active') === 'on'

  const { data, error } = await supabaseAdmin
    .from('clinics')
    .update({ 
      name, 
      document, 
      phone, 
      plan_id: planId,
      active 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/saas/clinics')
  return data
}

export async function linkUserToClinic(formData: FormData) {
  await ensureSuperAdmin()

  const userId = formData.get('user_id') as string
  const clinicId = formData.get('clinic_id') as string
  const role = formData.get('role') as string || 'admin'

  const { error } = await supabaseAdmin
    .from('clinic_users')
    .upsert([{ 
      user_id: userId, 
      clinic_id: clinicId, 
      role 
    }])

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function createAndLinkUser(formData: FormData) {
  await ensureSuperAdmin()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const clinicId = formData.get('clinic_id') as string
  const role = formData.get('role') as string || 'user'

  // 2. Create user in Auth using service role
  const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) throw new Error(`Auth Error: ${authError.message}`)

  // 3. Link to clinic
  const { error: linkError } = await supabaseAdmin
    .from('clinic_users')
    .insert([{ 
      user_id: newUser.user.id, 
      clinic_id: clinicId, 
      role 
    }])

  if (linkError) {
    // Attempt to cleanup user if linking fails
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
    throw new Error(`Link Error: ${linkError.message}`)
  }

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function inviteUser(formData: FormData) {
  await ensureSuperAdmin()

  const email = formData.get('email') as string
  const clinicId = formData.get('clinic_id') as string
  const role = formData.get('role') as string || 'user'

  // 2. Send Invitation
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    data: {
      initial_clinic_role: role,
      initial_clinic_id: clinicId
    }
  })

  if (inviteError) throw new Error(`Invite Error: ${inviteError.message}`)

  // 3. Pre-link to clinic (so they have access immediately upon signup)
  const { error: linkError } = await supabaseAdmin
    .from('clinic_users')
    .insert([{ 
      user_id: inviteData.user.id, 
      clinic_id: clinicId, 
      role 
    }])

  if (linkError) throw new Error(`Invite Link Error: ${linkError.message}`)

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function unlinkUser(associationId: string) {
  await ensureSuperAdmin()

  const { error } = await supabaseAdmin
    .from('clinic_users')
    .delete()
    .eq('id', associationId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function updateUserRole(associationId: string, role: string) {
  await ensureSuperAdmin()

  const { error } = await supabaseAdmin
    .from('clinic_users')
    .update({ role })
    .eq('id', associationId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function updateUserAssociation(associationId: string, clinicId: string | null, role: string) {
  await ensureSuperAdmin()

  const { error } = await supabaseAdmin
    .from('clinic_users')
    .update({ 
      clinic_id: clinicId,
      role 
    })
    .eq('id', associationId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function updateUserDetails(userId: string, email: string) {
  await ensureSuperAdmin()

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: email
  })

  if (error) throw new Error(`Auth Update Error: ${error.message}`)

  revalidatePath('/dashboard/saas/users')
  return { success: true }
}

export async function createPlan(formData: FormData) {
  await ensureSuperAdmin()

  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const maxUsers = parseInt(formData.get('max_users') as string)
  const maxLeads = parseInt(formData.get('max_leads') as string)

  const { data, error } = await supabaseAdmin
    .from('plans')
    .insert([{ name, price, max_users: maxUsers, max_leads: maxLeads }])
    .select()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/saas/plans')
  return data
}
