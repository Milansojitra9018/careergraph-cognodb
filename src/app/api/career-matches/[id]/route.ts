import { NextRequest, NextResponse } from 'next/server';
import { getCareerMatches } from '@/lib/queries';
import { handleApiError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      throw new Error('INVALID_INPUT');
    }

    const matches = await getCareerMatches(id);
    return NextResponse.json({ data: matches });
  } catch (error) {
    return handleApiError(error);
  }
}
