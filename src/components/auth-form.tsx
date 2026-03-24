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
const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    if (!supabase) return
    setLoading(true)
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword(data)
      : await supabase.auth.signUp(data)
    setLoading(false)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Email</label>
        <input {...register('email')} className="w-full p-2 border rounded" />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <label>Mot de passe</label>
        <input type="password" {...register('password')} className="w-full p-2 border rounded" />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Chargement...' : type === 'login' ? 'Se connecter' : 'S\'inscrire'}
      </Button>
    </form>
  )
}

