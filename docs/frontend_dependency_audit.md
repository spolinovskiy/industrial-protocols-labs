# Frontend Dependency Audit and Optimization Notes

This audit covers `frontend/package.json` for the integrated React + Express
frontend. The goal is to explain why the dependency list is large and capture
safe optimization paths without breaking functionality.

## Summary
- The frontend is a fullstack React app (client) plus Express API (server).
- The UI stack is built on Radix UI + shadcn/ui patterns, which brings many
  small UI primitive packages.
- Server auth integrations (Replit/OIDC + local auth fallback) require
  additional server packages.
- The Dockerfile already uses a multi-stage build with `npm ci --omit=dev`.

## Runtime dependencies (grouped by purpose)

### Client UI and UX
- **Radix UI primitives**: `@radix-ui/*`
  - Used by the shadcn/ui component wrappers in `frontend/client/src/components/ui`.
  - Each primitive is a separate package, which makes the list long.
- **Icons**: `lucide-react`, `react-icons`
  - Used in header, footer, cards, and protocol tiles.
- **Utility styling**: `class-variance-authority`, `clsx`, `tailwind-merge`,
  `tailwindcss-animate`, `tw-animate-css`
  - Class composition and animation helpers for Tailwind + shadcn/ui.
- **Animations**: `framer-motion`
  - Used for transitions and hover effects.
- **Charts**: `recharts`
  - Used in analytics-style cards (future ready).
- **Dates and UI widgets**: `date-fns`, `react-day-picker`
  - Used for date formatting and picker components.
- **Command/drawer/OTP/carousel**: `cmdk`, `vaul`, `input-otp`, `embla-carousel-react`
  - Only needed if those components are actually used in pages.
  - They are referenced by UI components even if not used by pages today.
- **Routing and state**: `wouter`, `@tanstack/react-query`
  - Router + data fetching and caching.
- **Forms and validation**: `react-hook-form`, `@hookform/resolvers`, `zod`,
  `zod-validation-error`
  - Form validation in both client and server.
- **Theme switcher**: `next-themes`
  - Light/dark theme handling.

### Server API, auth, and storage
- **Server core**: `express`, `ws`
  - Express API + websocket/SSE support.
- **Sessions and auth**: `express-session`, `memorystore`, `connect-pg-simple`,
  `passport`, `passport-local`, `openid-client`
  - Required for local auth + optional Replit/OIDC integration.
- **Database/ORM**: `pg`, `drizzle-orm`, `drizzle-zod`
  - DB access and schema validation.
- **Security**: `helmet`, `express-rate-limit`
  - Headers and request throttling.
- **Memoization**: `memoizee`
  - Used in Replit auth integration for caching.

### Optional runtime
- **`bufferutil`** (optional dependency)
  - Websocket performance optimization for `ws`.
  - Can be omitted if you want smaller images and accept slightly slower WS.

## Dev-only dependencies
- Vite + React tooling: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`,
  `@tailwindcss/typography`, `tailwindcss`, `postcss`, `autoprefixer`
- TypeScript: `typescript`, `tsx`
- Build tooling: `esbuild`, `drizzle-kit`
- Replit dev plugins: `@replit/vite-plugin-*`
- Type definitions: `@types/*`

These are already excluded from the runtime image by `npm ci --omit=dev`.

## Why the list is large
1) The shadcn/ui + Radix approach uses many small packages for accessibility.
2) Replit auth integration adds server-side auth dependencies.
3) The repo is future-ready (command palette, drawers, OTP inputs, carousel),
   even if those components are not currently used on every page.

## Optimization opportunities (safe, non-breaking)

### Build/runtime image optimizations
- **Multi-stage Docker build is already enabled**:
  - `frontend/Dockerfile` uses a build stage and a runtime stage.
  - Runtime stage installs only production dependencies.
- **Keep `npm ci --omit=dev`** (already in place).
- **Add `.dockerignore`** if not already present:
  - Exclude `node_modules/`, `dist/`, `.git/` to reduce build context size.
- **Disable source maps for prod** (if not needed):
  - Reduce client bundle size via `build.sourcemap = false` in Vite config.
- **Optional deps**:
  - Drop `bufferutil` by running `npm ci --omit=optional` to shrink image.

### Dependency trimming (only if you remove UI features)
If you want to reduce dependency count, remove unused UI components and
their packages. Example candidates:
- `cmdk`, `vaul`, `input-otp`, `embla-carousel-react`
  - Only needed if the command palette, drawer, OTP, or carousel components
    are used in actual pages.
- Some Radix packages may become unnecessary if their corresponding
  UI components are not used.

**Important:** remove the UI components first, then remove the packages.
This avoids build breakage and reduces bundle size safely.

## Performance considerations
- The server build bundles many dependencies via `script/build.ts` which
  reduces runtime file I/O. Keep this for cold start performance.
- For lower memory on small VMs, keep polling rates low and avoid large
  client-side analytics charts until needed.

## Recommendation
Keep the current dependency set while stabilizing functionality. After the
UI settles, prune unused shadcn/ui components and their dependencies for
size savings. The Dockerfile already follows best practices for production
images, so focus on pruning unused UI components for meaningful reduction.
