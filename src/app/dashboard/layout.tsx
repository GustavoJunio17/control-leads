import { Sidebar } from "@/components/sidebar"
import { getUserRole } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()

  return (
    <div className="flex h-screen bg-white">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  )
}
