import ThermalPrinterService from '../services/printer';
import { defaultPrinterConfig, getSuggestedPorts } from '../config/printer';

// Script de teste para impressora térmica
async function testPrinter() {
  console.log('🖨️ Testando impressora térmica...\n');
  
  // Mostrar portas sugeridas
  const suggestedPorts = getSuggestedPorts();
  console.log('Portas sugeridas para seu sistema:');
  suggestedPorts.forEach(port => console.log(`  - ${port}`));
  console.log();
  
  // Usar configuração padrão
  const config = defaultPrinterConfig;
  console.log(`Configuração atual:`);
  console.log(`  Porta: ${config.portPath}`);
  console.log(`  Baud Rate: ${config.baudRate}`);
  console.log(`  Auto conectar: ${config.autoConnect}`);
  console.log(`  Fallback para mock: ${config.fallbackToMock}\n`);
  
  // Criar serviço de impressão
  const printerService = new ThermalPrinterService(config.portPath, config.baudRate);
  
  // Testar conexão
  console.log('🔌 Tentando conectar à impressora...');
  const connected = await printerService.connect();
  
  if (connected) {
    console.log('✅ Impressora conectada com sucesso!\n');
    
    // Testar impressão
    console.log('📝 Testando impressão...');
    const testTask = {
      id: 'TEST-001',
      title: 'Tarefa de Teste',
      description: 'Esta é uma tarefa de teste para verificar a impressora',
      time: '14:30',
      repeat_daily: true,
      days: [],
      enabled: true,
      category: 'teste',
      zone: 'Cozinha',
      priority: 'alta',
      estimated_duration: 15,
      user_id: 'test-user'
    };
    
    const success = await printerService.printTask(testTask);
    
    if (success) {
      console.log('✅ Impressão realizada com sucesso!');
    } else {
      console.log('❌ Falha na impressão');
    }
    
    // Desconectar
    printerService.disconnect();
    console.log('📄 Conexão fechada.');
    
  } else {
    console.log('❌ Não foi possível conectar à impressora.');
    console.log('💡 Verifique se:');
    console.log('  - A impressora está ligada');
    console.log('  - A porta COM está correta');
    console.log('  - Os drivers estão instalados');
    console.log('  - A impressora está conectada via USB ou serial');
    
    // Testar modo simulação
    console.log('\n📝 Testando modo simulação...');
    const testTask = {
      id: 'TEST-001',
      title: 'Tarefa de Teste',
      description: 'Esta é uma tarefa de teste para verificar o modo simulação',
      time: '14:30',
      repeat_daily: true,
      days: [],
      enabled: true,
      category: 'teste',
      zone: 'Cozinha',
      priority: 'alta',
      estimated_duration: 15,
      user_id: 'test-user'
    };
    
    const success = await printerService.printTask(testTask);
    
    if (success) {
      console.log('✅ Modo simulação funcionando corretamente!');
    } else {
      console.log('❌ Falha no modo simulação');
    }
  }
  
  console.log('\n🎉 Teste concluído!');
}

// Executar teste
if (require.main === module) {
  testPrinter().catch(console.error);
}

export { testPrinter };