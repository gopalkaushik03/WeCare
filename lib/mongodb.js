/**
 * lib/mongodb.js
 *
 * Singleton MongoDB client for Next.js 14 (App Router).
 * Caches the client promise on `global` to survive hot-reloads in dev.
 *
 * Usage:
 *   import clientPromise, { dbName } from '@/lib/mongodb';
 *   const client = await clientPromise;
 *   const db = client.db(dbName);
 */

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? 'wecare';

if (!uri) {
    throw new Error('Please define MONGODB_URI in .env.local');
}

const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

let clientPromise;

if (process.env.NODE_ENV === 'development') {
    // Reuse cached promise across hot-reloads in development
    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // Fresh client in production
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
export { dbName };
