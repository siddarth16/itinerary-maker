// Data contracts based on project specification

export interface TripParams {
  Trip_ID: string;
  Title: string;
  Currency: string;
  Party_Size: number;
  Origin_City: string;
  Origin_Airport_IATA?: string;
  Travel_Window_Start: string; // YYYY-MM-DD
  Travel_Window_End: string; // YYYY-MM-DD
  Duration_Min_Days: number;
  Duration_Max_Days: number;
  Baggage_Pcs: number;
  Cabin: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  Night_Bus_Allowed: boolean;
  Refundable_Only: boolean;
  Max_Hops: number;
  Region_Prefs?: string;
  Excluded_Cities?: string;
  Notes?: string;
  Date_Generated: string; // UTC timestamp
  Price_Timestamp?: string; // UTC timestamp
}

export interface CityPlan {
  Day: number;
  Date: string; // YYYY-MM-DD
  City: string;
  Country: string;
  Region: string;
  Latitude?: number;
  Longitude?: number;
  Stay_CheckIn: string; // YYYY-MM-DD
  Stay_CheckOut: string; // YYYY-MM-DD
  Nights: number;
  Stay_Name: string;
  Stay_Type: 'Hostel' | 'Hotel' | 'Apartment';
  Room_Type: string;
  Stay_Cancellation: 'Free' | 'Partial' | 'Nonref';
  Stay_Link?: string;
  Stay_Currency: string;
  Stay_Price_Per_Night: number;
  Stay_Nights_Subtotal: number;
  Stay_Taxes: number;
  Stay_Total: number;
  Activities_Notes?: string;
}

export interface TransportLeg {
  Leg_ID: string;
  Seq: number;
  From_City: string;
  From_Code: string;
  To_City: string;
  To_Code: string;
  Mode: 'Flight' | 'Bus' | 'Train' | 'Ferry';
  Carrier: string;
  Service_No: string;
  Depart_Local: string; // YYYY-MM-DD HH:mm
  Arrive_Local: string; // YYYY-MM-DD HH:mm
  Duration_Min: number;
  Bags_Included: number;
  Fare_Base?: number;
  Taxes_Fees?: number;
  Total_Price: number;
  Currency: string;
  Nonstop: boolean;
  Refundability: 'Nonref' | 'Partial' | 'Refundable';
  Booking_Link?: string;
  Notes?: string;
  Source: string;
  Retrieved_At_UTC: string;
}

export interface DailyBudget {
  Day: number;
  Date: string; // YYYY-MM-DD
  City: string;
  Food: number;
  Local_Transport: number;
  Activities: number;
  Misc: number;
  Buffer: number;
  Daily_Total: number;
}

export interface CostsSummary {
  Flights_Total: number;
  Ground_Total: number;
  Stay_Total: number;
  Daily_Budgets_Total: number;
  Service_Fee?: number;
  Buffer_Percent?: number;
  Grand_Total: number;
  Per_Person_Total: number;
}

export interface PaywallView {
  Day: number;
  Date: string; // YYYY-MM-DD
  City: string;
  Daily_Total: number;
  Cumulative_Total: number;
}

// Normalized offer types from providers
export interface FlightOffer {
  type: 'flight';
  from_city: string;
  from_code: string;
  to_city: string;
  to_code: string;
  depart_local: string; // YYYY-MM-DD HH:mm
  arrive_local: string; // YYYY-MM-DD HH:mm
  carrier: string;
  service_no: string;
  duration_min: number;
  bags_included: number;
  fare_base?: number;
  taxes_fees?: number;
  total_price: number;
  currency: string;
  nonstop: boolean;
  refundable: 'Nonref' | 'Partial' | 'Refundable';
  booking_link?: string;
  source: string;
  retrieved_at_utc: string;
}

export interface StayOffer {
  type: 'stay';
  city: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  nights: number;
  name: string;
  stay_type: 'Hostel' | 'Hotel' | 'Apartment';
  room_type: string;
  cancellation: 'Free' | 'Partial' | 'Nonref';
  price_per_night: number;
  taxes: number;
  currency: string;
  link?: string;
  source: string;
  retrieved_at_utc: string;
}

export interface GroundOffer {
  type: 'ground';
  mode: 'Bus' | 'Train' | 'Ferry';
  from_city: string;
  from_code: string;
  to_city: string;
  to_code: string;
  depart_local: string; // YYYY-MM-DD HH:mm
  arrive_local: string; // YYYY-MM-DD HH:mm
  duration_min: number;
  carrier: string;
  service_no: string;
  bags_included: number;
  total_price: number;
  currency: string;
  refundable: 'Nonref' | 'Partial' | 'Refundable';
  booking_link?: string;
  source: string;
  retrieved_at_utc: string;
}

export type Offer = FlightOffer | StayOffer | GroundOffer;

// API request/response types
export interface SearchRequest {
  origin: string;
  destinations: string[];
  date_ranges: Array<{
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  }>;
  pax: {
    adults: number;
    children: number;
    infants: number;
  };
  baggage_pcs: number;
  cabin: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  constraints: {
    max_hops: number;
    night_bus: boolean;
    refundable_only: boolean;
  };
  currency: string;
}

export interface PlanRequest {
  destinations: string[];
  origin: string;
  travelWindow: {
    start: string;
    end: string;
  };
  duration: {
    min: number;
    max: number;
  };
  budget?: {
    min?: number;
    max?: number;
    currency: string;
    perPerson: boolean;
  };
  partySize: number;
  baggage: number;
  cabin: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  nightBusAllowed: boolean;
  refundableOnly: boolean;
  maxHops: number;
  excludedCities?: string[];
  notes?: string;
}

export interface PlanResponse {
  tripId: string;
  status: 'queued' | 'running' | 'completed' | 'error';
}

export interface ProgressResponse {
  tripId: string;
  status: 'queued' | 'running' | 'completed' | 'error';
  progress?: number;
  message?: string;
  candidateRoutes?: PaywallView[][];
}

export interface ItineraryResponse {
  tripId: string;
  params: TripParams;
  paywall: PaywallView[];
  grandTotal: number;
  perPersonTotal: number;
  unlocked: boolean;
}

export interface FullItineraryResponse extends ItineraryResponse {
  cityPlans: CityPlan[];
  transportLegs: TransportLeg[];
  dailyBudgets: DailyBudget[];
  costsSummary: CostsSummary;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

// City tier data for budget calculations
export interface CityTier {
  city: string;
  tier: number;
  food: number;
  local_transport: number;
  activities: number;
  misc: number;
  buffer: number;
}

// Input form types
export interface FormDestination {
  id: string;
  value: string;
  resolved?: {
    city: string;
    country: string;
    region: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface FormData {
  // Step 1: Destinations
  destinations: FormDestination[];
  origin: string;
  
  // Step 2: Travel details
  travelWindow: {
    start: string;
    end: string;
  };
  duration: {
    min: number;
    max: number;
  };
  
  // Step 3: Budget & party
  budget: {
    min?: number;
    max?: number;
    currency: string;
    perPerson: boolean;
  };
  partySize: number;
  
  // Step 4: Preferences
  baggage: number;
  cabin: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  nightBusAllowed: boolean;
  refundableOnly: boolean;
  maxHops: number;
  excludedCities: string[];
  notes: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isValid: (data: Partial<FormData>) => boolean;
}