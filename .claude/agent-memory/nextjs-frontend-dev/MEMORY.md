# Frontend Agent Memory

## Project Overview
- Profile page app: Next.js 14+ App Router, TailwindCSS, TypeScript
- Working directory: `/workspaces/my-profile-page/frontend/app/`
- Component directory: `/workspaces/my-profile-page/frontend/app/components/`

## Key Type Definitions
- Shared types live in `/workspaces/my-profile-page/frontend/app/page.tsx`
- `ProjectRead` includes `id`, `name`, `description`, `is_completed`, `content`, `skills: SkillRead[]`, `image_url: string | null`
- `SkillRead` = `{ id, name, parent_id, category_id }`

## Design Tokens (TailwindCSS)
- Background dark: `bg-[#212121]`, hover: `bg-[#353535]`
- Background card accent: `bg-[#393939]` (skill tags)
- Text light: `text-[#fafafa]`
- Completed badge: `bg-[#2b2b2a] text-[#fafafa]`; Ongoing badge: `bg-gray-200 text-[#212121]`
- Card min-height: `min-h-[380px] xs:min-h-[325px] sm:min-h-[325px] lg:min-h-[275px]`

## Next.js Image Configuration
- `next.config.ts` at `/workspaces/my-profile-page/frontend/next.config.ts`
- Wildcard `remotePatterns` for http+https added to support backend image URLs
- Admin panel previously used plain `<img>` with eslint-disable to bypass domain restrictions
- Use `next/image` with `fill` + `sizes` for background images in cards

## Component Patterns
- Cards use `relative overflow-hidden` as outer wrapper when background image is present
- Background layers: `absolute inset-0` (image via `fill`, base overlay, gradient overlay)
- Content layer: `relative z-10` with padding and flex layout
- Hover state on overlay div: `hover:bg-[#353535]/70 transition`
- When no image: solid `absolute inset-0 bg-[#212121] hover:bg-[#353535] transition` div

## File Conventions
- PascalCase component files (e.g., `ProjectCard.tsx`, `ProjectBar.tsx`)
- Server Components by default; `'use client'` only when needed
- No `cn`/`clsx` utility confirmed in use — plain template literals for conditional classes
