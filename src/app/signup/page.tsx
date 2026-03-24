'use client'

import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth-form'

export default function Signup() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Inscription</h2>
          <p className="mt-2 text-sm text-gray-600">Rejoignez la plateforme de messagerie vocale</p>
        </div>
        <AuthForm type="signup" onSuccess={() => router.push('/dashboard')} />
        <p className="text-center text-sm text-gray-600">
          Déjà inscrit ? <a href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">Se connecter</a>
        </p>
      </div>
    </div>
  )
}

