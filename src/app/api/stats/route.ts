import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/queries';
import { handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
