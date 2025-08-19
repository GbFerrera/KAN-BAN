import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:OFwGysRMQjGBevLHBLvFnophMWHwZKRY@caboose.proxy.rlwy.net:52093/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;

// Database schema initialization
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        nicho VARCHAR(255),
        contato VARCHAR(255),
        data_primeiro_contato DATE DEFAULT CURRENT_DATE,
        observacoes TEXT,
        status VARCHAR(50) DEFAULT 'lista_leads',
        tag VARCHAR(20) DEFAULT 'morno',
        meeting_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add meeting_date column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMP;
    `);
    
    // Update existing meeting_date column to TIMESTAMP if it's DATE
    await client.query(`
      ALTER TABLE leads 
      ALTER COLUMN meeting_date TYPE TIMESTAMP USING meeting_date::TIMESTAMP;
    `);
    
    // Create index for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};
