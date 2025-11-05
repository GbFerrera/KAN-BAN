import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Find user by email
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND ativo = true',
      [email.toLowerCase()]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado ou inativo' }, { status: 401 });
    }
    
    const user = result.rows[0];
    
    // Return user data (excluding sensitive info if any)
    return NextResponse.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      meta_diaria: user.meta_diaria
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
