# Bugs Report - Voicemail SaaS Next.js

## Critical Bugs (Blockers)

**BUG-001: src/app/dashboard/page.tsx Parsing Error**
- **Cause**: Incomplete/corrupted edits (missing newlines, braces).
- **Fix**: Recreate clean version.
- **Status**: Fixing now.
- **Priority**: 1 (blocks tsc)

**BUG-002: Multiple `@typescript-eslint/no-explicit-any`**
- Files: src/app/api/stats/route.ts (lines 25-29), src/components/auth-form.tsx (39-40).
- **Fix**: Replace `any` with `unknown`.
- **Priority**: 2

**BUG-003: Unescaped apostrophes in JSX** (fixed by eslint)
- Files: page.tsx, login/page.tsx.

**BUG-004: Hoisting issue dashboard** (fixed in recreate).

## Minor (Warnings)
- Unused vars in API routes (safe to ignore or remove).

## Resolution Status
- Config files (next.config.ts, tailwind, tsconfig) ✅ fixed.
- ESLint --fix ran.

## Next Steps
1. Fix dashboard.
2. `npx tsc --noEmit` to verify.
3. `npm run dev`.

Validation: Dev server starts without transpilation errors at localhost:3000.

