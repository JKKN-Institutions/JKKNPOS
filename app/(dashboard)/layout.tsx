"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { getClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useSidebarStore } from "@/lib/store/sidebar-store"
import { cn } from "@/lib/utils"
import type { Profile, Business } from "@/types"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = getClient()
  const [user, setUser] = useState<Profile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const { collapsed } = useSidebarStore()

  useEffect(() => {
    // TODO: Remove mock data for production - bypassing auth for testing
    const mockUser: Profile = {
      id: "mock-user-id",
      business_id: "mock-business-id",
      full_name: "Test User",
      phone: null,
      role: "OWNER",
      permissions: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const mockBusiness: Business = {
      id: "mock-business-id",
      name: "JKKN Dental Store",
      address: "123 Main St",
      phone: "9876543210",
      email: "jkkn@dental.com",
      tax_rate: 18,
      currency: "INR",
      settings: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setUser(mockUser)
    setBusiness(mockBusiness)
    setLoading(false)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Sidebar onSignOut={handleSignOut} />
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "lg:pl-20" : "lg:pl-72"
      )}>
        <Header
          user={user ? { full_name: user.full_name, role: user.role } : undefined}
          businessName={business?.name}
          onSignOut={handleSignOut}
        />
        <main className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
