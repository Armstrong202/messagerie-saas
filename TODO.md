# Voicemail SaaS Full Improvements TODO

Status: Approved plan. Tracking progress step-by-step.

## Plan Summary
Production-grade: security, perf, UX, features, code quality.

## Steps (3/18 complete)

### 1. Security & Auth (3/4 complete)
- [x] 1.1 Create src/middleware.ts (protect routes)
- [x] 1.2 Edit src/lib/server.ts (enhance client)
- [x] 1.3 Edit src/app/api/transcribe/route.ts (server auth, rate limit)
- [ ] 1.4 Supabase RLS enable (manual via dashboard)

### 2. Server Components & API (0/4 complete)
- [ ] 2.1 Refactor src/app/dashboard/page.tsx to RSC + server actions
- [ ] 2.2 Create src/app/api/voicemails/route.ts (CRUD, search)
- [ ] 2.3 Create src/actions.ts (server actions for dashboard)
- [ ] 2.4 Edit src/app/admin/page.tsx (full admin dashboard)

### 3. UX/Features (0/5 complete)
- [ ] 3.1 Create src/components/voicemail-table.tsx (search, paginate)
- [ ] 3.2 Add realtime to dashboard (Supabase channels)
- [ ] 3.3 Edit src/app/api/transcribe/route.ts (streaming)
- [ ] 3.4 Improve responsive/globals.css
- [ ] 3.5 Add error boundaries/components/error.tsx

### 4. Code Quality & Config (0/3 complete)
- [ ] 4.1 Update package.json (new deps), npm i
- [ ] 4.2 Edit next.config.ts (headers), remove consoles
- [ ] 4.3 Lint/build test

### 5. Deploy (0/2 complete)
- [ ] 5.1 Git commit/push new branch blackboxai/improvements
- [ ] 5.2 Vercel deploy, test prod

**Next: 1.4 Supabase RLS (manual), then 2.1 dashboard RSC**

Progress updated after each step.
