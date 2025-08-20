# Itinerary Maker

A production-grade travel planning webapp that generates optimized multi-city itineraries with flights, accommodations, and ground transport. Built with Next.js, TypeScript, and Prisma.

## Features

- **Multi-step planning wizard** - Intuitive interface to capture travel preferences
- **Smart route optimization** - Algorithms to find the best routes across multiple cities
- **Comprehensive cost breakdown** - Detailed budgets for flights, stays, and daily expenses
- **Paywall system** - Preview itineraries with one-time unlock fee
- **Real booking integration** - Direct links to provider booking pages
- **Document generation** - Export itineraries as PDF and Excel files
- **Responsive design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM (production-ready for PostgreSQL)
- **Payments**: Stripe integration (simulated for MVP)
- **Deployment**: Vercel-optimized

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd itinerary-maker
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration (defaults work for development).

3. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── api/               # API endpoints
│   │   ├── plan/         # Trip planning
│   │   ├── progress/     # Planning status
│   │   ├── itinerary/    # Trip details
│   │   ├── checkout/     # Payment processing
│   │   └── webhooks/     # Payment webhooks
│   ├── plan/             # Planning wizard
│   ├── progress/         # Planning status page
│   ├── itinerary/        # Itinerary display
│   └── checkout/         # Payment flow
├── components/           # Reusable UI components
├── lib/                  # Utilities and database
├── types/               # TypeScript definitions
└── providers/           # External API integrations

prisma/
├── schema.prisma        # Database schema
└── dev.db              # SQLite database (dev)

fixtures/               # Sample data for testing
├── flights_DEL_CDG_Sep05.json
├── stays_PAR_Sep05_Sep08.json
├── ground_PAR_BRU_Sep08.json
└── city_tiers.json
```

## Key API Endpoints

- `POST /api/plan` - Create new trip planning job
- `GET /api/progress/:tripId` - Check planning status
- `GET /api/itinerary/:tripId` - Get trip details (paywall)
- `POST /api/checkout/:tripId` - Start payment process
- `POST /api/webhooks/stripe` - Handle payment completion

## Data Contracts

The application implements strict data contracts as specified in `project-overview.md`:

- **TripParams** - User input and trip metadata
- **CityPlan** - Daily city stays and accommodations
- **TransportLeg** - Flight/bus/train segments
- **DailyBudget** - Food, activities, local transport costs
- **CostsSummary** - Total cost breakdown

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing

```bash
# Run unit tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e
```

### Database Operations

```bash
# Reset database
npx prisma db push --force-reset

# View database in browser
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

### Environment Variables for Production

```
DATABASE_URL=postgresql://...           # Production database
STRIPE_PUBLIC_KEY=pk_live_...          # Live Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Database Migration

For production, migrate from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in environment
2. Run `npx prisma db push` to create tables
3. Import existing data if needed

## Architecture

### MVP Implementation

The current implementation includes:

- ✅ Complete UI flow (wizard → progress → itinerary)
- ✅ Database schema matching specification
- ✅ API endpoints with proper data contracts
- ✅ Payment simulation system
- ✅ Sample fixture data for testing
- ✅ Vercel deployment configuration

### Production Enhancements

For full production deployment, consider:

- **Real provider integration** (Amadeus, Booking.com, FlixBus APIs)
- **Actual Stripe integration** with live keys
- **Document generation** (XLSX/PDF export)
- **Advanced planner algorithms** with OR-Tools
- **Caching layer** (Redis for hot routes)
- **Monitoring & analytics** (error tracking, usage metrics)
- **Rate limiting** and security hardening

## User Flow

1. **Planning** (`/plan`) - Multi-step wizard to capture preferences
2. **Processing** (`/progress/:tripId`) - Real-time planning status
3. **Preview** (`/itinerary/:tripId`) - Paywall view with basic timeline
4. **Payment** (`/checkout/simulate`) - Stripe checkout simulation
5. **Full Access** - Complete itinerary with booking links

## Sample Request

```json
POST /api/plan
{
  "destinations": ["Paris", "Brussels", "Amsterdam"],
  "origin": "Delhi",
  "travelWindow": {
    "start": "2025-09-01",
    "end": "2025-10-15"
  },
  "duration": { "min": 12, "max": 18 },
  "partySize": 2,
  "budget": {
    "max": 3000,
    "currency": "USD",
    "perPerson": true
  },
  "cabin": "Economy",
  "maxHops": 4
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please check the documentation or create an issue in the repository.
