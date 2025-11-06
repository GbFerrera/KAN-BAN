import { NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET - Buscar todos os nichos únicos existentes nos leads
export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT DISTINCT nicho 
      FROM leads 
      WHERE nicho IS NOT NULL 
        AND nicho != '' 
      ORDER BY nicho ASC
    `);
    
    const nichos = result.rows.map(row => row.nicho);
    return NextResponse.json(nichos);
  } catch (error) {
    console.error('Error fetching nichos:', error);
    return NextResponse.json({ error: 'Failed to fetch nichos' }, { status: 500 });
  } finally {
    client.release();
  }
}
