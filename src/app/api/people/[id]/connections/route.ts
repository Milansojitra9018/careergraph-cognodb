import { NextRequest, NextResponse } from 'next/server';
import { getSharedSkillConnections, getSharedCompanyConnections, getPersonGraphNeighborhood } from '@/lib/queries';
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

    const [sharedSkills, sharedCompanies, graphNeighborhood] = await Promise.all([
      getSharedSkillConnections(id),
      getSharedCompanyConnections(id),
      getPersonGraphNeighborhood(id)
    ]);

    return NextResponse.json({
      data: {
        sharedSkills,
        sharedCompanies,
        graphNeighborhood
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
