import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user;
    const { data, error } = await supabase
      .from("voicemails")
      .select("status, is_starred, duration_seconds, created_at, sender, transcription")
      .eq("user_id", user.id)
      .neq("status", "deleted");

    if (error || !data) return NextResponse.json({ error: "Query failed" }, { status: 500 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: data.length,
      unread: data.filter((v: any) => v.status === "unread" || !v.status).length,
      today: data.filter((v: any) => new Date(v.created_at) >= todayStart).length,
      week: data.filter((v: any) => new Date(v.created_at) >= weekStart).length,
      avg_duration: data.length > 0 ? Math.round(data.reduce((sum: number, v: any) => sum + (v.duration_seconds || 30), 0) / data.length) : 0,
      avg_transcription_length: data.filter((v: any) => v.transcription).length > 0 ? Math.round(data.reduce((sum: number, v: any) => sum + (v.transcription?.length || 0), 0) / data.filter((v: any) => v.transcription).length) : 0,
    };

    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

