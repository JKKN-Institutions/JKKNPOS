"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Business } from '@/types'

export function useAuth() {
  const router = useRouter()
  const supabase = getClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profileData) {
            const typedProfile = profileData as Profile
            setProfile(typedProfile)

            // Fetch business
            const { data: businessData } = await supabase
              .from('businesses')
              .select('*')
              .eq('id', typedProfile.business_id)
              .single()

            setBusiness(businessData as Business | null)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setBusiness(null)
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
        fetchUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    // Create business
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: businessName,
        currency: 'INR',
        tax_rate: 18,
      } as never)
      .select()
      .single()

    if (businessError) throw businessError
    const typedBusiness = businessData as { id: string }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        business_id: typedBusiness.id,
        full_name: fullName,
        role: 'OWNER',
        is_active: true,
      } as never)

    if (profileError) throw profileError

    return authData
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    profile,
    business,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}
