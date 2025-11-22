"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { getClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useSidebarStore } from "@/lib/store/sidebar-store"
import { cn } from "@/lib/utils"
import { StoreProvider } from "@/store/store-context"
import type { Database } from "@/types/database.types"

type Profile = Database['public']['Tables']['profiles']['Row']
type Business = Database['public']['Tables']['businesses']['Row']

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
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push('/login')
          return
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileError || !profileData) {
          toast.error("Failed to load profile")
          router.push('/login')
          return
        }

        setUser(profileData as Profile)

        // Fetch business
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', profileData.business_id)
          .single()

        if (businessError) {
          toast.error("Failed to load business")
        } else {
          setBusiness(businessData as Business)
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error("An error occurred")
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        fetchUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

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
    <StoreProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <Sidebar onSignOut={handleSignOut} />
        <div className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-72"
        )}>
          <Header
            user={user ? { full_name: user.full_name || '', role: user.role || 'STAFF' } : undefined}
            businessName={business?.name || ''}
            onSignOut={handleSignOut}
          />
          <main className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </div>
    </StoreProvider>
  )
}
