# Algo Rhythm

Algo Rhythm is an AI music-generation SaaS built with Next.js, Better Auth,
Prisma/PostgreSQL, Inngest, Modal, S3, and Polar. It supports prompt-only,
custom-lyrics, and described-lyrics generation; creator track management; a
community discovery feed; audio playback; likes; and credit purchases.

## Architecture

- `frontend/` — Next.js application, Prisma schema, Better Auth, Inngest
  worker, S3 URL signing, creator studio, player, discovery feed, and credits.
- `backend/` — Modal GPU app running ACE-Step, Qwen lyric/prompt generation,
  SDXL cover generation, and S3 uploads.

## Local frontend setup

1. Create `frontend/.env` from `frontend/.env.example`.
2. Supply a PostgreSQL `DATABASE_URL`, then run `npm run db:push` from
   `frontend/` to create the schema.
3. Install dependencies with `npm install` and start the app with
   `npm run dev`.
4. Start the local Inngest dashboard/worker in a second terminal with
   `npm run inngest:dev`.

The app is available at `http://localhost:3000`. Unauthenticated visitors are
redirected to the Better Auth sign-in route.

## Generation setup

Deploy the backend with `modal deploy backend/main.py`. Put the resulting
authenticated Modal endpoint URLs in the three `GENERATE_*` variables, and set
the matching `MODAL_KEY` and `MODAL_SECRET`. Both the Modal deployment and the
frontend need access to the configured S3 bucket.

## Credits

The app works without Polar credentials. Set `POLAR_ACCESS_TOKEN` and
`POLAR_WEBHOOK_SECRET` to enable checkout, the customer portal, and paid credit
increments. Configure the three product IDs in `frontend/src/lib/auth.ts` for
your Polar catalog before production use.
