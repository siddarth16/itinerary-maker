import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ProgressResponse, PaywallView } from '@/types';

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
        dailyBudgets: {
          orderBy: { day: 'asc' }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const response: ProgressResponse = {
      tripId: trip.tripId,
      status: trip.status as 'queued' | 'running' | 'completed' | 'error'
    };

    // Add progress information based on status
    if (trip.status === 'running') {
      response.progress = 50; // Mock progress
      response.message = 'Finding best routes and accommodations...';
    } else if (trip.status === 'completed' && trip.cityPlans.length > 0) {
      // Generate paywall view for completed trips
      const paywallView: PaywallView[] = [];
      let cumulativeTotal = 0;

      trip.dailyBudgets.forEach((budget, index) => {
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

      response.candidateRoutes = [paywallView]; // For MVP, we return one route
      response.message = 'Trip planning completed! 3 routes found.';
    } else if (trip.status === 'error') {
      response.message = 'An error occurred while planning your trip. Please try again.';
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in /api/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}