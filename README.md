# muselook

Copy the look. Keep your tone. Upload a K-pop idol makeup look, see it on your own face, then get it shifted to your skin tone with real K-beauty products and a step-by-step routine. Share the result to a public feed.

Target: US Gen Z K-beauty fans (13+), especially medium-to-deep skin tones.

## Run locally

```sh
pnpm install
cp .env.example .env.local   # fill ANTHROPIC_API_KEY, OPENAI_API_KEY
pnpm dev
```

Checks: `pnpm lint && npx tsc --noEmit && pnpm build`. Container: `docker build -t muselook:local .`

Product recommendations run `pi` headless with web search (`pi-web-access`); the Docker image installs both. Uploaded and generated images are stored on the filesystem under `DATA_DIR` (Railway volume `/data`).

Docs: `docs/spec.md` (product + tech), `docs/plan.md` (tasks + verification log), `design/option-a.html` (design).
