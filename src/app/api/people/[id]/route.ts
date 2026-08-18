import { NextRequest, NextResponse } from 'next/server';
import { getPersonById, getPersonSkills, getPersonCompanies, getPersonRoles } from '@/lib/queries';
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

    const person = await getPersonById(id);
    if (!person) {
      throw new Error('NOT_FOUND');
    }

    const [skills, companies, roles] = await Promise.all([
      getPersonSkills(id),
      getPersonCompanies(id),
      getPersonRoles(id)
    ]);

    return NextResponse.json({
      data: {
        person,
        skills,
        companies,
        roles
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
