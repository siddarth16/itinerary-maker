'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, PlanRequest } from '@/types';

const initialFormData: FormData = {
  destinations: [{ id: '1', value: '' }],
  origin: '',
  travelWindow: {
    start: '',
    end: ''
  },
  duration: {
    min: 7,
    max: 14
  },
  budget: {
    currency: 'USD',
    perPerson: true
  },
  partySize: 1,
  baggage: 1,
  cabin: 'Economy',
  nightBusAllowed: false,
  refundableOnly: false,
  maxHops: 4,
  excludedCities: [],
  notes: ''
};

export default function PlanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const steps = [
    {
      title: 'Where to?',
      description: 'Tell us your destinations and starting point'
    },
    {
      title: 'When?',
      description: 'Select your travel dates and duration'
    },
    {
      title: 'Budget & Party',
      description: 'Set your budget and party size'
    },
    {
      title: 'Preferences',
      description: 'Configure your travel preferences'
    }
  ];

  const addDestination = () => {
    const newId = (formData.destinations.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { id: newId, value: '' }]
    }));
  };

  const removeDestination = (id: string) => {
    if (formData.destinations.length > 1) {
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations.filter(d => d.id !== id)
      }));
    }
  };

  const updateDestination = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map(d => d.id === id ? { ...d, value } : d)
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return formData.destinations.some(d => d.value.trim()) && formData.origin.trim();
      case 1:
        return formData.travelWindow.start && formData.travelWindow.end;
      case 2:
        return formData.partySize > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNextStep()) return;

    setLoading(true);

    try {
      const planRequest: PlanRequest = {
        destinations: formData.destinations
          .filter(d => d.value.trim())
          .map(d => d.value.trim()),
        origin: formData.origin.trim(),
        travelWindow: formData.travelWindow,
        duration: formData.duration,
        budget: Object.keys(formData.budget).length > 2 ? formData.budget : undefined,
        partySize: formData.partySize,
        baggage: formData.baggage,
        cabin: formData.cabin,
        nightBusAllowed: formData.nightBusAllowed,
        refundableOnly: formData.refundableOnly,
        maxHops: formData.maxHops,
        excludedCities: formData.excludedCities.filter(c => c.trim()),
        notes: formData.notes.trim() || undefined
      };

      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planRequest)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create plan');
      }

      router.push(`/progress/${result.tripId}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-gray-600 mb-8">{steps[currentStep].description}</p>

          {/* Step 0: Destinations */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where are you starting from?
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="e.g., Delhi, New York (JFK), London"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinations
                </label>
                {formData.destinations.map((destination, index) => (
                  <div key={destination.id} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={destination.value}
                      onChange={(e) => updateDestination(destination.id, e.target.value)}
                      placeholder={`Destination ${index + 1} (e.g., Paris, Western Europe, Japan)`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.destinations.length > 1 && (
                      <button
                        onClick={() => removeDestination(destination.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addDestination}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add another destination
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Travel Window */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel window start
                  </label>
                  <input
                    type="date"
                    value={formData.travelWindow.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      travelWindow: { ...prev.travelWindow, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel window end
                  </label>
                  <input
                    type="date"
                    value={formData.travelWindow.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      travelWindow: { ...prev.travelWindow, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum days
                  </label>
                  <input
                    type="number"
                    value={formData.duration.min}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      duration: { ...prev.duration, min: parseInt(e.target.value) || 1 }
                    }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum days
                  </label>
                  <input
                    type="number"
                    value={formData.duration.max}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      duration: { ...prev.duration, max: parseInt(e.target.value) || 1 }
                    }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Party */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party size
                </label>
                <input
                  type="number"
                  value={formData.partySize}
                  onChange={(e) => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={formData.budget.min || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, min: parseInt(e.target.value) || undefined }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={formData.budget.max || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, max: parseInt(e.target.value) || undefined }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.budget.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, currency: e.target.value }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={formData.budget.perPerson}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: { ...prev.budget, perPerson: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Per person
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baggage pieces per person
                  </label>
                  <input
                    type="number"
                    value={formData.baggage}
                    onChange={(e) => setFormData(prev => ({ ...prev, baggage: parseInt(e.target.value) || 1 }))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cabin class
                  </label>
                  <select
                    value={formData.cabin}
                    onChange={(e) => setFormData(prev => ({ ...prev, cabin: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Economy">Economy</option>
                    <option value="PremiumEconomy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.nightBusAllowed}
                    onChange={(e) => setFormData(prev => ({ ...prev, nightBusAllowed: e.target.checked }))}
                    className="mr-2"
                  />
                  Allow night buses
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.refundableOnly}
                    onChange={(e) => setFormData(prev => ({ ...prev, refundableOnly: e.target.checked }))}
                    className="mr-2"
                  />
                  Refundable only
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum city hops: {formData.maxHops}
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={formData.maxHops}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxHops: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific requirements or preferences..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={!canProceedToNextStep() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : currentStep === steps.length - 1 ? 'Create Plan' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}