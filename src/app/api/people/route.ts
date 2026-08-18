import { NextRequest, NextResponse } from 'next/server';
import { getPeopleList } from '@/lib/queries';
import { handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const people = await getPeopleList(search);
    return NextResponse.json({ data: people });
  } catch (error) {
    return handleApiError(error);
  }
}
