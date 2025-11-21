import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // TODO: Re-enable auth checks for production - bypassing for testing
  return NextResponse.next({ request })
}
