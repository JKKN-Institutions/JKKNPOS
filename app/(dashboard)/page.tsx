"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// This page redirects to the dashboard
export default function DashboardRootPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return null
}
