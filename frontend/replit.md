# IACS DevOps Labs and Experiments

A comprehensive web platform for studying industrial automation protocol behaviors, featuring live protocol labs, technical resources, and traffic analysis tools.

## Overview

The IACS DevOps Labs and Experiments platform is a split-architecture application built with React (frontend) and Express (backend) hosted on Replit, designed to integrate with an external Docker-based lab infrastructure. The platform provides:

- **Protocol Labs**: Live hands-on labs for 8 industrial protocols (Modbus, OPC UA, CIP, DNP3, IEC-104, MQTT, S7, BACnet)
- **Guest Access**: Modbus lab available without authentication
- **Authenticated Access**: Full access to all 8 protocols after signing in
- **Learning Resources**: Technical articles on industrial protocols, network analysis, and OT/IT integration
- **Tools & Libraries**: Documentation for Python libraries (Pymodbus, pycomm3, python-opcua, Snap7, etc.)

## Architecture

### Split Architecture
- **Replit**: Hosts frontend, user management, and API routing
- **External VM**: Hosts Docker-based lab infrastructure (FUXA HMI, 8 protocol servers)

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: wouter
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Theme**: Dark/light mode support via ThemeProvider
- **Authentication**: Replit Auth (Google, GitHub, Apple, X, email)

### Backend (Express)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OIDC
- **Security**: Helmet, rate limiting, secure session management
- **Lab Integration**: API client for external Docker backend

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── header.tsx    # Site navigation with auth
│   │   │   ├── footer.tsx    # Site footer
│   │   │   ├── hero.tsx      # Homepage hero section
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── home.tsx      # Main dashboard
│   │   │   ├── about.tsx     # About page
│   │   │   ├── labs.tsx      # Protocol labs
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── use-auth.ts   # Authentication hook
│   │   └── lib/
│   │       ├── auth-utils.ts # Auth utility functions
│   │       └── queryClient.ts
├── server/
│   ├── index.ts              # Main server with security middleware
│   ├── routes.ts             # API routes including lab control
│   ├── storage.ts            # Data storage
│   ├── lib/
│   │   └── lab-client.ts     # External Docker backend client
│   └── replit_integrations/
│       └── auth/             # Replit Auth integration
├── shared/
│   ├── schema.ts             # TypeScript types and Drizzle schemas
│   └── models/
│       └── auth.ts           # Auth-related database schemas
└── PRD.json                  # Product Requirements Document
```

## API Endpoints

### Authentication
- `GET /api/login` - Begin login flow
- `GET /api/logout` - Begin logout flow
- `GET /api/auth/user` - Get current authenticated user

### Blog
- `GET /api/blog` - List all blog posts
- `GET /api/blog/:slug` - Get single blog post

### Protocols
- `GET /api/protocols` - List all protocols
- `GET /api/protocols/:id` - Get single protocol with FUXA config, transport info, related resources

### Lab Control (External Docker Backend)
- `POST /api/lab/switch` - Switch active protocol lab
- `GET /api/lab/status` - Get lab status
- `GET /api/lab/diagnostics` - Get container diagnostics
- `GET /api/lab/protocols` - Get allowed protocols based on auth status

### Tools
- `GET /api/tools` - List all tools
- `GET /api/tools/:slug` - Get single tool

## Access Control

### Guest Users
- Can access Modbus protocol lab only
- Can browse all learning resources and blog posts
- Can view tools documentation
- Prompted to sign in for full access

### Authenticated Users
- Full access to all 8 protocol labs
- Access to FUXA HMI integration
- Future: Progress tracking, saved preferences

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `REPLIT_DOMAINS` - Allowed domains for auth

### Lab Integration
- `LAB_API_BASE` - Base URL for external Docker backend
- `LAB_GUEST_URL` - Guest access endpoint
- `LAB_ADMIN_URL` - Authenticated user endpoint
- `LAB_DIAG_URL` - Diagnostics endpoint

## Security Features

- **Helmet**: Secure HTTP headers
- **Rate Limiting**: API and auth endpoint protection
- **Session Security**: PostgreSQL-backed sessions with secure cookies
- **Input Validation**: Zod schemas for request validation
- **CORS**: Configured for Replit domains

## Development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Run development server
npm run dev
```

The app runs on port 5000 with the frontend and backend served together via Vite's proxy setup.

## User Preferences

- Author: Stanislav Polinovskiy
- Platform focus: Industrial automation security research
- Design: Professional, engineer-focused, minimal AI-generated content patterns
- Access model: Guest users limited to Modbus, authenticated users get all protocols

## Recent Changes

- **2026-01-12**: Redesigned protocol pages from "4 labs per protocol" to single-page with FUXA launch, test workflow, related blogs, and library docs
- **2026-01-12**: Added termshark blog article for terminal-based industrial protocol packet analysis
- **2026-01-12**: Updated protocol schema with transportLayer, fuxaConfig, testWorkflow, relatedBlogs, libraryDocs fields
- **2026-01-12**: Platform branding transformation to "IACS DevOps Labs and Experiments"
- **2026-01-12**: Added Replit Auth integration with multiple OAuth providers
- **2026-01-12**: Implemented lab control API for external Docker backend integration
- **2026-01-12**: Added security middleware (Helmet, rate limiting)
- **2026-01-12**: Redesigned home page with dashboard sections and guest access messaging
- **2026-01-12**: Updated About page with professional layout and social links
