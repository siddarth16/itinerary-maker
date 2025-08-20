'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

function CheckoutContent() {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tripId = searchParams.get('tripId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');

  useEffect(() => {
    if (!tripId || !amount || !currency) {
      router.push('/');
    }
  }, [tripId, amount, currency, router]);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // Mark payment as completed
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              metadata: {
                tripId: tripId
              },
              payment_status: 'paid'
            }
          }
        })
      });

      if (response.ok) {
        setCompleted(true);
        setTimeout(() => {
          router.push(`/itinerary/${tripId}`);
        }, 2000);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your itinerary has been unlocked.</p>
          <div className="animate-pulse text-blue-600">Redirecting to your itinerary...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Unlock your complete travel itinerary</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Itinerary Unlock Fee</span>
            <span className="font-semibold">
              {formatCurrency(parseInt(amount!) / 100, currency!.toUpperCase())}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Includes detailed plans + downloads</span>
            <span>One-time payment</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Complete flight & accommodation details
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Downloadable PDF & Excel files
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Direct booking links to providers
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            30-day email support
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            `Pay ${formatCurrency(parseInt(amount!) / 100, currency!.toUpperCase())}`
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure payment processing • This is a demo checkout
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to itinerary
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSimulatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}