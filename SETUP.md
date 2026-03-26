# Tellinex Website — Deployment Guide

## Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Deploy to Vercel

### Option A: Git (recommended)
1. Push this project to a GitHub repo
2. Go to vercel.com → Import Project → select the repo
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

### Option B: CLI
```bash
npm install -g vercel
vercel
```

## Custom Domain (tellinex.com)

In Vercel dashboard → Settings → Domains → Add `tellinex.com`

Then in GoDaddy DNS:
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

## QR Code Routing

The flyers have a QR code pointing to `tellinex.com`.
The Register Interest form is at `/register`.

To make the QR code land directly on the form, either:
1. Update QR code to point to `tellinex.com/register`
2. Or keep it at `tellinex.com` — the home page has CTAs to `/register`

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, countdown, value props, stats |
| `/services` | Services — 4 tiers (residential, business, enterprise, wholesale) |
| `/about` | About — team, mission, values, timeline |
| `/register` | Register Interest — demand validation form |
| `/contact` | Contact — info cards + contact form |

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- GSAP animations (matching designer's original)
- Poppins + Nunito fonts (Google Fonts)
- SpaceBackground canvas (designer's fiber-optic animation)

## Brand Assets in /public

| File | Usage |
|---|---|
| Logo.svg | Primary logo (white, for dark backgrounds) |
| Favicon.svg | Browser tab icon |
| 1.svg | Primary logo (white version) |
| 2.svg | Primary logo (dark version, for light backgrounds) |
| 4.svg | Monochrome logo |
