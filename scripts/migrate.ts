import { initDatabase } from '../lib/database';

async function runMigrations() {
  console.log('🚀 Iniciando migrações do banco de dados...');
  
  try {
    await initDatabase();
    console.log('✅ Migrações executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

runMigrations();
