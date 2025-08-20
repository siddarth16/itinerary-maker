'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ItineraryResponse, FullItineraryResponse } from '@/types';
import { formatCurrency, formatDuration, formatDateRange } from '@/lib/utils';

interface Props {
  params: { tripId: string };
}

export default function ItineraryPage({ params }: Props) {
  const [itinerary, setItinerary] = useState<ItineraryResponse | FullItineraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itinerary/${params.tripId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch itinerary');
          return;
        }

        setItinerary(data);
      } catch (err) {
        setError('Failed to load itinerary');
        console.error('Itinerary fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [params.tripId]);

  const handleUnlock = async () => {
    try {
      const response = await fetch(`/api/checkout/${params.tripId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/plan')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  const isFullItinerary = (data: ItineraryResponse | FullItineraryResponse): data is FullItineraryResponse => {
    return data.unlocked && 'cityPlans' in data;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {itinerary.params.Title}
              </h1>
              <p className="text-gray-600">
                {formatDateRange(itinerary.params.Travel_Window_Start, itinerary.params.Travel_Window_End)} • {itinerary.params.Party_Size} {itinerary.params.Party_Size === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(itinerary.grandTotal, itinerary.params.Currency)}
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(itinerary.perPersonTotal, itinerary.params.Currency)} per person
              </div>
            </div>
          </div>
        </div>

        {!itinerary.unlocked ? (
          // Paywall View
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Your Itinerary Preview</h2>
              <div className="space-y-3">
                {itinerary.paywall.map((day, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium">Day {day.Day} - {day.Date}</div>
                      <div className="text-lg font-semibold text-gray-900">{day.City}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Daily Budget</div>
                      <div className="font-semibold">{formatCurrency(day.Daily_Total, itinerary.params.Currency)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlock CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Unlock Your Complete Itinerary</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Get detailed flight information, hotel bookings, transport options, daily activities, 
                and downloadable PDF/Excel files with direct booking links.
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6 inline-block">
                <div className="text-3xl font-bold">{formatCurrency(itinerary.grandTotal, itinerary.params.Currency)}</div>
                <div className="text-blue-100">One-time unlock fee</div>
              </div>
              <button
                onClick={handleUnlock}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Unlock Full Itinerary
              </button>
              <div className="mt-4 text-sm text-blue-200">
                ✓ Secure payment via Stripe • ✓ Instant access • ✓ 30-day support
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Flight Details</h3>
                <p className="text-sm text-gray-600">Complete flight information with booking links</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Accommodations</h3>
                <p className="text-sm text-gray-600">Hotel and hostel options with prices</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Download Files</h3>
                <p className="text-sm text-gray-600">PDF and Excel formats for offline use</p>
              </div>
            </div>
          </div>
        ) : (
          // Full Itinerary View
          isFullItinerary(itinerary) && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {['overview', 'transport', 'stays', 'budget', 'downloads'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                          activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(itinerary.costsSummary.Flights_Total, itinerary.params.Currency)}
                          </div>
                          <div className="text-sm text-gray-600">Flights</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(itinerary.costsSummary.Stay_Total, itinerary.params.Currency)}
                          </div>
                          <div className="text-sm text-gray-600">Accommodation</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(itinerary.costsSummary.Ground_Total, itinerary.params.Currency)}
                          </div>
                          <div className="text-sm text-gray-600">Transport</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(itinerary.costsSummary.Daily_Budgets_Total, itinerary.params.Currency)}
                          </div>
                          <div className="text-sm text-gray-600">Daily Expenses</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {itinerary.cityPlans.map((city, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">{city.City}, {city.Country}</h3>
                                <p className="text-sm text-gray-600">
                                  Days {city.Day} - {city.Day + city.Nights - 1} • {city.Nights} nights
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(city.Stay_Total, city.Stay_Currency)}</div>
                                <div className="text-sm text-gray-500">accommodation</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>{city.Stay_Name}</strong> • {city.Stay_Type} • {city.Room_Type}
                            </div>
                            {city.Stay_Link && (
                              <a 
                                href={city.Stay_Link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Book Now
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10l-4-4m0 0l-4 4m4-4v18" />
                                </svg>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transport Tab */}
                  {activeTab === 'transport' && (
                    <div className="space-y-4">
                      {itinerary.transportLegs.map((leg, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-semibold">{leg.From_City}</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="text-lg font-semibold">{leg.To_City}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {leg.Carrier} {leg.Service_No} • {leg.Mode}
                              </div>
                              <div className="text-sm text-gray-600">
                                {leg.Depart_Local} - {leg.Arrive_Local} • {formatDuration(leg.Duration_Min)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">{formatCurrency(leg.Total_Price, leg.Currency)}</div>
                              <div className="text-sm text-gray-500">{leg.Bags_Included} bag{leg.Bags_Included !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                          {leg.Booking_Link && (
                            <a 
                              href={leg.Booking_Link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Book Now
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10l-4-4m0 0l-4 4m4-4v18" />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other tabs would be implemented similarly... */}
                  {activeTab !== 'overview' && activeTab !== 'transport' && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🚧</div>
                      <div>This section is coming soon!</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}