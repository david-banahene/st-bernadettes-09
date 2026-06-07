# Technical Reference Guide
# St. Bernadette's '09 Association Web App
# Created by David Banahene, June 2026
#
# Purpose: Document every tool, library, and design decision so that
# David (or any agent) can replicate this quality on future projects.

---

## 1. FRAMEWORK: Next.js

**What it is:** A React-based framework for building full web applications.
It handles both the front end (what users see) and the back end (server
logic, API routes, database calls) in one project.

**Why we chose it:**
- Industry standard for professional websites in 2026
- Built-in routing (each folder in /app becomes a URL)
- Server-side rendering (pages load fast, good for SEO)
- Works perfectly with Vercel for free hosting
- TypeScript support built in (catches errors before they happen)

**Version used:** Next.js 16.2.7

**How to tell an agent to set it up:**
"Create a Next.js project with TypeScript, Tailwind CSS, and the App Router.
Use `npx create-next-app@latest` with --typescript --tailwind --app flags."

---

## 2. STYLING: Tailwind CSS

**What it is:** A utility-first CSS framework. Instead of writing separate
CSS files, you add small class names directly to HTML elements.

**Why we chose it:**
- Faster development (no switching between files)
- Consistent spacing, colors, and sizing
- Responsive design built in (sm:, md:, lg: prefixes)
- Works perfectly with shadcn/ui and Magic UI

**Version used:** Tailwind CSS v4

**Example:**
- `bg-sb-green` = green background
- `text-white` = white text
- `sm:text-lg` = larger text on small screens and above
- `hover:shadow-md` = shadow appears on hover

**Custom brand colors defined in globals.css:**
- `sb-green` (#1B4332) - primary dark green
- `sb-green-dark` (#0D2818) - darker green for headers/footers
- `sb-green-light` (#2D6A4F) - lighter green for hover states
- `sb-gold` (#C8962E) - accent gold
- `sb-gold-light` (#D4A843) - lighter gold
- `sb-gold-dark` (#A67A1E) - darker gold
- `sb-cream` (#FAF6F0) - background cream
- `sb-cream-dark` (#F0E8D8) - darker cream for borders

---

## 3. UI COMPONENTS: shadcn/ui

**What it is:** A collection of pre-built, accessible UI components that
you copy into your project. Not a dependency you import from npm, but
actual code files in your /components/ui folder that you own and customize.

**Why we chose it:**
- Professional-looking buttons, cards, badges, dialogs out of the box
- Built on top of Tailwind CSS (consistent with our styling)
- Accessible (screen readers, keyboard navigation work correctly)
- You own the code (can customize anything)
- Works with Magic UI (designed to complement each other)

**Components we installed:**
- `button` - Styled buttons with variants (default, outline, ghost, etc.)
- `card` - Content containers with header/content/footer sections
- `badge` - Small labels (e.g., "President", "Year Group 2009")
- `separator` - Horizontal/vertical dividers
- `avatar` - Circular profile image containers with fallback initials
- `sheet` - Slide-out panel (used for mobile menu)
- `navigation-menu` - Desktop navigation dropdowns
- `scroll-area` - Custom scrollbar containers

**How to install a component:**
```
npx shadcn@latest add button
npx shadcn@latest add card badge avatar
```

**How to tell an agent:**
"Install shadcn/ui and add the button, card, badge, avatar, and sheet
components. Use `npx shadcn@latest init` then `npx shadcn@latest add`."

---

## 4. ANIMATIONS: Framer Motion

**What it is:** The industry-standard animation library for React. It makes
elements fade in, slide, scale, rotate, and transition smoothly.

**Why we chose it:**
- Required by Magic UI components
- Smooth, GPU-accelerated animations
- Simple API (just wrap elements in <motion.div>)
- Scroll-triggered animations built in

**Version used:** framer-motion (latest)

**How to install:**
```
npm install framer-motion
```

---

## 5. PREMIUM EFFECTS: Magic UI

**What it is:** A collection of animated components built on Framer Motion
and Tailwind CSS. These are the "wow factor" components that make a site
feel premium. Designed to work alongside shadcn/ui.

**Why we chose it:**
- Free and open source
- Copy-paste components (you own the code)
- Built specifically for shadcn/ui compatibility
- Professional-grade animations without custom code

**Components we installed and what they do:**

### ShimmerButton
- A button with a shimmering light that continuously sweeps around its border
- Used on: "Become a Member" and "Register Now" CTA buttons
- Makes call-to-action buttons eye-catching without being obnoxious
- Install: `npx shadcn@latest add "https://magicui.design/r/shimmer-button"`

### BlurFade
- Content fades in with a gentle blur effect as you scroll down the page
- Used on: Every major section (hero elements, feature cards, CTA)
- Creates a smooth "reveal" effect that makes the page feel alive
- Accepts `delay` prop to stagger multiple elements
- Install: `npx shadcn@latest add "https://magicui.design/r/blur-fade"`

### Particles
- Floating dots that drift across a section background
- Used on: Hero section (gold particles on dark green background)
- Responds to mouse movement for subtle interactivity
- Props: `quantity`, `color`, `size`, `staticity`, `ease`
- Install: `npx shadcn@latest add "https://magicui.design/r/particles"`

### NumberTicker
- Numbers count up from 0 to the target value when scrolled into view
- Used on: Financial obligations section (GH100, GH20, GH50)
- Makes statistics and amounts feel dynamic
- Install: `npx shadcn@latest add "https://magicui.design/r/number-ticker"`

### DotPattern
- A subtle dot grid background pattern
- Available for section backgrounds to add texture
- Install: `npx shadcn@latest add "https://magicui.design/r/dot-pattern"`

### AnimatedShinyText
- Text with a shimmering glare that sweeps across it
- Available for headlines or promotional text
- Install: `npx shadcn@latest add "https://magicui.design/r/animated-shiny-text"`

**Other Magic UI components worth knowing for future projects:**
- `border-beam` - Animated light beam traveling along a card border
- `shine-border` - Glowing animated border around any container
- `typing-animation` - Text that appears as if being typed
- `marquee` - Smooth scrolling text or logos (testimonials, partners)
- `bento-grid` - Modern grid layout for feature showcases
- `globe` - 3D rotating globe (great for international organizations)
- `meteors` - Falling meteor/star effect for backgrounds
- `ripple` - Expanding ripple circles background
- `confetti` - Celebration confetti burst (after payment, registration)

**Full catalog:** https://magicui.design/docs/components

**How to tell an agent:**
"Install Magic UI components for the hero section. I want Particles for
the background, BlurFade for scroll animations, and ShimmerButton for
the CTA. Install them using the shadcn CLI with the magicui.design URLs."

---

## 6. FONTS: Google Fonts via Next.js

**What we use:**
- **Playfair Display** (serif) - For headings (h1, h2). Elegant, high
  contrast between thick and thin strokes. Signals quality and prestige.
- **Inter** (sans-serif) - For body text. Designed specifically for
  screens. Clean, highly readable at all sizes.

**Why this pairing works:**
The contrast between an elegant serif heading and a clean sans-serif body
creates a strong visual hierarchy. This pairing is used by premium brands,
editorial sites, and professional organizations worldwide.

**How it is set up:**
In `layout.tsx`, fonts are loaded via `next/font/google` which:
- Automatically optimizes font loading
- Eliminates layout shift (text does not jump when fonts load)
- Self-hosts the fonts (no external requests to Google)

**CSS variables:**
- `--font-playfair` mapped to `font-heading` in Tailwind
- `--font-inter` mapped to `font-sans` in Tailwind

**Usage in components:**
- `className="font-heading"` for serif headings
- Body text uses `font-sans` by default (set on <body>)

**How to tell an agent:**
"Use Playfair Display for headings and Inter for body text. Load them
through next/font/google in layout.tsx. Map Playfair to --font-heading
and Inter to --font-sans in the Tailwind theme."

---

## 7. ICONS: Lucide React

**What it is:** A clean, consistent icon set with 1000+ icons. Each icon
is a React component that accepts size and color props.

**Why we chose it:**
- Default icon set for shadcn/ui
- Consistent stroke width and style
- Tree-shakeable (only icons you use are included in the bundle)
- MIT licensed (free for any use)

**How to use:**
```tsx
import { Users, CalendarDays, Heart } from "lucide-react";
<Users className="h-5 w-5" />
```

**Icon browser:** https://lucide.dev/icons

---

## 8. BACKEND: Supabase (Phase 2+)

**What it provides:**
- PostgreSQL database (stores all member data, events, payments)
- Authentication (email/password login, session management)
- File storage (member photos, event photos, meeting minutes PDFs)
- Row Level Security (data access control per user role)
- Real-time subscriptions (live updates when data changes)

**Free tier limits (sufficient for 50 members):**
- 500 MB database storage
- 1 GB file storage
- 50,000 monthly active users
- 5 GB bandwidth

---

## 9. PAYMENTS: Paystack (Phase 4)

**What it provides:**
- Ghana Mobile Money integration (MTN MoMo, Telecel Cash, AirtelTigo)
- Secure payment processing
- Webhook notifications for payment status
- Sandbox environment for testing
- 1.95% fee per transaction (no monthly fee)

---

## 10. EMAIL: Resend (Phase 8)

**What it provides:**
- Transactional email delivery (notifications, confirmations)
- React email templates (design emails in React)
- 100 emails/day free tier
- Simple API

---

## 11. HOSTING: Vercel (Phase 9)

**What it provides:**
- Free hosting for Next.js apps
- Automatic deploys from GitHub
- Global CDN (fast loading worldwide)
- SSL certificate (https://) included
- Custom domain support

---

## 12. DESIGN PATTERNS USED

### Visual Hierarchy
- Playfair Display serif for headings creates authority
- Inter sans-serif for body creates readability
- Gold underline accent (h-0.5 w-10 bg-sb-gold) under section headings
- Font sizes step down: h1 (4xl-6xl) > h2 (2xl-3xl) > h3 (sm-base) > body (sm)

### Color System
- Dark green backgrounds for headers/hero/footer (authority, trust)
- Cream background for content areas (warmth, approachability)
- Gold accents for highlights, badges, CTAs (premium feel)
- White cards on cream background (clean separation)

### Spacing
- Consistent padding: py-16 sm:py-24 for sections
- max-w-7xl for content width (readable line lengths)
- gap-5 or gap-6 between grid items

### Card Design
- Subtle border (border-sb-cream-dark)
- White background on cream page
- Hover: slight lift (-translate-y-0.5), shadow, gold border tint
- Horizontal layout for feature cards (icon left, text right)

### Animation Rules
- BlurFade on every major section (delay 0.1 for first, stagger +0.08)
- Hover transitions: 300ms duration
- No animation on text-heavy content (readability first)
- Particles: low quantity (40), small size (0.4), gold color on dark bg

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Navigation collapses to hamburger menu at md breakpoint
- Grid: 1 col mobile, 2 col sm, 3 col lg
- Font sizes scale up at breakpoints

---

## 13. FULL INSTALL COMMANDS (for replicating on a new project)

```bash
# 1. Create Next.js project
npx create-next-app@latest my-project --typescript --tailwind --app --src-dir

# 2. Initialize shadcn/ui
npx shadcn@latest init -d

# 3. Install shadcn/ui components
npx shadcn@latest add button card badge separator avatar sheet navigation-menu scroll-area

# 4. Install Framer Motion
npm install framer-motion

# 5. Install Magic UI components
npx shadcn@latest add "https://magicui.design/r/shimmer-button" -y
npx shadcn@latest add "https://magicui.design/r/blur-fade" -y
npx shadcn@latest add "https://magicui.design/r/number-ticker" -y
npx shadcn@latest add "https://magicui.design/r/particles" -y
npx shadcn@latest add "https://magicui.design/r/dot-pattern" -y
npx shadcn@latest add "https://magicui.design/r/animated-shiny-text" -y

# 6. Install Lucide icons (usually included with shadcn)
npm install lucide-react

# 7. Set up fonts in layout.tsx
# Import Playfair_Display and Inter from next/font/google
# Map to CSS variables --font-playfair and --font-inter

# 8. Define brand colors in globals.css using @theme inline
```

---

## 14. WHAT TO TELL AN AGENT FOR A SIMILAR PROJECT

Copy this prompt to get a similar quality result:

"Build a professional web application using Next.js with the App Router,
TypeScript, and Tailwind CSS. Use shadcn/ui for base components and Magic UI
for premium animations (BlurFade for scroll reveals, ShimmerButton for CTAs,
Particles for hero backgrounds, NumberTicker for statistics). Use Playfair
Display for headings and Inter for body text loaded via next/font/google.
Design should be clean, minimal, and professional with a consistent color
scheme. Every section should have BlurFade scroll animations with staggered
delays. Feature cards should use horizontal layout with icon and text side
by side. Use Supabase for the backend (database, auth, file storage) and
deploy to Vercel."
