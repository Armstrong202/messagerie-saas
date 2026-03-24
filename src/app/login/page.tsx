'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/auth-form'

export default function Login() {
  const [user, setUser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(!!session)
      if (session) router.push('/dashboard')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(!!session)
      if (session) router.push('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (user) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">Gérez vos messages vocaux</p>
        </div>
        <AuthForm type="login" onSuccess={() => router.push('/dashboard')} />
        <p className="text-center text-sm text-gray-600">
          Pas de compte ? <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">S\'inscrire</a>
        </p>
      </div>
    </div>
  )
}

