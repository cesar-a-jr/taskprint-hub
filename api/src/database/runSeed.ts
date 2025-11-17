import db, { initializeDatabase } from './sqlite';
import { seedDatabase } from './seed';

async function runSeed() {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
    // Inicializar o banco de dados (criar tabelas)
    initializeDatabase();
    
    console.log('📊 Banco de dados inicializado');
    
    // Executar seed
    seedDatabase(db);
    
    console.log('✅ Seed executado com sucesso!');
    
    // Fechar conexão
    if (db && db.close) {
      db.close();
      console.log('🔒 Conexão com banco de dados fechada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

// Executar se este arquivo for executado diretamente
if (require.main === module) {
  runSeed();
}