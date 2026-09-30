# Scoring

How a day's forecast becomes a 0–100 score per activity, what each threshold is based on, and what I
checked against real Open-Meteo responses before trusting it.

Domain knowledge (skiing, surfing) came from working it through with an LLM. Anything below marked
**judgement call** is a number I committed to without a strong source — the place I'd ask a domain
expert or tune with user feedback.

## Engine

For each activity and each day:

1. **Gates** — conditions under which the activity can't reasonably happen. Any gate → score 0,
   label *Not possible*, reason = the gate's message.
2. **Factors** — each measurement is mapped to 0–1 by a piecewise-linear curve (list of
   `[value, score]` points, linear in between, flat outside).
3. **Score** = `round(100 × Σ weightᵢ × factorᵢ)`, weights sum to 1.
4. **Caps** — conditions that don't make the activity impossible but should stop it scoring well
   (e.g. thunderstorm for sightseeing). Score = `min(score, cap)`.
5. **Reasons** — up to 3: lowest-scoring factors below 0.5 as negatives, then highest-scoring ≥ 0.8 as
   positives, each with its value ("Gusts up to 65 km/h").

**Why gates and not just low factor scores:** in a weighted sum, one zero factor only removes its
weight. A flat sea with no wind and sunshine would still score ~55 for surfing. Gates encode "this
isn't happening", factors encode "how good is it if it is".

**Labels:** ≥ 80 Great · ≥ 60 Good · ≥ 40 Fair · < 40 Poor · gated = Not possible.

**Weekly score** = mean of the best 3 daily scores (see DECISIONS D6). An activity with all 7 days
gated is *unavailable* and ranked last with the gate reason ("No snow on the ground this week").

**Not done:** discounting later days for forecast uncertainty. Day 7 is shown with the same weight
as day 1. Would add as a confidence indicator rather than a score penalty.

## Data sources

| Measurement | Endpoint / variable | Notes |
|---|---|---|
| temp, apparent temp, precipitation, precip probability, snowfall, weather code, wind, gusts, sunshine, daylight | Forecast API `daily`, `models=best_match` | `timezone=auto`, `past_days=1` (need yesterday's snowfall for skiing) |
| snow depth | Forecast API `hourly=snow_depth`, **`models=ecmwf_ifs025`** | daily max; see finding 1 |
| visibility | Forecast API `hourly=visibility` | mean over 09:00–17:00 local |
| waves, swell period | Marine API `daily` wave_height_max, swell_wave_period_max | single point; see finding 2 |
| place | Geocoding API `/v1/search`, `/v1/get?id=` | |

Both models are fetched in **one** request (`models=best_match,ecmwf_ifs025` returns suffixed keys,
e.g. `snow_depth_ecmwf_ifs025`).

## Findings from real API responses (2026-09-30)

1. **`snow_depth` from the default model is unreliable at model handover.** Zermatt: 0 m for 5 days,
   then 0.45 m from Oct 5 with **0 cm snowfall** all week. Same in `icon_seamless`, absent in
   `ecmwf_ifs025` and `gfs_seamless` — it's the high-res regional model ending and the global model
   taking over with a different snow state. Compared across real ski-season locations:

   | Place (elev.) | best_match | ecmwf_ifs025 | gfs_seamless |
   |---|---|---|---|
   | Valle Nevado, CL (3048 m) | 1.6–1.8 m | 2.2–2.5 m | 0.03–0.16 m |
   | Portillo, CL (2829 m) | 2.2–2.6 m | 1.9–2.3 m | 0.06–0.31 m |
   | Zermatt, CH (1608 m) | 0 → **0.45** m | 0 m | 0 m |

   → Use ECMWF IFS for snow depth: consistent over 7 days and plausible. GFS badly under-reports.
2. **The Marine API already snaps to the nearest sea cell.** Rome (city centre ~25 km inland)
   returned waves from a cell off Ostia ~20 km away; Montpellier ~17 km; Lisbon, Porto, Bilbao,
   Sydney, Cape Town, Honolulu all return data from the city coordinates. Genuinely inland places
   (Bordeaux ~50 km from coast, Madrid, Paris, Innsbruck, Geneva – lakes aren't modelled) return
   `null`. → **Dropped the planned probe ring** (DECISIONS D8, revised). One point is enough; we
   report the distance to the grid cell used ("waves measured ~20 km from the city").
3. **Geocoding:** 1-character queries return nothing, 2 characters exact-match, 3+ fuzzy → the
   combobox searches from 2 characters. No-match responses have **no `results` key** (not an empty
   array). `/v1/get` with an unknown id returns HTTP 400 `{"error":true,"reason":"Location ID not found."}` →
   map to `PLACE_NOT_FOUND`. Non-ASCII names ("Kraków") must be URL-encoded.
4. **Seasonality:** it's late September, so every Northern Hemisphere ski town (Zermatt included,
   despite its year-round glacier skiing at 3800 m) correctly comes out *Not possible*. Test with
   Valle Nevado / Portillo. Zermatt's glacier is the clearest example of the town-point limitation
   (D7).

## Skiing

| | Rule | Why |
|---|---|---|
| Gate | snow depth < 0.3 m | Resorts generally need ~30–50 cm base to open groomed runs. 0.3 is the permissive end. |
| Gate | gusts ≥ 80 km/h | Chairlifts typically stop around 60–80 km/h gusts; above 80 most lifts are closed. **judgement call** |
| Gate | thunderstorm (WMO 95–99) | Lifts close for lightning. |

| Factor | Weight | Curve | Why |
|---|---|---|---|
| Snow depth (m) | 0.30 | 0.3→0.3, 0.6→0.7, 1.0→1 | Deeper base = more open terrain, fewer rocks; saturates ~1 m. |
| Fresh snow, yesterday + today (cm) | 0.20 | 0→0.4, 5→0.7, 15→1 | Fresh snow is what makes a *great* day; 0 is fine (groomed), not bad. |
| Max temperature (°C) | 0.20 | −20→0.2, −15→0.6, −8→1, −2→1, 2→0.6, 6→0.1 | Very cold is unpleasant; above freezing snow turns slushy. |
| Gusts (km/h) | 0.15 | 30→1, 50→0.6, 70→0.2, 80→0 | Wind chill, lift holds. |
| Daytime visibility (km) | 0.10 | 1→0.1, 5→0.6, 20→1 | Flat light / whiteout is the main safety and fun killer. |
| Sunshine fraction | 0.05 | 0→0.5, 0.7→1 | "Bluebird day" bonus; small, since overcast skiing is fine. |

| Cap 35 | max temp ≥ 6 °C | Wet, slushy snow. Added after testing (see Tuning). |

Trade-off: powder-focused skiers would weight fresh snow highest. I weighted base depth higher — for
the average holiday skier, "is there enough snow to ski" matters more than powder; fresh snow is the
differentiator between Good and Great.

## Surfing

| | Rule | Why |
|---|---|---|
| Gate | no marine data at this location | No coast within ~25 km (finding 2). Makes the activity *unavailable*. |
| Gate | wave height < 0.3 m | Flat — nothing to ride. |
| Gate | wave height ≥ 5 m | Big-wave territory; dangerous for everyone but experts. **judgement call** |
| Gate | thunderstorm | Lightning + water. |

| Factor | Weight | Curve | Why |
|---|---|---|---|
| Wave height, significant (m) | 0.35 | 0.3→0.1, 0.6→0.5, 1.0→0.9, 1.2→1, 2.5→1, 3.5→0.5, 4.5→0.1 | Sweet spot for a typical intermediate surfer ~1–2.5 m. |
| Swell period (s) | 0.30 | 5→0, 7→0.3, 10→0.8, 12→1 | Longer period = more powerful, organised waves; < 7 s is wind slop. |
| Wind speed (km/h) | 0.25 | 10→1, 20→0.6, 30→0.25, 40→0 | Strong wind chops up the surface. |
| Apparent max temp (°C) | 0.10 | 5→0.3, 15→0.8, 22→1 | Comfort; wetsuits handle most of it, so small weight. |

Known gaps:
- **Wind direction** (offshore vs onshore) is arguably the biggest factor after swell; needs coastline
  orientation per spot. Cut.
- Wind comes from the forecast at the city point, not at the sea cell. Close enough within ~25 km.
- San Francisco snaps to a cell near the Golden Gate, not Ocean Beach — spot-level accuracy is out of
  scope; this is a city-level tool.
- Tides aren't in Open-Meteo.

## Outdoor sightseeing

| | Rule | Why |
|---|---|---|
| Cap 35 | precipitation ≥ 10 mm | Heavy rain. Added after testing (see Tuning). |
| Cap 30 | thunderstorm | Possible, but shouldn't score well. |
| Cap 30 | gusts ≥ 70 km/h | Same. |

| Factor | Weight | Curve | Why |
|---|---|---|---|
| Precipitation sum (mm) | 0.25 | 0→1, 1→0.8, 5→0.4, 15→0.05 | Rain is the main spoiler. |
| Precipitation probability max (%) | 0.10 | 20→1, 50→0.6, 80→0.2 | Uncertainty of rain affects plans even when the sum is low. |
| Apparent max temp (°C) | 0.30 | −5→0.1, 5→0.4, 15→1, 25→1, 30→0.6, 35→0.15 | Walking comfort; heat is as bad as cold. |
| Max wind (km/h) | 0.20 | 20→1, 35→0.6, 50→0.2 | Unpleasant above ~35 km/h. |
| Sunshine fraction | 0.15 | 0→0.3, 0.5→0.8, 0.7→1 | Nice, not required — overcast is fine for walking. |

Daylight length was considered and dropped: it's nearly constant across a week, so it can't change
the ranking of days.

## Indoor sightseeing

Always available (DECISIONS D9). `score = min(100, 40 + 0.65 × (100 − outdoorScore))`, minus 20 when heavy
snowfall (≥ 10 cm) or gusts ≥ 70 km/h make getting around hard.

- Perfect outdoor day → 40 (*Fair*: "Great weather outside — save the museums for another day").
- Wash-out day → up to 100 (*Great*: "Rain all day — a good day for museums").

**judgement call**, and the most debatable one: it ranks indoor sightseeing as the *alternative* to
outdoor, not on its own merits.

## Tuning found by tests and live data

Scenario tests (`activities.test.ts`) encode what a sensible person would expect, and I ran the
ranking on live forecasts for Biarritz, Nazaré, Warsaw, London and Farellones (Chile). Changes this
caused:

1. **Heavy rain barely hurt outdoor sightseeing.** 20 mm of rain at 6 °C still scored 42–52 (*Fair*),
   because calm wind and mild-ish temperature kept their full weight. Same weighted-sum weakness gates
   fix, but for "ruins it" rather than "impossible" → **cap 35 at ≥ 10 mm**.
2. **A +7 °C, thin-base, overcast ski day scored 48 (*Fair*).** → **cap 35 at ≥ 6 °C** ("wet and
   slushy snow").
3. **Indoor could practically never be *Great*.** Outdoor on a wash-out day bottoms out around 30–35
   (wind etc. still score), so `40 + 0.6 × 65 = 79`. Slope raised to **0.65**, clamped at 100.
4. **Duplicate reasons** ("Heavy rain, 11.6 mm" + "11.6 mm of rain"). A cap can now name the factor it
   *replaces*, so that factor isn't explained twice.
