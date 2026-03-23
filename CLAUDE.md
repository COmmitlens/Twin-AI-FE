# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Architecture

**Stack**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), Axios

### Routing

All routes live under `app/`. Protected routes wrap content in `<ProtectedRoute>` which checks `useAuth()` and redirects to `/login` on failure.

```
/                        Landing page
/login                   Auth
/sign-up                 Auth
/verify-otp/[id]/[email] OTP step after registration
/dashboard               List & create workspaces
/workspaces/[id]         Main workspace interface
/invite                  Accept team invite via JWT
```

### Auth

`lib/auth-context.tsx` provides a React Context with `user`, `isAuthenticated`, `isLoading`, and methods: `login`, `logout`, `register`, `verifyOTP`, `validateSession`. Session is maintained via HTTP-only cookies (no localStorage). `lib/axios.ts` configures an Axios instance with `withCredentials: true` and a global 401 interceptor that redirects to `/login` (except on `/auth/validate`).

### API Layer

All API calls are in `lib/api/workspace.ts` using the shared Axios instance. The backend is expected on `NEXT_PUBLIC_API_URL`. Key namespaces:
- `/auth/*` — login, register, verify-otp, logout, validate
- `/workspace/*` — CRUD, members, commits
- `/github-repository/*` — commit files, related commits, AI explain
- `/connect-org/*` — GitHub OAuth connection

### Types

All shared types are in `lib/types/workspace.ts`: `Workspace`, `Repository`, `OrgDetails`, `Commit`, `CommitDetail`, `CommitFile`, `RelatedCommit`, `ExplainResponse`, `WorkspaceMember`.

### Key Patterns

- All page components use `"use client"` directive
- UI components from `components/ui/` are shadcn/ui wrappers (Radix primitives + Tailwind CVA)
- Path alias `@/` maps to the project root
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) for class merging
- Tailwind uses CSS variables (HSL) for theming; dark mode via `class` strategy
- Commit list views support pagination via `limit`/`page` query params
