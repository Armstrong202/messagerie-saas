import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/server";

const transcribeSchema = z.object({
  voicemail_id: z.string().uuid(),
  audio_url: z.string().url(),
});

// ─── POST /api/transcribe ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user;

    const body = await request.json();
    const parsed = transcribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 422 });
    }

    const { voicemail_id, audio_url } = parsed.data;

    // Verify ownership
    const { data: voicemail } = await supabase
      .from("voicemails")
      .select("id, user_id, transcription_status")
      .eq("id", voicemail_id)
      .eq("user_id", user.id)
      .single();

    if (!voicemail) {
      return NextResponse.json({ error: "Voicemail not found" }, { status: 404 });
    }

    if (voicemail.transcription_status === "done") {
      return NextResponse.json({ error: "Already transcribed" }, { status: 409 });
    }

    // Mark as processing
    await supabase
      .from("voicemails")
      .update({ transcription_status: "processing" })
      .eq("id", voicemail_id);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          send({ status: "started", voicemail_id });

          const audioResponse = await fetch(audio_url);
          if (!audioResponse.ok) throw new Error("Failed to fetch audio");

          const audioBuffer = await audioResponse.arrayBuffer();
          const audioBlob = new Blob([audioBuffer]);

          send({ status: "transcribing" });

          if (!process.env.OPENAI_API_KEY) {
            await new Promise(r => setTimeout(r, 1000));
            const mockTranscript = "Bonjour, transcription mock IA Whisper FR.";
            await supabase
              .from("voicemails")
              .update({ transcription: mockTranscript, transcription_status: "done" })
              .eq("id", voicemail_id);
            send({ status: "done", transcript: mockTranscript });
            controller.close();
            return;
          }

          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          formData.append("model", "whisper-1");
          formData.append("language", "fr");

          const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: formData,
          });

          if (!openAiResponse.ok) throw new Error("OpenAI failed");

          const result = await openAiResponse.json();
          const transcript = result.text;

          await supabase
            .from("voicemails")
            .update({ transcription: transcript, transcription_status: "done" })
            .eq("id", voicemail_id);

          send({ status: "done", transcript });
          controller.close();
        } catch (error) {
          await supabase
            .from("voicemails")
            .update({ transcription_status: "failed" })
            .eq("id", voicemail_id);
          send({ status: "error", error: (error as Error).message });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

