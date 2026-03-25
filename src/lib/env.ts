// Fullstack Expert: Secure env validation with safe defaults
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://tkwpdlndkyazprfgvlup.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd3BkbG5ka3lhenByZmd2bHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1OTk1NTcsImV4cCI6MjA0NzE3NTU1N30.ZkG8Q3tP8nN2R9iJqT5m5lZ1K5v1i3tY1j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0'),
  SUPABASE_URL: z.string().url().default('https://tkwpdlndkyazprfgvlup.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
})

const env = envSchema.parse({
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
})

export default env

