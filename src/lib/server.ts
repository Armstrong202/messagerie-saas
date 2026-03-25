import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import env from './env'
import type { NextRequest } from 'next/server'

export function createMiddlewareClient(request: NextRequest) {
  return createSupabaseServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          try {
            request.cookies.set({
              name,
              value,
              ...options,
            })
          } catch {
            // Ignore
          }
        },
        remove(name: string, options?: any) {
          try {
            request.cookies.remove({
              name,
              ...options,
            })
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )
}

