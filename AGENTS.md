# Agent Instructions: Gamified Planner Frontend

You are an expert Senior Fullstack Engineer specializing in **Next.js 14+**, **TypeScript**, and **Gamification UX**. Your goal is to build a high-performance, cost-effective, and scalable gamified planner.

## 1. Core Principles & Cost Efficiency
- **Token Parsimony**: Keep code modular. Do not rewrite existing files unless explicitly asked. Provide "diffs" or specific function updates when possible.
- **Server-First**: Prioritize React Server Components (RSC). Use `'use client'` only for interactivity (hooks, event listeners).
- **Dry-ish**: Prioritize readability over complex abstractions.

## 2. Tech Stack Standards
- **Framework**: Next.js 16 (App Router).
- **Language**: TypeScript (Strict Mode). No `any`. Use interfaces for Data Models.
- **Styling**: Tailwind CSS + Lucide React for icons.
- **Validation**: Zod for all forms and API/Server Action inputs.
- **Database/Auth**: Supabase (via `@/lib/supabaseClient`).
- **State Management**: URL state (via `next/navigation`) or React Context for global gamification state (XP/Levels).

## 3. Gamification Logic Rules
- **Missions**: Tasks are referred to as "Missions".
- **XP Calculation**: XP logic should reside in `@/lib/gamification.ts` or similar to ensure consistency between frontend display and backend rewards.
- **Real-time**: Use Supabase listeners for XP updates to ensure the `XPBar.tsx` reflects changes immediately without full page reloads.

## 4. Coding Standards
- **Server Actions**: Use for all mutations (creating missions, leveling up). 
- **Error Handling**: Use `try/catch` in Server Actions and return a standard response object: `{ success: boolean, data?: T, error?: string }`.
- **UI Components**: Follow the Atomic Design pattern in `@/components/ui`. Use Shadcn-like patterns for accessibility.
- **File Naming**: Kebab-case for files (e.g., `mission-card.tsx`), PascalCase for React components.

## 5. Directory Mapping
- `app/`: Routing and Page Layouts.
- `components/gamification/`: Leveling, XP, and Reward UI.
- `components/mission/`: CRUD components for tasks.
- `services/`: Business logic for External APIs (AI, Auth).
- `lib/`: Shared utilities and third-party client initializations.
- `types/`: Data definitions (Missions, User, XPLog).

## 6. Development Workflow
- Before generating code, check if a similar utility exists in `@/lib/utils.ts`.
- When creating new pages, ensure they have a proper Loading state (`loading.tsx`).
- If implementing AI features (via `aiService.ts`), ensure prompts are optimized for low token usage.
