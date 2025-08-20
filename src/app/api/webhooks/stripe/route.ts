import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, you would verify the webhook signature here
    // const signature = request.headers.get('stripe-signature');
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // For MVP, we'll handle the simulated webhook
    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      const tripId = session.metadata?.tripId;
      
      if (!tripId) {
        return NextResponse.json(
          { error: 'Missing tripId in metadata' },
          { status: 400 }
        );
      }

      // Find the trip and update payment status
      const trip = await prisma.trip.findUnique({
        where: { tripId },
        include: {
          payments: {
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        );
      }

      // Update the most recent pending payment
      if (trip.payments.length > 0) {
        await prisma.payment.update({
          where: { id: trip.payments[0].id },
          data: {
            status: 'completed',
            stripePaymentId: session.payment_intent || 'sim_payment'
          }
        });
      }

      // Update trip payment status
      await prisma.trip.update({
        where: { tripId },
        data: { paymentStatus: 'paid' }
      });

      console.log(`Payment completed for trip ${tripId}`);
      
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}