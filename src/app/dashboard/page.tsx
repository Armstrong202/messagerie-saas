'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Mic, MessageCircle, Play, Trash2, User, Settings } from 'lucide-react'
import { Database } from '@/types/supabase'

type Voicemail = Database['public']['Tables']['voicemails']['Row']

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [voicemails, setVoicemails] = useState<Voicemail[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      fetchVoicemails(session.user.id)
    }

    getUser()

    let subscriptionCleanup: VoidFunction | undefined
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) router.push('/login')
      })
      subscriptionCleanup = () => subscription.unsubscribe()
    }
    return subscriptionCleanup
  }, [router])

  const fetchVoicemails = async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('voicemails')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setVoicemails(data || [])
  }

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      alert('Microphone requis')
    }
  }

  const stopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)

    if (audioBlob && user) {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voicemail.webm')
      formData.append('transcription', transcription)
      formData.append('user_id', user!.id)
      formData.append('sender', prompt('Nom expéditeur:') || 'Anonyme')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        setTranscription('')
        fetchVoicemails(user!.id)
      } else {
        const err = await response.json()
        alert('Erreur: ' + err.error)
      }
    }
  }

  const deleteVoicemail = async (id: string) => {
    if (!supabase) return
    await supabase.from('voicemails').delete().eq('id', id)
    fetchVoicemails(user!.id)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass p-12 rounded-3xl text-center animate-pulse">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-indigo-400 to-blue-400 rounded-2xl flex items-center justify-center mb-6">
          <Mic className="w-12 h-12 text-white" />
        </div>
        <p className="gradient-text text-2xl font-bold mb-4">Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent)]" />
      
      <header className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 pt-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Mic className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black gradient-text drop-shadow-lg">
              Messagerie IA
            </h1>
            <p className="text-xl text-gray-600 font-medium">Bonjour, {user.email?.split('@')[0]}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-white/50">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/50">
            <Settings className="w-5 h-5" />
          </Button>
          <Button onClick={logout} className="bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-indigo-200">
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 relative z-10">
        {/* Recording Hero */}
        <div className="glass-card p-10 lg:p-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 animate-float">
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl btn-glow">
              <Mic className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black gradient-text mb-4">Nouveau Voicemail</h2>
            <p className="text-lg text-gray-600">Enregistrez instantanément</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-xl">
              <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 animate-pulse" />
                <p className="gradient-text text-2xl font-black relative z-10 drop-shadow-lg">
                  {transcription || 'Appuyez pour parler...'}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={startRecording} disabled={isRecording} size="lg" className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl btn-glow px-8 py-6 text-lg font-bold min-h-[56px]">
                  <Mic className="w-6 h-6 group-hover:scale-110 transition-transform mr-2" />
                  {isRecording ? 'Enregistrement...' : 'Démarrer'}
                </Button>
                <Button onClick={stopRecording} disabled={!isRecording} variant="destructive" size="lg" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-2xl px-8 py-6 text-lg font-bold min-h-[56px]">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 opacity-75">
              ✅ Whisper IA + stockage cloud automatique
            </p>
          </div>
        </div>

        {/* Inbox Premium */}
        <div className="glass-card p-10 lg:p-12 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black gradient-text">Inbox <span className="text-2xl font-normal text-gray-600">({voicemails.length})</span></h2>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent pr-2">
            {voicemails.map((vm) => (
              <div key={vm.id} className="group hover:scale-[1.02] transition-all duration-200 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 hover:border-indigo-200 hover:shadow-xl">
                <div className="flex gap-4 items-center">
                  <div className="flex-shrink-0">
                    <audio controls src={vm.audio_url} className="w-32 rounded-xl shadow-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-xs font-semibold text-indigo-800">
                        {vm.sender || 'Anonyme'}
                      </div>
                    </div>
                    <p className="text-sm font-medium line-clamp-2 text-gray-800 mb-2 leading-relaxed">{vm.transcription}</p>
                    <p className="text-xs text-gray-500">{new Date(vm.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-red-500/20 hover:text-red-500 p-2" onClick={() => deleteVoicemail(vm.id!)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
            {voicemails.length === 0 && (
              <div className="text-center py-20">
                <MessageCircle className="w-20 h-20 mx-auto text-gray-300 mb-6 animate-bounce" />
                <p className="text-2xl font-semibold text-gray-400 mb-2">Aucun message</p>
                <p className="text-gray-500">Enregistrez votre premier voicemail !</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 relative z-10">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            🔒 Sécurisé • ⚡ Rapide • 🤖 IA Whisper • ☁️ Cloud
          </p>
        </div>
      </div>
    </div>
  )
}

