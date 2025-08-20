# Project Overview

You are an expert software architect and full‑stack implementer. Build a production‑grade MVP for a travel‑planning webapp with the following **product goals, architecture, data contracts, and acceptance criteria**. Output complete, modular code and explain key decisions inline as comments. Follow the schema and routes exactly so the generated system is immediately runnable and testable.

---

## 1) Product Summary

A webapp that takes **trip preferences** (destinations, duration, months, budget, baggage) and produces **optimized itineraries** across flights, stays (hostels/hotels), and intercity ground transport (bus/train/ferry). It emits:
- A **paywall preview** showing only Day/Date/City and Grand Total.
- A **full itinerary** (post‑payment) with detailed transport legs, stays, daily budgets, totals, book‑now links, and downloadable **XLSX + PDF**.

The system consists of:
- **Frontend (Next.js)**: input wizard, results list, pre‑paywall view, checkout page, unlocked view, downloads.
- **Backend (FastAPI or Node)**: planning API, data acquisition jobs, normalization, itinerary builder, document generator, payment webhooks.
- **Workers (Playwright)**: provider modules that fetch public result pages where feasible; deep‑link fallbacks; configurable search windows.
- **Storage (SQLite → Postgres ready)**: persist requests, normalized offers, generated itineraries, and payment state.

---

## 2) Key User Stories

1. As a user, I enter **destinations** (cities/countries/continents), **duration**, **months**, **budget**, **party size**, and **baggage**.
2. I receive **3 candidate route plans** with a headline total and a day‑by‑day preview (cities only).
3. I pay a **one‑time fee** to unlock all details and download XLSX/PDF.
4. I can regenerate with small tweaks (shift dates, add/remove cities) without re‑entering everything.
5. I can click **book‑now links** for flights, stays, and ground legs directly from the unlocked view.

---

## 3) Inputs & UI Wizard

Collect the following in a multi‑step form:
- Destinations: free‑text list (accept cities, countries, or continents). Resolve to a concrete city list.
- Origin(s): free‑text (airport/city). Resolve to IATA where applicable.
- Months of travel: start–end month (e.g., "Sep–Oct 2025").
- Duration: min/max days (e.g., 12–18).
- Budget (per person or total): numeric range + currency.
- Party size: integer.
- Baggage: integer pieces per traveler.
- Cabin class: Economy | PremiumEconomy | Business | First.
- Night buses allowed: boolean.
- Refundable only: boolean.
- Max intercity hops: integer (e.g., 4).
- Excluded cities: optional list.
- Notes: free‑text.

---

## 4) Canonical Data Contracts (MUST implement)

### 4.1 Params (key–value document)
```
{
  "Trip_ID": "uuid/slug",
  "Title": "Euro Trip Sep 2025",
  "Currency": "INR",
  "Party_Size": 1,
  "Origin_City": "Delhi",
  "Origin_Airport_IATA": "DEL",
  "Travel_Window_Start": "YYYY-MM-DD",
  "Travel_Window_End": "YYYY-MM-DD",
  "Duration_Min_Days": 12,
  "Duration_Max_Days": 18,
  "Baggage_Pcs": 1,
  "Cabin": "Economy",
  "Night_Bus_Allowed": false,
  "Refundable_Only": false,
  "Max_Hops": 4,
  "Region_Prefs": "Western Europe,Balkans",
  "Excluded_Cities": "Venice",
  "Notes": "Any planner notes",
  "Date_Generated": "UTC timestamp",
  "Price_Timestamp": "UTC timestamp"
}
```

### 4.2 City_Plan (one row per city‑stay day block)
| Field | Type | Notes |
|---|---|---|
| Day | int | Day number |
| Date | date | YYYY‑MM‑DD |
| City | string | e.g., Paris |
| Country | string | e.g., France |
| Region | string | e.g., Western Europe |
| Latitude | number | optional |
| Longitude | number | optional |
| Stay_CheckIn | date | YYYY‑MM‑DD |
| Stay_CheckOut | date | YYYY‑MM‑DD |
| Nights | int | computed |
| Stay_Name | string | display name |
| Stay_Type | enum | Hostel \| Hotel \| Apartment |
| Room_Type | string | "8‑bed dorm", etc. |
| Stay_Cancellation | enum | Free \| Partial \| Nonref |
| Stay_Link | url | deep link |
| Stay_Currency | string | ISO code |
| Stay_Price_Per_Night | number | per night |
| Stay_Nights_Subtotal | number | Nights * price/night |
| Stay_Taxes | number | taxes/fees |
| Stay_Total | number | subtotal + taxes |
| Activities_Notes | string | optional |

### 4.3 Transport_Legs (intercity segments)
| Field | Type | Notes |
|---|---|---|
| Leg_ID | string | unique |
| Seq | int | order in route |
| From_City | string | |
| From_Code | string | IATA/station |
| To_City | string | |
| To_Code | string | IATA/station |
| Mode | enum | Flight \| Bus \| Train \| Ferry |
| Carrier | string | |
| Service_No | string | flight/bus/train id |
| Depart_Local | datetime | "YYYY‑MM‑DD HH:mm" |
| Arrive_Local | datetime | "YYYY‑MM‑DD HH:mm" |
| Duration_Min | int | minutes |
| Bags_Included | int | count |
| Fare_Base | number | optional |
| Taxes_Fees | number | optional |
| Total_Price | number | total |
| Currency | string | ISO |
| Nonstop | bool | |
| Refundability | enum | Nonref \| Partial \| Refundable |
| Booking_Link | url | deep link |
| Notes | string | |
| Source | string | provider name |
| Retrieved_At_UTC | datetime | timestamp |

### 4.4 Daily_Budgets (soft costs per day)
| Field | Type | Notes |
|---|---|---|
| Day | int | |
| Date | date | |
| City | string | |
| Food | number | |
| Local_Transport | number | |
| Activities | number | |
| Misc | number | |
| Buffer | number | |
| Daily_Total | number | sum |

### 4.5 Costs_Summary (computed or written values)
- **Flights_Total** = SUM of `Total_Price` where `Mode == "Flight"`  
- **Ground_Total** = SUM of `Total_Price` where `Mode in {"Bus","Train","Ferry"}`  
- **Stay_Total** = SUM of `City_Plan.Stay_Total`  
- **Daily_Budgets_Total** = SUM of `Daily_Budgets.Daily_Total`  
- **Service_Fee** = numeric (optional)  
- **Buffer_Percent** = numeric (e.g., 0.05)  
- **Grand_Total** = Flights_Total + Ground_Total + Stay_Total + Daily_Budgets_Total + Service_Fee + (Buffer_Percent * (Flights_Total + Ground_Total + Stay_Total + Daily_Budgets_Total))  
- **Per_Person_Total** = Grand_Total / Party_Size

### 4.6 Paywall_View (what preview shows)
| Field | Type |
|---|---|
| Day | int |
| Date | date |
| City | string |
| Daily_Total | number |
| Cumulative_Total | number |

Also emit a **JSON export** mirroring the same fields for API consumers.

---

## 5) System Architecture

- **Next.js (App Router) + Tailwind + shadcn/ui** for UI flows and SSR/SPA mix.  
- **Backend**: choose **FastAPI (Python)** or **Express/NestJS (TypeScript)**; expose REST endpoints.  
- **Workers**: Playwright tasks for data acquisition, run via job endpoints.  
- **DB**: SQLite for MVP using Prisma/SQLModel. Tables: `trips`, `requests`, `offers_raw`, `offers_normalized`, `itineraries`, `payments`.  
- **Docs**: XLSX with strict column order; PDF via browser print‑to‑PDF.  
- **Payments**: Stripe Checkout (one‑time). Webhook updates unlock state.  
- **Caching**: Redis or in‑process cache for hot routes/date windows.  
- **IDs**: deterministic `Trip_ID` based on normalized inputs (hash).

---

## 6) API Surface (must implement)

### Public
- `POST /api/plan` → create planning job from user inputs; returns `Trip_ID`.
- `GET /api/progress/:tripId` → job status (queued/running/done) + partial results.
- `POST /api/build/:tripId` → assemble best itinerary + write artifacts.
- `POST /api/checkout/:tripId` → create Stripe Checkout session; return URL.
- `POST /api/webhooks/stripe` → confirm payment; mark itinerary unlocked.
- `GET /api/itinerary/:tripId` → pre‑paywall JSON (Paywall_View only).
- `GET /api/download/:tripId?format=xlsx|pdf` → gated download link.

### Internal (workers)
- `POST /internal/search/flights`
- `POST /internal/search/stays`
- `POST /internal/search/ground`
- `POST /internal/normalize`

**All search endpoints accept a common structure**:
```
{
  "origin": "...",
  "destinations": ["...","..."],
  "date_ranges": [{"start":"YYYY-MM-DD","end":"YYYY-MM-DD"}],
  "pax": {"adults":1, "children":0, "infants":0},
  "baggage_pcs": 1,
  "cabin": "Economy",
  "constraints": {"max_hops":4, "night_bus":false, "refundable_only":false},
  "currency": "INR"
}
```

---

## 7) Provider Modules & Normalization

Implement pluggable provider modules with a shared interface for **flights**, **stays**, and **ground**. Each module may fetch public results pages using Playwright or return **deep‑link templates** when direct acquisition isn't available.

Normalize all outputs to the **FlightOffer / StayOffer / GroundOffer** contracts below.

### FlightOffer (normalized JSON)
```
{
  "type": "flight",
  "from_city": "Delhi",
  "from_code": "DEL",
  "to_city": "Paris",
  "to_code": "CDG",
  "depart_local": "2025-09-05 02:15",
  "arrive_local": "2025-09-05 07:50",
  "carrier": "AF",
  "service_no": "AF225",
  "duration_min": 455,
  "bags_included": 1,
  "fare_base": 26850.00,
  "taxes_fees": 3850.00,
  "total_price": 30700.00,
  "currency": "INR",
  "nonstop": false,
  "refundable": "Nonref",
  "booking_link": "https://...",
  "source": "ProviderName",
  "retrieved_at_utc": "2025-08-21 18:55:12"
}
```

### StayOffer
```
{
  "type": "stay",
  "city": "Paris",
  "check_in": "2025-09-05",
  "check_out": "2025-09-08",
  "nights": 3,
  "name": "Hostel XYZ",
  "stay_type": "Hostel",
  "room_type": "8-bed dorm",
  "cancellation": "Free",
  "price_per_night": 28.5,
  "taxes": 5.2,
  "currency": "EUR",
  "link": "https://...",
  "source": "ProviderName",
  "retrieved_at_utc": "2025-08-21 18:55:12"
}
```

### GroundOffer
```
{
  "type": "ground",
  "mode": "Bus",
  "from_city": "Paris",
  "from_code": "Bercy",
  "to_city": "Brussels",
  "to_code": "North",
  "depart_local": "2025-09-08 08:30",
  "arrive_local": "2025-09-08 12:05",
  "duration_min": 215,
  "carrier": "CarrierName",
  "service_no": "1234",
  "bags_included": 1,
  "total_price": 19.99,
  "currency": "EUR",
  "refundable": "Partial",
  "booking_link": "https://...",
  "source": "ProviderName",
  "retrieved_at_utc": "2025-08-21 18:55:12"
}
```

---

## 8) Planner / Optimizer

- Build candidate city sequences up to `Max_Hops` across the resolved city set.
- Score sequences with a **weighted cost function** combining:
  - total monetary cost (flights + ground + stays + daily budgets)
  - total travel time
  - number of transfers/hops
  - nights saved by overnight ground legs (if enabled)
  - refundability and baggage inclusion weights
- Choose top 3 sequences and allocate nights per city to balance budget vs. transit time.
- Allow toggles to bias towards fewer hops, lowest price, or balanced plan.

**Optional**: integrate OR‑Tools CP‑SAT or a beam search over sequences to prune the space; expose weights in config.

---

## 9) Itinerary Builder

- Stitch **Transport_Legs** between consecutive cities, respecting date windows.  
- Assign a single **Stay** per city segment that fits nightly cap and cancellation preference.  
- Compute **Daily_Budgets** using a **city price tier** table (static JSON for MVP).  
- Generate **Paywall_View** (Day, Date, City, Daily_Total, Cumulative_Total).  
- Compute **Costs_Summary** and **Grand_Total / Per_Person_Total**.

---

## 10) Document Generation

- Produce **XLSX** with sheets in this exact column order (see Data Contracts).  
- Produce **PDF** from the unlocked itinerary HTML (print‑to‑PDF).  
- Store artifacts under `/artifacts/<Trip_ID>/` with deterministic names:
  - `Itinerary_<Trip_ID>.xlsx`
  - `Itinerary_<Trip_ID>.pdf`
  - `Itinerary_<Trip_ID>.json`

---

## 11) Payments & Unlock Flow

- `POST /api/checkout/:tripId` creates a checkout session and returns a URL.  
- Webhook marks the itinerary as unlocked and issues signed download links.  
- Pre‑paywall page shows Paywall_View + rounded Grand Total and a CTA to pay.  
- Post‑paywall page shows full itinerary and download buttons.

---

## 12) Caching, Idempotency, Logging

- Compute a deterministic hash of normalized inputs → `Trip_ID`.  
- Cache intermediate provider results for common routes/date windows.  
- Log each provider call with: params snapshot, latency, `retrieved_at_utc`, and offer counts.  
- Repeated runs with same inputs reuse cached offers unless a "force refresh" flag is set.

---

## 13) Testing

- **Unit**: normalization mappers (raw → normalized offers), planner scoring, budget totals.  
- **Golden files**: given fixtures, the generated XLSX must match expected sheet names, headers, and row counts.  
- **E2E**: minimal flow `DEL → CDG → BRU → DEL` with fixtures only; verify `Grand_Total` and `Per_Person_Total` calculations.

---

## 14) Dev Experience

- Provide `Makefile`/`npm scripts` for:
  - `dev` (frontend + backend + workers)
  - `test`
  - `build`
  - `start`
- Include `.env.example` and a `fixtures/` directory with JSON offers for flights/stays/ground.
- Seed command to populate city tiers and holiday lookups.

---

## 15) Deployment

- Containerize services (Docker).  
- Single‑process MVP acceptable (API + workers in one), with an easy path to split later.  
- Provide a one‑click deployment script for Render/Cloud Run.

---

## 16) Acceptance Criteria (Definition of Done)

- Given valid inputs, the system returns **3 candidate itineraries** with Paywall_View ready.  
- `POST /api/build/:tripId` produces **XLSX + PDF + JSON** artifacts with correct schemas.  
- Checkout → webhook → unlocked downloads function end‑to‑end.  
- Deep‑links render bookable provider pages with prefilled params.  
- Re‑runs with identical inputs reuse cached results and return the same Trip_ID.

---

## 17) Sample Fixtures (for deterministic first run)

Provide in `/fixtures/`:
- `flights_DEL_CDG_Sep05.json` (2–3 offers, mixed bags/refundability)
- `ground_PAR_BRU_Sep08.json` (2 offers)
- `stays_PAR_Sep05_Sep08.json` (3 options, hostel/hotel mix)
- `city_tiers.json` (food/local/activities defaults per city or tier)

Use these to generate a fully populated itinerary without external calls.

---

## 18) UI Notes

- **/plan**: multi‑step wizard with progress indicator.  
- **/itinerary/[tripId]** (pre‑paywall): timeline of days (City + Date), grand total, "Unlock full plan" button.  
- **/itinerary/[tripId]** (post‑paywall): tabs → Overview, Transport, Stays, Daily Budget, Downloads.  
- Cards show carrier, time range, duration, fare, refundability badges, and "Open link".  
- Sticky cost summary panel with totals and per‑person figure.

---

## 19) Deliverables

- Full codebase (frontend/backend/workers) with comprehensive inline comments.  
- Postman collection or HTTPie scripts covering all endpoints.  
- README with setup, environment variables, dev commands, and deployment steps.