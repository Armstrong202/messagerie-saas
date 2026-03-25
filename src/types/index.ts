export type VoicemailStatus = "unread" | "read" | "archived" | "deleted";
export type UserRole = "admin" | "user" | "viewer";
export type TranscriptionStatus = "pending" | "processing" | "done" | "failed";

export interface Voicemail {
  id: string;
  user_id: string;
  caller_number: string;
  caller_name?: string;
  duration_seconds: number;
  audio_url: string;
  transcript?: string;
  transcription_status: TranscriptionStatus;
  status: VoicemailStatus;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  notes?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  plan: "free" | "pro" | "enterprise";
  voicemail_count: number;
  storage_used_bytes: number;
}

export interface VoicemailStats {
  total: number;
  unread: number;
  archived: number;
  starred: number;
  today: number;
  this_week: number;
  avg_duration: number;
}

export interface PaginationParams {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface VoicemailListResponse {
  data: Voicemail[];
  pagination: PaginationParams;
  stats?: VoicemailStats;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface TranscribeRequest {
  voicemail_id: string;
  audio_url: string;
}

export interface TranscribeResponse {
  voicemail_id: string;
  transcript: string;
  duration_seconds: number;
  language?: string;
}

