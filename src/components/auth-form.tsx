"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

interface AuthFormProps {
  type: 'login' | 'signup'
  onSuccess: () => void
}

export default function AuthForm({ type, onSuccess }: AuthFormProps) {
const [loading, setLoading] = useState(false)
const [serverError, setServerError] = useState('')
const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    if (!supabase) {
      setServerError('Supabase not configured')
      return
    }
    setLoading(true)
    const { error, data: { user, session } } = type === 'login' 
      ? await supabase.auth.signInWithPassword(data)
      : await supabase.auth.signUp({ email: data.email, password: data.password })
    setLoading(false)
    if (error) setServerError(error.message)
    else if (type === 'signup') {
      setServerError('Check your email for confirmation link!')
      reset()
    } else onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-amber-100 border border-amber-400 text-amber-700 rounded-lg">
          {serverError}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          {...register('email')} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mot de passe</label>
        <input 
          type="password" 
          {...register('password')} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" pathLength="1" className="opacity-25"/>
              <path fill="currentColor" pathLength="1" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Chargement...
          </span>
        ) : type === 'login' ? 'Se connecter' : 'S\'inscrire'}
      </Button>
    </form>
  )
}

