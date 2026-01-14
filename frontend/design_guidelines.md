# IACS DevOps Labs and Experiments - Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach using GitHub Docs + Material Design principles
**Rationale:** Technical documentation sites require clarity, code readability, and professional aesthetics. This hybrid approach combines GitHub's exceptional code presentation with Material's structured hierarchy for technical content.

---

## Typography System

**Font Families:**
- **Headings:** Inter (Google Fonts) - weights 600, 700
- **Body Text:** Inter - weight 400, 500  
- **Code/Technical:** JetBrains Mono (Google Fonts) - weight 400, 500

**Type Scale:**
- Hero/H1: text-5xl (3rem) → text-6xl (3.75rem) on desktop
- H2: text-3xl (1.875rem) → text-4xl (2.25rem)
- H3: text-2xl (1.5rem)
- H4: text-xl (1.25rem)
- Body: text-base (1rem)
- Small/Meta: text-sm (0.875rem)
- Code inline: text-sm with mono font

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 8, 12, 16, 20** for consistency
- Component padding: p-4, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-8
- Grid gaps: gap-6, gap-8

**Container Widths:**
- Global max-width: max-w-7xl (1280px)
- Content articles/labs: max-w-4xl (896px) for optimal reading
- Sidebar layouts: 2/3 content + 1/3 sidebar

**Grid Patterns:**
- Blog/Lab cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Tool cards: grid-cols-1 lg:grid-cols-2 (larger cards for technical content)
- Protocol index: grid-cols-2 md:grid-cols-3 lg:grid-cols-4

---

## Component Library

### Navigation
- **Sticky header** with site logo "IACS DevOps Labs and Experiments", primary nav links (Blog, Labs, Tools, Resources)
- Desktop: horizontal nav with dropdown menus for Labs (by protocol) and Tools
- Mobile: hamburger menu with expandable sections
- Include GitHub/DockerHub icon links in header
- Secondary breadcrumb navigation on content pages

### Hero Section (Homepage)
- **Full-width hero** (min-h-[500px] to h-[600px]) with technical imagery
- Background: Subtle gradient overlay on industrial automation imagery (server racks, control panels, or abstract network visualization)
- Centered content with large headline, supporting text, dual CTA buttons
- Primary CTA: "Explore Labs" | Secondary: "Browse Documentation"

### Content Cards

**Blog Post Cards:**
- Elevated card design (shadow-md on hover)
- Thumbnail area (16:9 aspect ratio) - technical diagrams or protocol logos
- Title (text-xl font-semibold)
- Meta info: date, read time (text-sm)
- Excerpt: 2-3 lines with read more link
- Padding: p-6

**Lab Protocol Cards:**
- Icon/logo at top (80x80px area for protocol icon)
- Protocol name (text-2xl)
- Lab count badge (e.g., "4 Labs Available")
- Brief description (2 lines)
- "Start Labs" button
- Border with hover state elevation

**Tool/Library Cards:**
- Horizontal layout on desktop (logo left, content right)
- Tool logo/icon (100x100px)
- Title + version badge
- Description paragraph
- Installation command code snippet
- "View Docs" link

### Article/Lab Content Layout
- **Sidebar layout** for lab content:
  - Left: 2/3 main content area (max-w-3xl)
  - Right: 1/3 sticky sidebar with table of contents, related labs, quick links
- Typography hierarchy with clear H2, H3 spacing (mt-12, mt-8)
- Code blocks: Full-width with syntax highlighting preparation, copy button top-right
- Callout boxes for tips/warnings (border-l-4 with icon)
- Step numbers for procedural content (large circular badges)

### Footer
- **Three-column footer** (stacks on mobile)
- Column 1: Site description + social/repo links
- Column 2: Quick links (Blog, Labs by Protocol, Tools)
- Column 3: Resources (GitHub, Docker Hub, Contact)
- Bottom bar: Copyright, "Built for Industrial Automation Engineers"

---

## Page-Specific Layouts

### Homepage
- Hero section with CTA
- "Featured Labs" section: 3-column grid of top protocol labs
- "Latest Blog Posts": 2-column grid of recent posts
- "Popular Tools" horizontal scrolling carousel or 4-column grid
- Newsletter signup section (simple centered form)

### Labs Index (/labs)
- Page header with title "Protocol Labs" + introduction paragraph
- Protocol grid (4 columns on desktop)
- Each protocol card shows: icon, name, lab count, "View Labs" button
- Filter/sort options (All Protocols, By Difficulty, By Type)

### Individual Lab Page
- Breadcrumb: Labs > Protocol Name > Lab Name
- Lab header: Title, difficulty badge, time estimate
- Sidebar: Table of contents (auto-generated from H2/H3), "Prerequisites", "Related Labs"
- Main content: Step-by-step with clear numbering
- Code blocks with language tags
- Bottom navigation: Previous/Next lab in sequence

### Blog List
- Hero header with "Blog" title + search bar
- 3-column masonry-style grid of post cards
- Categories filter sidebar (Docker, Protocols, Python, Wireshark, etc.)
- Pagination at bottom

### Tools & Libraries
- Grid layout (2 columns) of tool cards
- Each card: horizontal layout with logo, description, primary action
- Filter by category (Protocol Libraries, Development Tools, Analysis Tools)

---

## Images

**Hero Homepage:**
- Image: Modern industrial control room or server infrastructure with blue/teal lighting, showing monitors with network diagrams
- Treatment: Subtle dark overlay (opacity 40%) to ensure text readability
- Buttons: Glassmorphism effect (backdrop-blur-md with semi-transparent background)

**Protocol/Tool Icons:**
- Placeholder for official logos: Modbus, CIP, OPC UA, MQTT, S7, DNP3, IEC104
- Format: SVG preferred, 100x100px display size
- Fallback: Simple iconography from Heroicons (server, cpu, code icons)

**Blog Thumbnails:**
- Technical diagrams, code screenshots, or protocol architecture illustrations
- 16:9 ratio, 400x225px minimum
- Comments for specific images: `<!-- IMAGE: Wireshark capture showing Modbus TCP packets -->`

---

## Technical Content Enhancements

**Code Display:**
- Inline code: Subtle background, rounded corners (rounded px-1.5 py-0.5)
- Code blocks: Darker background, line numbers, copy button, language label top-right
- Terminal commands: Distinguished with $ prompt styling

**Tables:**
- Full-width with alternating row backgrounds
- Sticky header on scroll
- Responsive: horizontal scroll on mobile

**Alerts/Callouts:**
- Four types: Info (blue accent), Warning (yellow), Success (green), Danger (red)
- Icon + border-left accent + padding

---

This design creates a professional, content-focused experience optimized for technical documentation while maintaining visual appeal and modern web standards. The layout prioritizes code readability, clear hierarchy, and efficient navigation for engineer users.
