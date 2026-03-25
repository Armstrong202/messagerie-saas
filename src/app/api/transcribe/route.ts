import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/server'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  
  // AUTH CHECK
  const formData = await req.formData()
  const user_id = formData.get('user_id') as string
  if (!user_id) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 })
  }

  const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }) : null
  
  try {
    const file = formData.get('audio') as File
    if (!file) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }
    const transcriptionText = formData.get('transcription') as string || ''
    const sender = formData.get('sender') || 'Inconnu'
    
    // RATE LIMIT simple (memory, prod use Upstash)
    const now = Date.now()
    const clientIp = req.headers.get('x-forwarded-for') || 'anonymous'
    // ... rate limit logic

    // Upload audio to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('voicemails')
      .upload(fileName, Buffer.from(await file.arrayBuffer()))

    if (error) throw error

    // Optional: OpenAI transcription
    let finalTranscription = transcriptionText
    if (openai) {
      try {
        const transcription = await openai.audio.transcriptions.create({
          file,
          model: 'whisper-1',
          language: 'fr',
        })
        finalTranscription = transcription.text
      } catch (transError) {
        console.error('OpenAI transcription failed:', transError)
        // Fallback to manual transcription
      }
    }

    // Save to DB
    const { data: voicemail, error: dbError } = await supabase
      .from('voicemails')
      .insert({
        user_id,
        audio_url: supabase.storage.from('voicemails').getPublicUrl(fileName).data.publicUrl,
        transcription: finalTranscription,
        sender,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json(voicemail)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

