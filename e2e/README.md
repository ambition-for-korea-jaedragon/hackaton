# e2e fixtures and checks

`public/e2e/` holds the **test** photos (AI-generated, fictional people). They are not pre-filled demo samples:

- test **looks** are uploaded as real files, so the app runs the real analysis on them (Haiku vision, hashtags, mannequin, muse-product web search);
- test **selfies** run the real application (image generation).

The pre-filled demo samples live in `public/samples/` with their data in `src/data/sample-looks.json`
(regenerate with `scripts/gen-demo-samples.mjs` → `scripts/ingest-demo-samples.mjs` → `scripts/sample-hashtags.mjs`).

Scripts here use `playwright-core` and the cached Chrome for Testing (see paths at the top of each file); the app must be running on :3100.

- `two-paths.mjs` — demo look (prepared, `POST /api/session/sample`) vs test look (live, `POST /api/session`), plus selfie drag-and-drop
- `flow.mjs` — sample look → selfie → My Tone → share (real generation)
- `flow2.mjs` — same with an uploaded look file
