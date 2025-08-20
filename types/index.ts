export interface Params {
  tripId: string
  title: string
  currency: string
  partySize: number
  originCity: string
  originIATA?: string
  windowStart: string
  windowEnd: string
  durationMin: number
  durationMax: number
  baggagePcs: number
  cabin: "Economy" | "PremiumEconomy" | "Business" | "First"
  nightBusAllowed: boolean
  refundableOnly: boolean
  maxHops: number
  regionPrefs?: string[]
  excludedCities?: string[]
  notes?: string
  dateGenerated?: string
  priceTimestamp?: string
}

export interface RouteCandidate {
  id: string
  title: string
  dateRange: string
  hops: number
  legsSummary: string[]
  badges: string[]
  costs: {
    flights: number
    ground: number
    stays: number
    daily: number
    total: number
    currency: string
  }
}

export interface TransportLegVM {
  seq: number
  mode: "Flight" | "Bus" | "Train" | "Ferry"
  fromCity: string
  fromCode?: string
  toCity: string
  toCode?: string
  departLocal: string
  arriveLocal: string
  durationMin: number
  bagsIncluded?: number
  refundable?: "Nonref" | "Partial" | "Refundable"
  totalPrice?: number
  currency?: string
  bookingLink?: string
  source?: string
}

export interface StayVM {
  city: string
  checkIn: string
  checkOut: string
  nights: number
  name: string
  type: "Hostel" | "Hotel" | "Apartment"
  roomType?: string
  cancellation?: "Free" | "Partial" | "Nonref"
  pricePerNight?: number
  taxes?: number
  currency?: string
  total?: number
  link?: string
}

export interface DailyBudgetVM {
  day: number
  date: string
  city: string
  food: number
  localTransport: number
  activities: number
  misc: number
  buffer: number
  total: number
}

export interface CostSummaryVM {
  flightsTotal: number
  groundTotal: number
  stayTotal: number
  dailyBudgetsTotal: number
  serviceFee?: number
  bufferPercent?: number
  grandTotal: number
  perPersonTotal: number
  currency: string
}

export interface ItineraryDay {
  day: number
  date: string
  city: string
  country: string
  activities: string[]
  dailyTotal: number
  isLocked?: boolean
}
