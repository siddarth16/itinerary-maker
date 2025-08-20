'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProgressResponse } from '@/types';

interface Props {
  params: { tripId: string };
}

export default function ProgressPage({ params }: Props) {
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${params.tripId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch progress');
          return;
        }

        setProgress(data);

        if (data.status === 'completed') {
          // Redirect to itinerary page after a short delay
          setTimeout(() => {
            router.push(`/itinerary/${params.tripId}`);
          }, 2000);
        } else if (data.status === 'error') {
          setError('An error occurred while planning your trip');
        }
      } catch (err) {
        setError('Failed to check progress');
        console.error('Progress polling error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial poll
    pollProgress();

    // Poll every 2 seconds if not completed or errored
    const interval = setInterval(() => {
      if (progress?.status === 'completed' || progress?.status === 'error') {
        clearInterval(interval);
        return;
      }
      pollProgress();
    }, 2000);

    return () => clearInterval(interval);
  }, [params.tripId, router, progress?.status]);

  if (loading && !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/plan')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'queued':
        return (
          <div className="animate-pulse bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'running':
        return (
          <div className="animate-spin bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (progress.message) return progress.message;
    
    switch (progress.status) {
      case 'queued':
        return 'Your trip is queued for processing...';
      case 'running':
        return 'Planning your perfect itinerary...';
      case 'completed':
        return 'Your itinerary is ready! Redirecting...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        {getStatusIcon()}
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Planning Your Trip
        </h2>
        
        <p className="text-gray-600 mb-8">
          {getStatusMessage()}
        </p>

        {progress.status === 'running' && typeof progress.progress === 'number' && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        )}

        {progress.status === 'completed' && progress.candidateRoutes && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              ✨ Found {progress.candidateRoutes.length} optimized route{progress.candidateRoutes.length > 1 ? 's' : ''}!
            </h3>
            
            {progress.candidateRoutes[0] && (
              <div className="text-left">
                <div className="text-sm text-gray-600 mb-2">Route Preview:</div>
                <div className="space-y-1">
                  {progress.candidateRoutes[0].slice(0, 3).map((day, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>Day {day.Day}: {day.City}</span>
                      <span className="text-gray-500">${day.Daily_Total}</span>
                    </div>
                  ))}
                  {progress.candidateRoutes[0].length > 3 && (
                    <div className="text-sm text-gray-500">
                      ... and {progress.candidateRoutes[0].length - 3} more days
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center mt-8 space-x-2 text-sm text-gray-500">
          <div className="animate-pulse w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="animate-pulse w-1 h-1 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-pulse w-1 h-1 bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
          <span className="ml-2">This usually takes 30-60 seconds</span>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push('/plan')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Start a new plan
          </button>
        </div>
      </div>
    </div>
  );
}