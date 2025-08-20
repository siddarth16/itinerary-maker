import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';
import type { PlanRequest } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate deterministic Trip_ID based on normalized inputs
export function generateTripId(request: PlanRequest): string {
  // Normalize the request to ensure consistent hashing
  const normalized = {
    destinations: request.destinations.map(d => d.toLowerCase().trim()).sort(),
    origin: request.origin.toLowerCase().trim(),
    travelWindow: request.travelWindow,
    duration: request.duration,
    partySize: request.partySize,
    baggage: request.baggage,
    cabin: request.cabin,
    nightBusAllowed: request.nightBusAllowed,
    refundableOnly: request.refundableOnly,
    maxHops: request.maxHops,
    excludedCities: (request.excludedCities || []).map(c => c.toLowerCase().trim()).sort(),
    // Don't include budget, notes, or dates in the hash for better reusability
  };

  const hash = crypto.createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
  
  return hash.substring(0, 16); // 16 character trip ID
}

// Generate deterministic hash for search parameters
export function generateSearchParamsHash(params: any): string {
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');
  
  return hash.substring(0, 16);
}

// Format currency
export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}

// Format duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Format date range
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const startFormatted = formatter.format(startDate);
  const endFormatted = formatter.format(endDate);
  
  return `${startFormatted} - ${endFormatted}`;
}

// Validate IATA code
export function isValidIATA(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

// Parse city/airport input to extract IATA if present
export function parseOriginInput(input: string): { city: string; iata?: string } {
  const trimmed = input.trim();
  const iataMatch = trimmed.match(/\(([A-Z]{3})\)$/);
  
  if (iataMatch) {
    return {
      city: trimmed.replace(/\s*\([A-Z]{3}\)$/, ''),
      iata: iataMatch[1]
    };
  }
  
  // Check if the entire input is a valid IATA code
  if (isValidIATA(trimmed)) {
    return {
      city: trimmed, // We'll resolve the city name later
      iata: trimmed
    };
  }
  
  return {
    city: trimmed
  };
}

// Sleep utility for development delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}