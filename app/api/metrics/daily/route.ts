import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const userIdParam = searchParams.get('user_id');
    const userId = userIdParam ? parseInt(userIdParam) : null;
    
    const client = await pool.connect();
    
    // Get daily metrics, optionally filtered by user
    let query = `
      SELECT 
        u.id as user_id,
        u.nome as user_name,
        u.meta_diaria,
        COALESCE(COUNT(l.id), 0) as leads_created,
        ROUND(
          (COALESCE(COUNT(l.id), 0) * 100.0 / NULLIF(u.meta_diaria, 0)), 2
        ) as percentage
      FROM users u
      LEFT JOIN leads l ON u.id = l.user_id 
        AND DATE(l.created_at) = $1
      WHERE u.ativo = true
    `;
    const params: any[] = [date];
    if (userId) {
      query += ` AND u.id = $2`;
      params.push(userId);
    }
    query += `
      GROUP BY u.id, u.nome, u.meta_diaria
      ORDER BY percentage DESC, u.nome ASC
    `;
    const result = await client.query(query, params);
    
    client.release();
    
    const metrics = result.rows.map(row => ({
      user_id: row.user_id,
      user_name: row.user_name,
      date,
      leads_created: parseInt(row.leads_created),
      meta_diaria: row.meta_diaria,
      percentage: parseFloat(row.percentage) || 0
    }));
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch daily metrics' }, { status: 500 });
  }
}

export async function GET_WEEKLY(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    // Get weekly metrics (last 7 days)
    const result = await client.query(`
      SELECT 
        DATE(l.created_at) as date,
        u.id as user_id,
        u.nome as user_name,
        u.meta_diaria,
        COUNT(l.id) as leads_created,
        ROUND(
          (COUNT(l.id) * 100.0 / NULLIF(u.meta_diaria, 0)), 2
        ) as percentage
      FROM users u
      LEFT JOIN leads l ON u.id = l.user_id 
        AND l.created_at >= CURRENT_DATE - INTERVAL '7 days'
      WHERE u.ativo = true
      GROUP BY DATE(l.created_at), u.id, u.nome, u.meta_diaria
      ORDER BY date DESC, percentage DESC
    `);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly metrics' }, { status: 500 });
  }
}
