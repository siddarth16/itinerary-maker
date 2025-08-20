import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get optimized itineraries with flights, accommodations, and ground transport. 
            Compare routes, see detailed budgets, and book everything with one click.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/plan" className="inline-block">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors">
                Start Planning
              </button>
            </Link>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 text-lg font-semibold rounded-lg transition-colors">
              View Example
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3v10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-City Routes</h3>
              <p className="text-gray-600">
                Optimize routes across multiple destinations with smart connections and minimal travel time.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Budgeting</h3>
              <p className="text-gray-600">
                Get detailed daily budgets for food, transport, activities with real-time pricing.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Export & Book</h3>
              <p className="text-gray-600">
                Download detailed itineraries as PDF/Excel and book directly through provider links.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">1</div>
                <h4 className="font-semibold mb-2">Enter Preferences</h4>
                <p className="text-sm text-gray-600">Tell us your destinations, dates, budget, and travel preferences</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">2</div>
                <h4 className="font-semibold mb-2">Get 3 Options</h4>
                <p className="text-sm text-gray-600">Receive optimized routes with cost breakdowns and timelines</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">3</div>
                <h4 className="font-semibold mb-2">Unlock Details</h4>
                <p className="text-sm text-gray-600">Pay once to see full itinerary with booking links and documents</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">4</div>
                <h4 className="font-semibold mb-2">Book & Travel</h4>
                <p className="text-sm text-gray-600">Use direct booking links and downloadable itinerary for your trip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
