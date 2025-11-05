import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { User } from '@/lib/types';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM users WHERE ativo = true ORDER BY nome ASC'
    );
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, role, meta_diaria } = await request.json();
    
    if (!nome || !email) {
      return NextResponse.json({ error: 'Nome and email are required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Check if email already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      client.release();
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    const result = await client.query(
      'INSERT INTO users (nome, email, role, meta_diaria) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, role || 'vendedor', meta_diaria || 5]
    );
    
    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
