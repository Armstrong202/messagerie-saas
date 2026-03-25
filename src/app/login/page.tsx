'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/auth-form'
import { Mic, Shield, Zap, Users } from 'lucide-react'

export default function Login() {
  const [user, setUser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!supabase) return
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,119,198,0.3))] filter blur(100px)" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_80%,rgba(120,119,198,0.2),rgba(255,119,198,0.2))] filter blur(100px)" />
      </div>
      
      <div className="relative z-10 w-full max-w-2xl lg:max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hero Left */}
          <div className="glass p-12 rounded-3xl lg:rounded-r-none shadow-2xl">
            <div className="text-center mb-12">
              <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl btn-glow animate-float">
                <Mic className="w-14 h-14 text-white" />
              </div>
              <h1 className="text-5xl font-black gradient-text mb-6 leading-tight">
                Messagerie Vocale IA
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
                Transcrivez et gérez vos messages avec l'intelligence artificielle de pointe
              </p>
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  <span className="text-white font-semibold text-sm">Sécurisé</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                  <Zap className="w-6 h-6 text-amber-400" />
                  <span className="text-white font-semibold text-sm">Instantané</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                  <Users className="w-6 h-6 text-blue-400" />
                  <span className="text-white font-semibold text-sm">Cloud</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10">
                  <Zap className="w-6 h-6 text-indigo-400" />
                  <span className="text-white font-semibold text-sm">IA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Right */}
          <div className="glass p-10 lg:p-12 rounded-3xl lg:rounded-l-none shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
                Accès Sécurisé
              </h2>
              <p className="text-lg text-white/80">Connectez-vous pour commencer</p>
            </div>
            <AuthForm type="login" onSuccess={() => router.push('/dashboard')} />
            <p className="text-center text-sm text-white/60 mt-8">
              Nouveau ?&nbsp;
              <a href="/signup" className="font-bold text-indigo-300 hover:text-indigo-200 transition-all duration-200 underline underline-offset-2">
                Créez un compte
              </a>
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-xs text-white/40">
            © 2024 Voicemail SaaS. Tous droits réservés. | Production ready
          </p>
        </div>
      </div>
    </div>
  )
}

