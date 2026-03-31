import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  )
}
