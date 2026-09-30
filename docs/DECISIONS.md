# Decisions log

Running log of open questions I'd normally take to a PM, the assumption I committed to, and why.
Newest at the bottom. Format: **Question → Decision → Why (alternatives considered)**.

## Product / UX

### D1. How does the user identify a place?
- **Decision:** autocomplete combobox backed by Open-Meteo geocoding; the forecast is requested by geocoding `id`, not by free text.
- **Why:** "Paris" is ambiguous (FR / TX / ON). Resolving the place *before* forecasting means we never silently show the wrong city, and "place doesn't exist" becomes a clear inline "No places found" state rather than an error page.
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

### D8. Surfing probes a ring of sea points around the city
- **Why:** the Marine API returns nulls when the city's grid cell is land — true for many coastal cities. One multi-coordinate request (city + ~10/25 km in 8 directions) finds the nearest cell with wave data; if nothing within ~25 km → "No coast nearby".
- **Cut:** wind direction relative to the coast (offshore vs onshore) matters a lot to surfers but needs coastline orientation — noted, not built.

### D9. Indoor sightseeing is always available
- **Decision:** scored as the "rainy-day alternative": higher when outdoor conditions are poor, lightly penalised for travel hazards (heavy snow, storms).
- **Why:** weather doesn't stop a museum, so an absolute indoor score would be flat and useless for ranking. The interesting question is "is today a day to be inside?". This is the most debatable product call — would confirm with PM.

## Engineering

### D10. Single Vercel project: static Vite build + GraphQL Yoga as a serverless function
- **Why:** free, one URL, no CORS, no always-on server to cold-start. Yoga is built on the Fetch API, so the same handler runs as a Vercel function and as a local Node server.
- **Alternative:** Vercel FE + Render BE — more "classic server" but 30–50 s cold starts on free tier and CORS config.

### D11. No persistence, no cache layer
- Per the brief. React Query caches on the client; Open-Meteo is called per request.
