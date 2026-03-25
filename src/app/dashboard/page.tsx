'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Mic, MessageCircle, Play, Trash2, User, Settings } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Voicemail = Database['public']['Tables']['voicemails']['Row']

export default function Dashboard() {
  const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
  const [voicemails, setVoicemails] = useState<Voicemail[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const fetchVoicemails = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('voicemails')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setVoicemails(data || [])
  }, [supabase])

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      fetchVoicemails(session.user.id)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login')
    })

    return () => subscription.unsubscribe()
  }, [fetchVoicemails, router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <Button onClick={handleLogout}>Logout</Button>
      {/* Simplified - add full UI after dev works */}
      <ul>
        {voicemails.map((v) => (
          <li key={v.id}>{v.transcription}</li>
        ))}
      </ul>
    </div>
  )
}

