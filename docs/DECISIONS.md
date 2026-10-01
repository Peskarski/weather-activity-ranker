# Decisions log

Running log of open questions I'd normally take to a PM, the assumption I committed to, and why.
Newest at the bottom. Format: **Question → Decision → Why (alternatives considered)**.

## Product / UX

### D1. How does the user identify a place?

- **Decision:** autocomplete combobox backed by Open-Meteo geocoding; the forecast is requested by geocoding `id`, not by free text.
- **Why:** "Paris" is ambiguous (FR / TX / ON). Resolving the place _before_ forecasting means we never silently show the wrong city, and "place doesn't exist" becomes a clear inline "No places found" state rather than an error page.
- **Alternatives:** search + disambiguation list (one extra click); free text + first match (least work, silently wrong for ambiguous names).

### D2. What does "rank the next 7 days" mean?

- **Decision:** both axes. Activities are ranked against each other by a weekly score; inside each activity the 7 days are shown with their own score and the best day is highlighted.
- **Why:** the brief can be read as "which activity is best this week" or "which day is best for X". Showing ranked activity cards with a 7‑day strip answers both without a toggle.

### D3. How are results presented?

- **Decision:** ranked activity cards, each with weekly score + label, 7‑day score strip, best day and 2–3 plain-language reasons. Activities that are impossible here (no snow, no coast) sink to the bottom with the reason.
- **Why:** reasons matter more than numbers for trust; a bare "63" means nothing to a user. Heatmap was considered (denser) but relies on colour and is harder to make accessible.

### D4. Selected place lives in the URL (`?place=<id>`)

- **Why:** shareable, survives refresh, back button works. Also gives us a realistic "place doesn't exist" path (stale/invalid id) to handle.

## Scoring

### D5. How do several measurements become one comparable score?

- **Decision:** each measurement is mapped to 0–1 by a piecewise-linear curve (thresholds), combined by weighted sum → 0–100. Hard **gates** set the score to 0 / "Not possible" when the activity physically can't happen (no snow cover, no sea, thunderstorm).
- **Why:** transparent and explainable; reasons fall straight out of which factors scored low/high; thresholds are data, easy to tune.
- **Alternatives:** geometric mean (one bad factor tanks the day without explicit gates, harder to explain); penalty-based (readable but not smooth, can go below 0); labels only (brief asks for a comparable score).

### D6. Weekly score = mean of the best 3 days

- **Why:** "Is this a good week for surfing?" really means "will I get a few good sessions". Plain mean averages one perfect day away; best single day is noisy and over-trusts day‑7 forecasts.

### D7. Skiing uses the town's own grid point, gated on snow depth

- **Why:** Open-Meteo gives a forecast for the town's elevation. Valley towns (Innsbruck ~570 m) under-report mountain conditions; resort towns (Zermatt, Chamonix) work well. We don't have a ski-resort dataset, and inventing an "upslope" elevation could claim skiing where no slopes exist.
- **Known limitation:** documented in README.

### D8. Surfing: how far from the city do we look for sea?

- **Original decision:** probe a ring of points (~10/25 km, 8 directions) in one multi-coordinate Marine request, assuming the API returns nulls whenever the city's grid cell is land.
- **Revised after testing the API:** a single point. The Marine API already snaps to the nearest sea cell (Rome → cell off Ostia ~20 km away); genuinely inland places return `null`. The ring would add complexity for nothing. We show the distance to the cell used. Evidence in [SCORING.md](SCORING.md#findings-from-real-api-responses-2026-09-30).
- **Cut:** wind direction relative to the coast (offshore vs onshore) matters a lot to surfers but needs coastline orientation — noted, not built.

### D9. Indoor sightseeing is always available

- **Decision:** scored as the "rainy-day alternative": higher when outdoor conditions are poor, lightly penalised for travel hazards (heavy snow, storms).
- **Why:** weather doesn't stop a museum, so an absolute indoor score would be flat and useless for ranking. The interesting question is "is today a day to be inside?". This is the most debatable product call — would confirm with PM.

### D12. Snow depth comes from ECMWF IFS, everything else from Open-Meteo's `best_match`

- **Why:** the default model's snow depth jumps from 0 to 0.45 m mid-week in Zermatt with zero snowfall (model handover artifact); ECMWF is consistent and plausible, GFS under-reports by ~10×. One request fetches both models.

### D13. Gates vs caps

- **Decision:** gates make a day _Not possible_ (score 0); caps limit the maximum score (thunderstorm → outdoor sightseeing ≤ 30).
- **Why:** a weighted sum can't express "impossible" — a flat sea with sunshine would still score ~55 for surfing.

### D14. The API returns reason codes, not sentences

- **Question (raised in review):** reason texts were hardcoded strings spread across the activity files.
- **Decision:** reasons are `{ code, value, impact }` (e.g. `GUSTS`, `65`, `NEGATIVE`); the frontend owns wording, units and formatting via a typed `Record<ReasonCode, …>` map. Same for why an activity is unavailable, and for the wave-forecast distance (a number, the UI decides when it's worth mentioning).
- **Why:** API = data, client = presentation. Translating the UI becomes a frontend-only change, copy can be edited without touching scoring, and with GraphQL codegen the compiler flags any code without a message.
- **Alternative:** a message catalog object on the backend — centralises copy, but keeps presentation in the API.

## Engineering

### D10. Single Vercel project: static Vite build + GraphQL Yoga as a serverless function

- **Why:** free, one URL, no CORS, no always-on server to cold-start. Yoga is built on the Fetch API, so the same handler runs as a Vercel function and as a local Node server.
- **Alternative:** Vercel FE + Render BE — more "classic server" but 30–50 s cold starts on free tier and CORS config.

### D11. No persistence, no cache layer

- Per the brief. React Query caches on the client; Open-Meteo is called per request.

### D15. graphql 16, not 17

- **What happened:** with graphql 17, Yoga masked our intentional errors (`PLACE_NOT_FOUND`, …) as `INTERNAL_SERVER_ERROR` in tests. graphql 17 ships separate development/production builds; Vitest loaded our `graphql` import via the `development` condition while Yoga got the production build → two `GraphQLError` classes → Yoga's `instanceof` check failed.
- **Decision:** pin graphql 16 (single build, what the Yoga/graphql-tools ecosystem is battle-tested on). graphql 16 still has the classic `.mjs`/`.js` dual-package split under Vite, so `vitest.config.ts` aliases `graphql` to the same CommonJS entry Node uses. Verified plain Node (dev server) returns the right error codes without any alias.
- **Would revisit** once graphql 17 settles across the ecosystem.

### D16. Schema-first GraphQL, codegen for types

- `schema.graphql` is the single source of truth: resolvers are typed from it (`@graphql-codegen/typescript-resolvers`), and the frontend will generate its types from the same file. Because the scoring layer's own TS types are checked against the generated resolver types, adding an enum value on one side only fails compilation.
- Expected failures are `GraphQLError`s with `extensions.code` (`BAD_USER_INPUT`, `PLACE_NOT_FOUND`, `UPSTREAM_UNAVAILABLE`); anything else is masked by Yoga as "Unexpected error." so internals never leak.
- **Alternative:** code-first (Pothos) — great type inference, but the SDL is then an artifact, and I wanted the contract readable in one file for review and for frontend codegen.

### D17. Deploy via Vercel's Build Output API with an esbuild-bundled function

- **Decision:** `npm run build:vercel` writes `.vercel/output/` directly: `static/` (the web app) and `functions/api/graphql.func/` (the Yoga handler bundled by esbuild into one `index.mjs` + `schema.graphql` + `.vc-config.json`). `vercel.json` only points Vercel at that build command.
- **Why:** the server imports its own files with `.ts` extensions (so Node runs it without a build step). Vercel's zero-config TypeScript functions compile file by file, and I couldn't be sure they rewrite those specifiers. Bundling makes the function a single self-contained file (tested by running it from a folder with no `node_modules`), and also guarantees a single `graphql` module instance (see D15).
- **Trade-off:** more build plumbing (~50 lines) than a zero-config `api/` folder; in exchange the deployed artifact is exactly what I tested locally.

### D18. Place search results are not filtered

- **Question:** live search for "Biarritz" also returns "Biarritz Pays Basque Airport". Open-Meteo gives a GeoNames `feature_code` (`PPL*` towns, `AIRP` airports, `RSRT` resorts…), so non-towns could be dropped.
- **Decision:** don't filter. A towns-only filter risks hiding exactly what people search for skiing (resorts are often not coded as towns), and the combobox shows region + country, so an airport is easy to tell apart. Would revisit with real usage data.

### D19. Frontend talks GraphQL with `fetch` + codegen'd typed strings

- **Decision:** no GraphQL client library (Apollo/urql) and no axios. `@graphql-codegen/client-preset` with `documentMode: "string"` turns each `graphql(`…`)` query into a `TypedDocumentString` carrying its result and variable types; a ~50-line `request()` posts it with `fetch`, and TanStack Query handles caching, retries and cancellation (same as the reference project's data layer).
- **Why:** Apollo/urql bring a normalized cache we don't need for two read-only queries; React Query already covers the rest. `documentMode: "string"` means the `graphql` package isn't shipped to the browser.
- API errors become an `ApiError` with a typed `code` (`PLACE_NOT_FOUND`, `UPSTREAM_UNAVAILABLE`, `NETWORK_ERROR`, …) so UI states switch on codes, never on messages; aborts pass through untouched so React Query can cancel stale searches.

### D20. Validate Open-Meteo responses at runtime with zod

- **Decision:** every Open-Meteo response is parsed with a zod schema in `fetchJson` before the rest of the server sees it; the TypeScript types for the raw responses are inferred from the same schemas. A mismatch becomes an `UpstreamError` ("unexpected response: …" naming the field), which the API reports as `UPSTREAM_UNAVAILABLE` and logs server-side.
- **Why:** TypeScript types are erased at runtime — before this, a renamed or missing field upstream would have flowed through as `undefined` and surfaced as a wrong score or a crash far from the cause. Validating at the boundary turns "silently wrong" into "loudly unavailable", with the cause in the logs.
- **Checked against reality:** ran the validated client over 19 varied queries (91 search results, 17 forecasts — polar, Southern Hemisphere, high-altitude, non-ASCII, no-country places) before committing; all passed. Unknown extra fields are ignored, so Open-Meteo adding fields can't break us.
