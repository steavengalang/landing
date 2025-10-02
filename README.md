# Code Bridge Pro - Landing Page

Landing page untuk Code Bridge Pro extension dengan multi-language dan multi-currency support.

## Tech Stack

- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **Vercel KV** - Database (Redis)
- **Stripe** - Payment processing
- **next-i18next** - Multi-language

## Setup Local Development

1. **Clone & Install**
git clone [your-repo]
cd code-bridge-landing
npm install

text

2. **Environment Variables**
cp .env.example .env.local

Edit .env.local dengan keys Anda
text

3. **Run Development Server**
npm run dev

text

4. **Open Browser**
http://localhost:3000

text

## Deployment to Vercel

1. **Push to GitHub**
git push origin main

text

2. **Connect to Vercel**
- Import project di vercel.com
- Add environment variables
- Deploy

3. **Setup Vercel KV**
- Di Vercel dashboard → Storage tab
- Create KV Database
- Environment variables auto-injected

4. **Setup Stripe Webhook**
- Stripe Dashboard → Webhooks
- Add endpoint: `https://your-domain.vercel.app/api/webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`
- Copy webhook secret ke env vars

## File Structure

- `/pages` - Next.js pages & API routes
- `/components` - React components
- `/public/locales` - Translation files
- `/styles` - Global CSS

## Multi-Language

Supported languages:
- English (en) - Default
- Indonesian (id)

Add translations in `/public/locales/[lang]/common.json`

## License Management

License keys stored in Vercel KV with format:
license:CB-XXXXXXXXXXXX → { email, tier, expiresAt, ... }
email:user@email.com → CB-XXXXXXXXXXXX
usage:userId:2025-10-02 → count (expires daily)

text

## Support

Email: support@codebridge.dev