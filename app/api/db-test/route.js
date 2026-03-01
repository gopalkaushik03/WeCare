/**
 * app/api/db-test/route.js
 *
 * Health-check endpoint for MongoDB Atlas.
 * GET http://localhost:3000/api/db-test
 *
 * ✅ Returns { ok: true, database, ping: 1 } on success
 * ❌ Returns { ok: false, error } on failure
 */

import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(dbName);

        // Lightweight admin ping — no data read/write
        const result = await db.command({ ping: 1 });

        return NextResponse.json({
            ok: true,
            message: '✅ MongoDB Atlas connection is healthy!',
            database: dbName,
            ping: result.ok, // 1 = success
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[DB-TEST] Connection failed:', message);

        return NextResponse.json(
            {
                ok: false,
                message: '❌ MongoDB Atlas connection failed.',
                error: message,
            },
            { status: 500 }
        );
    }
}
