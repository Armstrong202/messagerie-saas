import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tkwpdlndkyazprfgvlup.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd3BkbG5ka3lhenByZmd2bHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1OTY1MDAsImV4cCI6MjAzOTE3NDUwMH0.MPlhpI3zG6_u0V2T-mWdhB5N2Q07h6kZRdgLd9YMy4A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
