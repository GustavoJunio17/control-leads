import { getProfessionals } from './actions'
import ProfissionaisClient from './profissionais-client'

export default async function ProfissionaisPage() {
  const professionals = await getProfessionals()
  return <ProfissionaisClient professionals={professionals} />
}
