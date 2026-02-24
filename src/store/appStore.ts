import { create } from 'zustand';

interface Trip {
  id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: string;
  date: string;
}

interface AppState {
  user: any;
  trips: Trip[];
  currentTrip: Trip | null;
  setUser: (user: any) => void;
  addTrip: (trip: Trip) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  clearTrips: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  trips: [],
  currentTrip: null,
  setUser: (user) => set({ user }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  clearTrips: () => set({ trips: [] })
}));
