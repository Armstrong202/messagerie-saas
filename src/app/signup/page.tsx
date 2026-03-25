'use client'

import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth-form'

export default function Signup() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-emerald-200/30 to-transparent" />
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center float">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Commencez gratuitement</h2>
            <p className="text-gray-600 dark:text-gray-300">Créez votre compte messagerie IA</p>
          </div>
          <AuthForm type="signup" onSuccess={() => router.push('/dashboard')} />
          {/* Bouton supprimé comme demandé, form active */}
        </div>
      </div>
    </div>
  )
}

