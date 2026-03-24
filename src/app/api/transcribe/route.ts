import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('audio') as File
    const transcriptionText = formData.get('transcription') as string

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
    const { data: voicemail } = await supabase
      .from('voicemails')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        audio_url: supabase.storage.from('voicemails').getPublicUrl(fileName).data.publicUrl,
        transcription: finalTranscription,
        sender: formData.get('sender') as string || 'Inconnu',
      })
      .select()
      .single()

    return NextResponse.json(voicemail)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

