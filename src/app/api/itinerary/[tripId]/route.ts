import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ItineraryResponse, FullItineraryResponse, PaywallView, CityPlan, TransportLeg, DailyBudget, CostsSummary } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: { tripId },
      include: {
        cityPlans: {
          orderBy: { day: 'asc' }
        },
        transportLegs: {
          orderBy: { seq: 'asc' }
        },
        dailyBudgets: {
          orderBy: { day: 'asc' }
        },
        costsSummary: true,
        payments: {
          where: { status: 'completed' }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    if (trip.status !== 'completed') {
      return NextResponse.json(
        { error: 'Trip is not yet completed' },
        { status: 400 }
      );
    }

    // Check if trip is unlocked (payment completed)
    const isUnlocked = trip.paymentStatus === 'paid' || trip.payments.length > 0;

    // Generate paywall view
    const paywallView: PaywallView[] = [];
    let cumulativeTotal = 0;

    trip.dailyBudgets.forEach((budget: any) => {
      const dailyTotal = budget.dailyTotal;
      cumulativeTotal += dailyTotal;

      paywallView.push({
        Day: budget.day,
        Date: budget.date.toISOString().split('T')[0],
        City: budget.city,
        Daily_Total: dailyTotal,
        Cumulative_Total: cumulativeTotal
      });
    });

    // Base response with paywall view
    const baseResponse: ItineraryResponse = {
      tripId: trip.tripId,
      params: {
        Trip_ID: trip.tripId,
        Title: trip.title,
        Currency: trip.currency,
        Party_Size: trip.partySize,
        Origin_City: trip.originCity,
        Origin_Airport_IATA: trip.originAirportIATA || undefined,
        Travel_Window_Start: trip.travelWindowStart.toISOString().split('T')[0],
        Travel_Window_End: trip.travelWindowEnd.toISOString().split('T')[0],
        Duration_Min_Days: trip.durationMinDays,
        Duration_Max_Days: trip.durationMaxDays,
        Baggage_Pcs: trip.baggagePcs,
        Cabin: trip.cabin as any,
        Night_Bus_Allowed: trip.nightBusAllowed,
        Refundable_Only: trip.refundableOnly,
        Max_Hops: trip.maxHops,
        Region_Prefs: trip.regionPrefs || undefined,
        Excluded_Cities: trip.excludedCities || undefined,
        Notes: trip.notes || undefined,
        Date_Generated: trip.dateGenerated.toISOString(),
        Price_Timestamp: trip.priceTimestamp?.toISOString()
      },
      paywall: paywallView,
      grandTotal: trip.costsSummary?.grandTotal || 0,
      perPersonTotal: trip.costsSummary?.perPersonTotal || 0,
      unlocked: isUnlocked
    };

    // If not unlocked, return only paywall view
    if (!isUnlocked) {
      return NextResponse.json(baseResponse);
    }

    // If unlocked, return full itinerary
    const cityPlans: CityPlan[] = trip.cityPlans.map(plan => ({
      Day: plan.day,
      Date: plan.date.toISOString().split('T')[0],
      City: plan.city,
      Country: plan.country,
      Region: plan.region,
      Latitude: plan.latitude || undefined,
      Longitude: plan.longitude || undefined,
      Stay_CheckIn: plan.stayCheckIn.toISOString().split('T')[0],
      Stay_CheckOut: plan.stayCheckOut.toISOString().split('T')[0],
      Nights: plan.nights,
      Stay_Name: plan.stayName,
      Stay_Type: plan.stayType as any,
      Room_Type: plan.roomType,
      Stay_Cancellation: plan.stayCancellation as any,
      Stay_Link: plan.stayLink || undefined,
      Stay_Currency: plan.stayCurrency,
      Stay_Price_Per_Night: plan.stayPricePerNight,
      Stay_Nights_Subtotal: plan.stayNightsSubtotal,
      Stay_Taxes: plan.stayTaxes,
      Stay_Total: plan.stayTotal,
      Activities_Notes: plan.activitiesNotes || undefined
    }));

    const transportLegs: TransportLeg[] = trip.transportLegs.map(leg => ({
      Leg_ID: leg.legId,
      Seq: leg.seq,
      From_City: leg.fromCity,
      From_Code: leg.fromCode,
      To_City: leg.toCity,
      To_Code: leg.toCode,
      Mode: leg.mode as any,
      Carrier: leg.carrier,
      Service_No: leg.serviceNo,
      Depart_Local: leg.departLocal.toISOString().replace('T', ' ').slice(0, -8),
      Arrive_Local: leg.arriveLocal.toISOString().replace('T', ' ').slice(0, -8),
      Duration_Min: leg.durationMin,
      Bags_Included: leg.bagsIncluded,
      Fare_Base: leg.fareBase || undefined,
      Taxes_Fees: leg.taxesFees || undefined,
      Total_Price: leg.totalPrice,
      Currency: leg.currency,
      Nonstop: leg.nonstop,
      Refundability: leg.refundability as any,
      Booking_Link: leg.bookingLink || undefined,
      Notes: leg.notes || undefined,
      Source: leg.source,
      Retrieved_At_UTC: leg.retrievedAtUtc.toISOString()
    }));

    const dailyBudgets: DailyBudget[] = trip.dailyBudgets.map(budget => ({
      Day: budget.day,
      Date: budget.date.toISOString().split('T')[0],
      City: budget.city,
      Food: budget.food,
      Local_Transport: budget.localTransport,
      Activities: budget.activities,
      Misc: budget.misc,
      Buffer: budget.buffer,
      Daily_Total: budget.dailyTotal
    }));

    const costsSummary: CostsSummary = {
      Flights_Total: trip.costsSummary?.flightsTotal || 0,
      Ground_Total: trip.costsSummary?.groundTotal || 0,
      Stay_Total: trip.costsSummary?.stayTotal || 0,
      Daily_Budgets_Total: trip.costsSummary?.dailyBudgetsTotal || 0,
      Service_Fee: trip.costsSummary?.serviceFee || undefined,
      Buffer_Percent: trip.costsSummary?.bufferPercent || undefined,
      Grand_Total: trip.costsSummary?.grandTotal || 0,
      Per_Person_Total: trip.costsSummary?.perPersonTotal || 0
    };

    const fullResponse: FullItineraryResponse = {
      ...baseResponse,
      cityPlans,
      transportLegs,
      dailyBudgets,
      costsSummary
    };

    return NextResponse.json(fullResponse);

  } catch (error) {
    console.error('Error in /api/itinerary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}