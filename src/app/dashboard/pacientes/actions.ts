'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePatientData(leadId: string, data: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('leads')
    .update({
      email: data.email,
      cpf: data.cpf,
      birth_date: data.birth_date,
      address: data.address,
      city: data.city,
      state: data.state,
      cep: data.cep
    })
    .eq('id', leadId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/pacientes')
  return { success: true }
}
