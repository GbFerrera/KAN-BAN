import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgres://postgres:v0gDPeHtpsctZNgDZhyA4NcBnTqhH12qMHWuhsRG3Khc1QxxcXdjcc3Ewa7qj5FL@62.72.11.161:5445/postgres',
  ssl: false
});

export default pool;

// Database schema initialization
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'vendedor',
        meta_diaria INTEGER DEFAULT 5,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create leads table
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
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add user_id column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
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
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Insert default admin user if no users exist
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (nome, email, role, meta_diaria) 
        VALUES ('Administrador', 'admin@sistema.com', 'gestor', 10)
      `);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};
