import { NextRequest, NextResponse } from 'next/server';
import { updateLead, deleteLead, updateLeadStatus } from '@/lib/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    console.log('PUT request received for lead ID:', id, 'Body:', body); // Debug log
    
    if (body.status && Object.keys(body).length === 1) {
      // Only updating status (for drag and drop)
      const lead = await updateLeadStatus(id, body.status);
      return NextResponse.json(lead);
    } else {
      // Full update
      const lead = await updateLead(id, body);
      return NextResponse.json(lead);
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ 
      error: 'Failed to update lead', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
