'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Mic, MessageCircle, Play, Trash2 } from 'lucide-react'
import { Database } from '@/types/supabase'

type Voicemail = Database['public']['Tables']['voicemails']['Row']

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [voicemails, setVoicemails] = useState<Voicemail[]>([])
  const [recognition, setRecognition] = useState<any>(null)
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
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([])

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
      setAudioChunks([])
      setIsRecording(true)
    } catch (err) {
      console.error('Microphone access denied', err)
    }
  }

  const stopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)

    if (audioBlob) {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voicemail.webm')
      formData.append('transcription', transcription)
      formData.append('user_id', user!.id)
      formData.append('sender', prompt('Nom de l\'expéditeur (optionnel):') || 'Inconnu')

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
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/login')
  }

  if (!user) return <div>Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Messagerie Vocale
          </h1>
          <p className="text-gray-600">Bonjour, {user.email}</p>
        </div>
        <Button onClick={logout} variant="outline">Déconnexion</Button>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Recording Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Mic className="w-8 h-8 text-indigo-600" />
            Nouveau message
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <p className="text-3xl font-semibold text-gray-900 mb-4">{transcription || 'Cliquez pour parler...'}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={startRecording} disabled={isRecording} size="lg">
                  <Mic className="w-5 h-5" />
                  Démarrer
                </Button>
                <Button onClick={stopRecording} disabled={!isRecording} variant="destructive" size="lg">
                  <Play className="w-5 h-5" />
                  Envoyer
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Utilise la reconnaissance vocale du navigateur (démo). Production: OpenAI Whisper.
            </p>
          </div>
        </div>

        {/* Inbox */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
            Boîte de réception ({voicemails.length})
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {voicemails.map((vm) => (
              <div key={vm.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                <audio controls src={vm.audio_url} className="flex-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{vm.sender || 'Inconnu'}</p>
                  <p className="text-sm line-clamp-2 text-gray-600">{vm.transcription}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteVoicemail(vm.id!)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {voicemails.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun message. Enregistrez-en un !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

