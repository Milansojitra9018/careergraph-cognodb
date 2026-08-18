import { NextRequest, NextResponse } from 'next/server';
import { getCareerPath } from '@/lib/queries';
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

    const careerPath = await getCareerPath(id);
    return NextResponse.json({ data: careerPath });
  } catch (error) {
    return handleApiError(error);
  }
}
