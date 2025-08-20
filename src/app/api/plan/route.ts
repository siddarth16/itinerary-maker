import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTripId } from '@/lib/utils';
import type { PlanRequest, PlanResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: PlanRequest = await request.json();

    // Validate required fields
    if (!body.destinations || body.destinations.length === 0) {
      return NextResponse.json(
        { error: 'Destinations are required' },
        { status: 400 }
      );
    }

    if (!body.origin) {
      return NextResponse.json(
        { error: 'Origin is required' },
        { status: 400 }
      );
    }

    // Generate deterministic Trip_ID
    const tripId = generateTripId(body);
    
    // Check if this trip already exists
    const existingTrip = await prisma.trip.findUnique({
      where: { tripId }
    });

    if (existingTrip) {
      // Return existing trip
      return NextResponse.json({
        tripId: existingTrip.tripId,
        status: existingTrip.status
      } as PlanResponse);
    }

    // Create new trip
    const trip = await prisma.trip.create({
      data: {
        tripId,
        title: `Trip to ${body.destinations.join(', ')}`,
        currency: body.budget?.currency || 'USD',
        partySize: body.partySize,
        originCity: body.origin,
        originAirportIATA: null, // Will be resolved by geocoding service
        travelWindowStart: new Date(body.travelWindow.start),
        travelWindowEnd: new Date(body.travelWindow.end),
        durationMinDays: body.duration.min,
        durationMaxDays: body.duration.max,
        baggagePcs: body.baggage,
        cabin: body.cabin,
        nightBusAllowed: body.nightBusAllowed,
        refundableOnly: body.refundableOnly,
        maxHops: body.maxHops,
        regionPrefs: body.destinations.join(','),
        excludedCities: body.excludedCities?.join(',') || null,
        notes: body.notes || null,
        status: 'queued'
      }
    });

    // Create request record for tracking
    await prisma.request.create({
      data: {
        tripId: trip.tripId,
        paramsHash: tripId, // Using tripId as params hash since it's deterministic
        status: 'queued'
      }
    });

    // TODO: Queue background job to process the trip planning
    // For now, we'll simulate by updating status immediately
    setTimeout(async () => {
      try {
        await processTrip(tripId);
      } catch (error) {
        console.error('Error processing trip:', error);
        await prisma.trip.update({
          where: { tripId },
          data: { status: 'error' }
        });
      }
    }, 100);

    return NextResponse.json({
      tripId: trip.tripId,
      status: 'queued'
    } as PlanResponse);

  } catch (error) {
    console.error('Error in /api/plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Background job to process trip planning
async function processTrip(tripId: string) {
  try {
    // Update status to running
    await prisma.trip.update({
      where: { tripId },
      data: { status: 'running' }
    });

    const trip = await prisma.trip.findUnique({
      where: { tripId }
    });

    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    // For MVP, we'll use fixture data to create a sample itinerary
    // In production, this would call the provider modules and planner

    // Load fixture data
    const fs = require('fs');
    const path = require('path');

    // Load city tiers for budget calculations
    const cityTiers = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'fixtures', 'city_tiers.json'), 'utf-8')
    );

    // Create sample city plans (Paris -> Brussels for 3 days each)
    const cities = ['Paris', 'Brussels'];
    const startDate = new Date(trip.travelWindowStart);
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const cityTier = cityTiers.find((t: any) => t.city === city) || cityTiers[0];
      const nights = 3;
      
      const checkOut = new Date(currentDate);
      checkOut.setDate(checkOut.getDate() + nights);

      // Create city plan
      await prisma.cityPlan.create({
        data: {
          tripId: trip.tripId,
          day: i * nights + 1,
          date: currentDate,
          city: city,
          country: city === 'Paris' ? 'France' : 'Belgium',
          region: 'Western Europe',
          stayCheckIn: currentDate,
          stayCheckOut: checkOut,
          nights: nights,
          stayName: `Sample ${city} Hotel`,
          stayType: 'Hotel',
          roomType: 'Standard Room',
          stayCancellation: 'Free',
          stayCurrency: 'EUR',
          stayPricePerNight: 80,
          stayNightsSubtotal: 80 * nights,
          stayTaxes: 10 * nights,
          stayTotal: (80 + 10) * nights
        }
      });

      // Create daily budgets for each night
      for (let day = 0; day < nights; day++) {
        const budgetDate = new Date(currentDate);
        budgetDate.setDate(budgetDate.getDate() + day);

        await prisma.dailyBudget.create({
          data: {
            tripId: trip.tripId,
            day: i * nights + day + 1,
            date: budgetDate,
            city: city,
            food: cityTier.food,
            localTransport: cityTier.local_transport,
            activities: cityTier.activities,
            misc: cityTier.misc,
            buffer: cityTier.buffer,
            dailyTotal: cityTier.food + cityTier.local_transport + cityTier.activities + cityTier.misc + cityTier.buffer
          }
        });
      }

      currentDate = new Date(checkOut);
    }

    // Create sample transport legs
    if (cities.length > 1) {
      // Ground transport between cities
      await prisma.transportLeg.create({
        data: {
          legId: `${tripId}_ground_1`,
          tripId: trip.tripId,
          seq: 1,
          fromCity: 'Paris',
          fromCode: 'Gare du Nord',
          toCity: 'Brussels',
          toCode: 'Midi',
          mode: 'Train',
          carrier: 'Thalys',
          serviceNo: 'THA9341',
          departLocal: new Date('2025-09-08T10:25:00'),
          arriveLocal: new Date('2025-09-08T11:47:00'),
          durationMin: 82,
          bagsIncluded: 2,
          totalPrice: 45.00,
          currency: 'EUR',
          nonstop: true,
          refundability: 'Refundable',
          bookingLink: 'https://thalys.com/paris-brussels-2025-09-08',
          source: 'Thalys',
          retrievedAtUtc: new Date()
        }
      });
    }

    // Create costs summary
    const stayTotal = cities.length * 3 * 90; // 90 EUR per night including taxes
    const dailyBudgetsTotal = cities.length * 3 * 125; // Average daily budget
    const groundTotal = 45; // One train ticket
    const flightsTotal = 550; // Round trip flights (converted to EUR)
    const grandTotal = stayTotal + dailyBudgetsTotal + groundTotal + flightsTotal;

    await prisma.costsSummary.create({
      data: {
        tripId: trip.tripId,
        flightsTotal: flightsTotal,
        groundTotal: groundTotal,
        stayTotal: stayTotal,
        dailyBudgetsTotal: dailyBudgetsTotal,
        serviceFee: 25,
        bufferPercent: 0.05,
        grandTotal: grandTotal + 25 + (grandTotal * 0.05),
        perPersonTotal: (grandTotal + 25 + (grandTotal * 0.05)) / trip.partySize
      }
    });

    // Update trip status to completed
    await prisma.trip.update({
      where: { tripId },
      data: { 
        status: 'completed',
        priceTimestamp: new Date()
      }
    });

    console.log(`Trip ${tripId} processing completed successfully`);

  } catch (error) {
    console.error(`Error processing trip ${tripId}:`, error);
    await prisma.trip.update({
      where: { tripId },
      data: { status: 'error' }
    });
  }
}