# Plan: Weather Activity Ranker (Collinson take-home)

## Context

Take-home for a Web Engineer role at Collinson (React/TS/Node/GraphQL). Build a service + UI that takes a city and ranks the next 7 days for Skiing, Surfing, Outdoor sightseeing, Indoor sightseeing, using Open-Meteo. Reviewers care most about **how we worked** (decisions, assumptions, AI usage, commits), then the app + README. Budget ≈ half a day. Must be deployed on a free host.

User decisions already made:

- Scoring: **weighted factors (0–1 piecewise-linear curves) + hard gates** → 0–100
- Input: **accessible autocomplete combobox** backed by geocoding
- Results: **ranked activity cards with a 7-day score strip**, best day, 2–3 reasons; unavailable activities sink to the bottom with explanation
- Deploy: **single Vercel project** – Vite static + GraphQL Yoga serverless function at `/api/graphql`
- Skiing: **town grid point + snow gate** (valley-town limitation documented)
- Surfing: **probe ring** of points (~10/25 km, 8 directions) in one multi-coordinate Marine request; nearest with wave data wins
- Weekly score: **mean of best 3 days**

Working style: step-by-step, one step per commit/PR, pause for review after each. Frontend explanations terse; **backend explained in depth** (what/why/alternatives + 1–2 interview questions per backend step). No code comments.

## Repo layout (new public GitHub repo, e.g. `~/Documents/projects/weather-activity-ranker`)

```
package.json            npm workspaces: apps/*
vercel.json             build apps/web → apps/web/dist, functions from /api
api/graphql.ts          Vercel function: re-exports Yoga handler from apps/server
apps/server/
  src/schema.graphql
  src/resolvers/        searchPlaces, activityForecast
  src/openMeteo/        geocoding.ts, forecast.ts, marine.ts, types.ts (native fetch)
  src/scoring/          curves.ts, activities/{skiing,surfing,outdoor,indoor}.ts, aggregate.ts, labels.ts (+ *.test.ts)
  src/yoga.ts           createYoga({ schema })
  src/dev.ts            node:http server for local dev
apps/web/               mirrors currency-converter
docs/
  DECISIONS.md          running log: open question → assumption → why (PM-style)
  SCORING.md            domain research per activity, thresholds, sources, sanity checks, what I rejected from the AI
README.md               what, how to run, assumptions, live URL
```

## Backend

- **GraphQL Yoga** (fetch-API native → runs unchanged as a Vercel function and a local Node server), schema-first SDL, `@graphql-codegen` for resolver types and client types from one `schema.graphql`.
- Schema sketch:
  - `searchPlaces(query: String!): [Place!]!` → Open-Meteo geocoding `/v1/search`
  - `activityForecast(placeId: ID!): ActivityForecast!` → geocoding `/v1/get?id=` then forecast + marine in parallel
  - `Place { id name admin1 country countryCode latitude longitude elevation timezone }`
  - `ActivityForecast { place, activities: [ActivityRanking!]! }` sorted by weekScore
  - `ActivityRanking { activity: Activity!, available: Boolean!, unavailableReason, weekScore: Int, bestDay: String, days: [DayScore!]! }`
  - `DayScore { date, score: Int!, label: ScoreLabel!, reasons: [String!]! }`
  - Errors via `GraphQLError` with `extensions.code`: `PLACE_NOT_FOUND`, `UPSTREAM_UNAVAILABLE`, `BAD_INPUT`. Marine failure degrades only surfing (partial result, not whole-query failure).
- Open-Meteo calls: forecast `daily` (temp max/min, apparent temp, precipitation sum/probability, snowfall_sum, weather_code, wind speed/gust max, sunshine_duration, daylight_duration, uv_index_max) + `hourly=snow_depth,visibility` aggregated to daily; `timezone=auto`, `forecast_days=7`. Marine `daily` wave_height_max, wave_period_max, swell_wave_height_max, swell_wave_period_max for the ring of coordinates.
- Scoring engine = pure functions over a normalized `DayWeather` type. Each activity is a declarative config: `{ gates[], factors[{ metric, weight, curve: [[x, score]...], reason templates }] }`. Score = round(100 × Σ wᵢ·fᵢ); gated → 0 + reason. Reasons = worst/best-contributing factors. Labels: ≥80 Great, ≥60 Good, ≥40 Fair, else Poor, gated = Not possible.
- Draft thresholds (to be researched/sanity-checked with the model and recorded in SCORING.md in step 1):
  - **Skiing**: gate snow depth < ~20 cm; factors snow depth, fresh snowfall, temp (ideal −12…−2 °C, slush > +3), gusts (lifts close ~60+ km/h), visibility/weather.
  - **Surfing**: gate no marine data within ring / thunderstorm; factors wave height (ideal ~0.6–2.5 m), swell period (<6 s poor, ≥10 s great), wind speed (low good; offshore direction cut – noted), weather.
  - **Outdoor sightseeing**: precip prob/sum, apparent temp comfort (~15–25 °C), wind, sunshine; thunderstorm caps score.
  - **Indoor sightseeing**: always available; scored as the "rainy-day alternative" – rises as outdoor conditions fall, with a penalty for travel hazards (heavy snow/storm). Logged as an explicit product assumption.
- Vitest unit tests on curves, gates, each activity with fixture days, aggregate (top-3 mean).

## Frontend (apps/web, mirror `/Users/v.piaskarski/Documents/projects/currency-converter`)

- Copy configs/conventions: Vite 8 + `@vitejs/plugin-react` + `@rolldown/plugin-babel` with `reactCompilerPreset()`, Tailwind v4 via `@tailwindcss/vite`, TanStack Query v5, `@shared` alias (vite.config, vitest.config, tsconfig.app.json), eslint flat config (+ query plugin, prettier), `.prettierrc.json {printWidth:100}`, Vitest + RTL + user-event + jest-dom, `src/test/setup.ts`.
- Conventions: PascalCase component folders with `index.tsx`, `export const X = () =>`, `type` not `interface`, barrels `export * from`, handlers `handleX`, UPPER_SNAKE constants, no manual memoization.
- Structure:
  - `src/shared/api/graphqlClient.ts` (fetch/graphql-request to `/api/graphql`, typed documents from codegen)
  - `src/shared/components/` Input, Spinner, ErrorMessage, Button; `src/shared/hooks/useDebounce.ts` (reuse from reference)
  - `src/features/place-search/` api, hooks (`usePlaceSearch`), components (`PlaceCombobox` – ARIA combobox/listbox, keyboard nav, "No places found", loading row)
  - `src/features/activity-forecast/` api, hooks (`useActivityForecast`), components (`ActivityRankingList`, `ActivityCard`, `DayStrip`, `ScoreBadge`, skeleton), utils (label → colour + text, never colour-only)
  - `src/app/App.tsx` – QueryClient, selected place kept in URL `?place=<id>` (shareable, back-button friendly)
- States: idle prompt, typing/searching, no matches, forecast loading skeleton, `PLACE_NOT_FOUND` (bad/stale URL id), upstream error with retry, partial (surfing unavailable), per-activity "Not possible here" reason.
- A11y: labelled combobox, `aria-live` for result/loading announcements, visible focus, text labels alongside colours.

## Steps (one commit/PR each, pause after each)

0. Scaffold repo + workspaces, `docs/DECISIONS.md`, init git, public GitHub repo.
1. Domain research with the model → `docs/SCORING.md` (thresholds, weights, what was challenged/rejected).
2. BE: Open-Meteo client (geocoding, forecast, marine ring) + normalization to `DayWeather`.
3. BE: scoring engine + unit tests.
4. BE: GraphQL schema, resolvers, error codes, Yoga, local dev server, codegen.
5. Deploy: `api/graphql.ts` + `vercel.json`, verify live `/api/graphql`.
6. FE: scaffold from reference configs, shared layer, GraphQL client + codegen.
7. FE: place-search combobox feature (+ tests).
8. FE: activity-forecast feature, all states (+ tests).
9. Polish: a11y pass, README (what/run/assumptions/cuts), final deploy.

## Verification

- `npm test -w apps/server` – scoring fixtures (e.g. Zermatt-like snowy day ≥ Good skiing; warm rainless day skiing gated; Warsaw surfing unavailable; Biarritz/Lisbon surfing available via ring).
- Local: `npm run dev` (server + web), query GraphiQL at `/api/graphql` for Innsbruck, Chamonix, Biarritz, Nazaré, Warsaw, "asdfgh".
- Browser pane: combobox keyboard flow, loading skeleton, not-found, `?place=` deep link, mobile width.
- Vercel preview/prod URL smoke test of the same cities.
