import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineTrip {
  id: string;
  userId: string;
  type: 'booking' | 'history';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: number;
  synced: boolean;
}

interface WasselDB extends DBSchema {
  trips: {
    key: string;
    value: OfflineTrip;
  };
  messages: {
    key: string;
    value: OfflineMessage;
  };
  userPreferences: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<WasselDB> | null = null;

export async function initDB() {
  if (db) return db;

  db = await openDB<WasselDB>('wassel-offline', 1, {
    upgrade(db: any) {
      // Trips store
      const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
      tripStore.createIndex('by-user', 'userId');
      tripStore.createIndex('by-synced', 'synced');

      // Messages store
      const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
      messageStore.createIndex('by-conversation', 'conversationId');
      messageStore.createIndex('by-synced', 'synced');

      // User preferences store
      db.createObjectStore('userPreferences');
    },
  });

  return db;
}

// Trip operations
export async function saveTripOffline(trip: Omit<OfflineTrip, 'timestamp' | 'synced'>) {
  const database = await initDB();
  const offlineTrip: OfflineTrip = {
    ...trip,
    timestamp: Date.now(),
    synced: false,
  };

  await database.put('trips', offlineTrip);
  return offlineTrip;
}

export async function getPendingTrips(userId: string) {
  const database = await initDB();
  const index = (database.transaction('trips').store as any).index('by-user');
  const trips = await index.getAll(IDBKeyRange.only(userId)) as OfflineTrip[];
  return trips.filter((trip: OfflineTrip) => !trip.synced);
}

export async function markTripSynced(tripId: string) {
  const database = await initDB();
  const trip = await database.get('trips', tripId);
  if (trip) {
    trip.synced = true;
    await database.put('trips', trip);
  }
}

export async function getAllTrips(userId: string) {
  const database = await initDB();
  const index = (database.transaction('trips').store as any).index('by-user');
  return await index.getAll(IDBKeyRange.only(userId)) as OfflineTrip[];
}

// Message operations
export async function saveMessageOffline(message: Omit<OfflineMessage, 'timestamp' | 'synced'>) {
  const database = await initDB();
  const offlineMessage: OfflineMessage = {
    ...message,
    timestamp: Date.now(),
    synced: false,
  };

  await database.put('messages', offlineMessage);
  return offlineMessage;
}

export async function getPendingMessages() {
  const database = await initDB();
  const index = (database.transaction('messages').store as any).index('by-synced');
  return await index.getAll(IDBKeyRange.only(false)) as OfflineMessage[];
}

export async function markMessageSynced(messageId: string) {
  const database = await initDB();
  const message = await database.get('messages', messageId);
  if (message) {
    message.synced = true;
    await database.put('messages', message);
  }
}

// User preferences
export async function saveUserPreference(key: string, value: any) {
  const database = await initDB();
  await database.put('userPreferences', value, key);
}

export async function getUserPreference(key: string) {
  const database = await initDB();
  return await database.get('userPreferences', key);
}

// Sync utilities
export async function getSyncStatus() {
  const database = await initDB();
  const pendingTrips = await (database as any).countFromIndex('trips', 'by-synced', IDBKeyRange.only(false));
  const pendingMessages = await (database as any).countFromIndex('messages', 'by-synced', IDBKeyRange.only(false));
  return { pendingTrips, pendingMessages };
}

export async function clearOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000) { // 30 days
  const database = await initDB();
  const cutoff = Date.now() - maxAge;

  // Clear old synced trips
  const oldTrips = await (database as any).getAllFromIndex('trips', 'by-synced', IDBKeyRange.only(true)) as OfflineTrip[];
  for (const trip of oldTrips) {
    if (trip.timestamp < cutoff) {
      await database.delete('trips', trip.id);
    }
  }

  // Clear old synced messages
  const oldMessages = await (database as any).getAllFromIndex('messages', 'by-synced', IDBKeyRange.only(true)) as OfflineMessage[];
  for (const message of oldMessages) {
    if (message.timestamp < cutoff) {
      await database.delete('messages', message.id);
    }
  }
}