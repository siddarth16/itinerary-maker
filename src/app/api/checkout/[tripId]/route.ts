import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { CheckoutResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: { tripId },
      include: {
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

    if (trip.paymentStatus === 'paid' || trip.payments.length > 0) {
      return NextResponse.json(
        { error: 'Trip is already unlocked' },
        { status: 400 }
      );
    }

    if (!trip.costsSummary) {
      return NextResponse.json(
        { error: 'Costs not calculated yet' },
        { status: 400 }
      );
    }

    // For MVP, we'll simulate Stripe checkout by creating a mock checkout URL
    // In production, this would integrate with Stripe Checkout API
    
    const amount = Math.round(trip.costsSummary.grandTotal * 100); // Convert to cents
    const currency = trip.currency.toLowerCase();

    // Create payment record
    await prisma.payment.create({
      data: {
        tripId: trip.tripId,
        amount: trip.costsSummary.grandTotal,
        currency: trip.currency,
        status: 'pending'
      }
    });

    // For MVP, return a mock checkout URL that will simulate payment completion
    const checkoutUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/simulate?tripId=${tripId}&amount=${amount}&currency=${currency}`;

    return NextResponse.json({
      checkoutUrl
    } as CheckoutResponse);

  } catch (error) {
    console.error('Error in /api/checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}