import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user_id = session.user.id
  const now = Date.now()
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'
  
  // RATE LIMIT 5/min IP
  const rateKey = `transcribe:${clientIp}`
  const rateData: { count: number; reset: number } = (globalThis as any).rateLimits?.[rateKey] || { count: 0, reset: now + 60*1000 }
  if (now > rateData.reset) {
    rateData.count = 0
    rateData.reset = now + 60*1000
  }
  if (rateData.count >= 5) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  rateData.count++
  ;(globalThis as any).rateLimits ||= {}
  ;(globalThis as any).rateLimits[rateKey] = rateData

  const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }) : null
  
  const formData = await req.formData()
  try {
    const file = formData.get('audio') as File
    if (!file) {
      return NextResponse.json({ error: 'Audio file required' }, { status: 400 })
    }
    const transcriptionText = formData.get('transcription') as string || ''
    const sender = formData.get('sender') || 'Inconnu'
    
    // File validation
    const bytes = await file.arrayBuffer()
    const fileSize = bytes.byteLength
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }
    const audioBuffer = Buffer.from(bytes)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webm'
    if (!['webm', 'mp3', 'wav', 'm4a'].includes(fileExt)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 400 })
    }
    
    // Upload
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const { data, error: uploadError } = await supabase.storage
      .from('voicemails')
      .upload(fileName, audioBuffer, {
        contentType: file.type || `audio/${fileExt}`
      })

    if (uploadError) throw uploadError

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

