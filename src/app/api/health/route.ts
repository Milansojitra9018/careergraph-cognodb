import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/cognodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Run a lightweight query to verify the connection
    await runQuery('MATCH (n) RETURN count(n) AS count LIMIT 1');
    return NextResponse.json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health Check Database Failure:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'unavailable'
      },
      { status: 503 }
    );
  }
}
