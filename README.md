# Voicemail SaaS - Gestion Messagerie Vocale

## Quick Start
```
npm install
npm run dev
```

## Setup Supabase
1. Ajoutez vos keys dans `.env.local`
2. SQL:
```
CREATE TABLE voicemails (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users, audio_url text, transcription text, created_at timestamptz DEFAULT now(), sender text);
```

## Features
- Auth
- Record voicemail
- Transcription
- Inbox
- Admin stats

## Deploy
`vercel --prod`

