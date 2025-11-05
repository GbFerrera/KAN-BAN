import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nome, email, role, meta_diaria, ativo } = await request.json();
    
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE users SET nome = $1, email = $2, role = $3, meta_diaria = $4, ativo = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [nome, email, role, meta_diaria, ativo, id]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const client = await pool.connect();
    
    // Soft delete - just mark as inactive
    const result = await client.query(
      'UPDATE users SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
}
