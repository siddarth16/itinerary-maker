// Production database fallback for Vercel
import type { Trip, CityPlan, TransportLeg, DailyBudget, CostsSummary } from '@prisma/client';

// In-memory store for production demo
const memoryStore = {
  trips: new Map<string, any>(),
  cityPlans: new Map<string, any[]>(),
  transportLegs: new Map<string, any[]>(),
  dailyBudgets: new Map<string, any[]>(),
  costsSummary: new Map<string, any>(),
  payments: new Map<string, any[]>()
};

export const productionDb = {
  trip: {
    create: async (data: any) => {
      const trip = { id: data.data.tripId, ...data.data };
      memoryStore.trips.set(trip.tripId, trip);
      return trip;
    },
    
    findUnique: async ({ where, include }: any) => {
      const trip = memoryStore.trips.get(where.tripId);
      if (!trip) return null;
      
      const result = { ...trip };
      
      if (include) {
        if (include.cityPlans) {
          result.cityPlans = memoryStore.cityPlans.get(trip.tripId) || [];
        }
        if (include.transportLegs) {
          result.transportLegs = memoryStore.transportLegs.get(trip.tripId) || [];
        }
        if (include.dailyBudgets) {
          result.dailyBudgets = memoryStore.dailyBudgets.get(trip.tripId) || [];
        }
        if (include.costsSummary) {
          result.costsSummary = memoryStore.costsSummary.get(trip.tripId);
        }
        if (include.payments) {
          result.payments = memoryStore.payments.get(trip.tripId) || [];
        }
      }
      
      return result;
    },
    
    update: async ({ where, data }: any) => {
      const trip = memoryStore.trips.get(where.tripId);
      if (trip) {
        Object.assign(trip, data);
        memoryStore.trips.set(where.tripId, trip);
      }
      return trip;
    }
  },
  
  cityPlan: {
    create: async ({ data }: any) => {
      const plans = memoryStore.cityPlans.get(data.tripId) || [];
      const newPlan = { id: `city_${Date.now()}`, ...data };
      plans.push(newPlan);
      memoryStore.cityPlans.set(data.tripId, plans);
      return newPlan;
    }
  },
  
  transportLeg: {
    create: async ({ data }: any) => {
      const legs = memoryStore.transportLegs.get(data.tripId) || [];
      const newLeg = { id: data.legId, ...data };
      legs.push(newLeg);
      memoryStore.transportLegs.set(data.tripId, legs);
      return newLeg;
    }
  },
  
  dailyBudget: {
    create: async ({ data }: any) => {
      const budgets = memoryStore.dailyBudgets.get(data.tripId) || [];
      const newBudget = { id: `budget_${Date.now()}`, ...data };
      budgets.push(newBudget);
      memoryStore.dailyBudgets.set(data.tripId, budgets);
      return newBudget;
    }
  },
  
  costsSummary: {
    create: async ({ data }: any) => {
      const summary = { id: `summary_${Date.now()}`, ...data };
      memoryStore.costsSummary.set(data.tripId, summary);
      return summary;
    }
  },
  
  payment: {
    create: async ({ data }: any) => {
      const payments = memoryStore.payments.get(data.tripId) || [];
      const newPayment = { id: `payment_${Date.now()}`, ...data };
      payments.push(newPayment);
      memoryStore.payments.set(data.tripId, payments);
      return newPayment;
    },
    
    update: async ({ where, data }: any) => {
      const payments = Array.from(memoryStore.payments.values()).flat();
      const payment = payments.find(p => p.id === where.id);
      if (payment) {
        Object.assign(payment, data);
      }
      return payment;
    }
  },
  
  request: {
    create: async ({ data }: any) => {
      return { id: `request_${Date.now()}`, ...data };
    }
  }
};