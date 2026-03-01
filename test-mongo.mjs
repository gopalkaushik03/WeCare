// test-mongo.mjs  — run with: node test-mongo.mjs
// Tests MongoDB Atlas connection directly, bypassing Next.js

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually parse .env.local
function loadEnv(filePath) {
    try {
        const content = readFileSync(filePath, 'utf8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) process.env[key] = val;
        }
    } catch (e) {
        console.warn('Could not load .env.local:', e.message);
    }
}

loadEnv(resolve('.env.local'));

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'wecare';

if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

console.log('🔌 Connecting to MongoDB Atlas...');
console.log('   DB:', dbName);
console.log('   URI (masked):', uri.replace(/:([^@]+)@/, ':****@'));

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
});

try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.command({ ping: 1 });
    console.log('\n✅ SUCCESS! MongoDB Atlas is connected.');
    console.log('   Ping result:', result);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('   Collections in DB:', collections.length === 0 ? '(none yet — fresh DB)' : collections.map(c => c.name).join(', '));
} catch (err) {
    console.error('\n❌ FAILED:', err.message);
    process.exit(1);
} finally {
    await client.close();
    console.log('\n🔒 Connection closed.');
}
