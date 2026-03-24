import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  try {
    const formData = await req.formData()
    const file = formData.get('audio') as File
    const transcriptionText = formData.get('transcription') as string
    const sender = formData.get('sender') || 'Inconnu'
    const user_id = formData.get('user_id') as string

    // Upload audio to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('voicemails')
      .upload(fileName, Buffer.from(await file.arrayBuffer()))

    if (error) throw error

    // Optional: OpenAI transcription
    let finalTranscription = transcriptionText
    if (process.env.OPENAI_API_KEY) {
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'fr',
      })
      finalTranscription = transcription.text
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

