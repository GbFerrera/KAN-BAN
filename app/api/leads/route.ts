import { NextRequest, NextResponse } from 'next/server';
import { getLeads, createLead } from '@/lib/api';
import { initDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    
    // Get user info from headers (set by frontend)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    const leads = await getLeads(
      userId ? parseInt(userId) : undefined,
      userRole || undefined
    );
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await createLead(body);
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
