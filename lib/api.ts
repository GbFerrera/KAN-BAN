import pool from './database';
import { Lead, LeadStatus, LeadTag } from './types';

export const getLeads = async (userId?: number, userRole?: string): Promise<Lead[]> => {
  const client = await pool.connect();
  try {
    let query = `
      SELECT l.*, u.nome as user_name, u.role as user_role
      FROM leads l
      LEFT JOIN users u ON l.user_id = u.id
    `;
    
    let params: any[] = [];
    
    // If user is not a gestor, filter by their leads only
    if (userId && userRole !== 'gestor') {
      query += ` WHERE l.user_id = $1`;
      params.push(userId);
    }
    
    query += ` ORDER BY l.created_at DESC`;
    
    const result = await client.query(query, params);
    return result.rows.map(row => ({
      ...row,
      user: row.user_name ? {
        id: row.user_id,
        nome: row.user_name,
        role: row.user_role
      } : undefined
    }));
  } finally {
    client.release();
  }
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
  const client = await pool.connect();
  try {
    // Convert datetime-local format to proper timestamp
    const meetingDate = lead.meeting_date ? new Date(lead.meeting_date).toISOString() : null;
    
    const result = await client.query(
      `INSERT INTO leads (nome, nicho, contato, data_primeiro_contato, observacoes, status, tag, meeting_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [lead.nome, lead.nicho, lead.contato, lead.data_primeiro_contato, lead.observacoes, lead.status, lead.tag, meetingDate, lead.user_id || null]
    );
    const newLead = result.rows[0];
    // Enriquecer o retorno com dados do usuário criador para exibição imediata
    let user: { id: number; nome: string; role: string } | undefined;
    if (newLead.user_id) {
      const userRes = await client.query(
        `SELECT id, nome, role FROM users WHERE id = $1`,
        [newLead.user_id]
      );
      if (userRes.rows[0]) {
        user = {
          id: userRes.rows[0].id,
          nome: userRes.rows[0].nome,
          role: userRes.rows[0].role,
        };
      }
    }
    return { ...newLead, user } as Lead;
  } finally {
    client.release();
  }
};

export const updateLeadStatus = async (id: number, status: LeadStatus): Promise<Lead> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const updateLead = async (id: number, updates: Partial<Lead>): Promise<Lead> => {
  const client = await pool.connect();
  try {
    console.log('Updating lead with ID:', id, 'Updates:', updates); // Debug log
    
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
    const values = fields.map(field => {
      const value = updates[field as keyof Lead];
      // Convert datetime-local format to proper timestamp for meeting_date
      if (field === 'meeting_date') {
        if (!value || value === '') return null;
        try {
          return new Date(value as string).toISOString();
        } catch (e) {
          console.error('Error parsing meeting_date:', value, e);
          return null;
        }
      }
      return value;
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    console.log('SQL Query:', `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`);
    console.log('Values:', [...values, id]);
    
    const result = await client.query(
      `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateLead:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteLead = async (id: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM leads WHERE id = $1', [id]);
  } finally {
    client.release();
  }
};
