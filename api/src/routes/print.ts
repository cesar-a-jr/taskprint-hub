import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getTaskById, getTasksByUserId, getTasksByDay } from '../database/sqlite';

// Mock ThermalPrinter class para quando o módulo não está disponível
class MockThermalPrinter {
  private config: any;
  
  constructor(config: any) {
    this.config = config;
    console.log('📝 Mock ThermalPrinter criado com config:', config);
  }
  
  async print(text: string) {
    console.log('📝 Impressão simulada:', text.trim());
  }
  
  async execute() {
    console.log('📝 Execução simulada da impressora');
  }
}

// Importação dinâmica do thermal printer
const loadThermalPrinter = async () => {
  try {
    // Por enquanto, usar apenas mock já que a impressora não está conectada
    console.log('📝 Modo simulação ativado - impressora não conectada');
    return MockThermalPrinter;
    
    // Quando a impressora estiver conectada, descomente o código abaixo:
    /*
    const thermalPrinterModule = await import('node-thermal-printer');
    console.log('📦 Módulo thermal printer carregado:', Object.keys(thermalPrinterModule));
    
    // Tentar diferentes formas de acessar o construtor
    let ThermalPrinter = thermalPrinterModule.default || thermalPrinterModule.ThermalPrinter || thermalPrinterModule;
    
    // Se ainda não for uma função construtora, tentar acessar propriedades aninhadas
    if (typeof ThermalPrinter !== 'function') {
      console.log('🔍 Tentando acessar construtor de forma diferente...');
      ThermalPrinter = thermalPrinterModule.ThermalPrinter || thermalPrinterModule.default?.ThermalPrinter;
    }
    
    if (typeof ThermalPrinter === 'function') {
      console.log('✅ ThermalPrinter encontrado e é uma função construtora');
      return ThermalPrinter;
    } else {
      console.log('⚠️ ThermalPrinter não encontrado como função, usando mock');
      return MockThermalPrinter;
    }
    */
  } catch (error) {
    console.warn('⚠️ node-thermal-printer não disponível, usando mock:', error);
    return MockThermalPrinter;
  }
};

const router = Router();

// Função auxiliar para imprimir tarefa
const printTaskToPrinter = async (task: any) => {
  try {
    const ThermalPrinter = await loadThermalPrinter();
    if (!ThermalPrinter) {
      console.log('📝 Simulação de impressão (impressora não disponível):');
      console.log(`Tarefa: ${task.title}`);
      console.log(`Horário: ${task.time}`);
      console.log(`Descrição: ${task.description}`);
      return;
    }

    const printer = new ThermalPrinter({
      type: 'epson',
      interface: 'tcp://localhost:9100',
      characterSet: 'PC860_PORTUGUESE',
      removeSpecialCharacters: false,
      lineCharacter: '-',
      options: { timeout: 5000 }
    });
    
    await printer.print('\n=== TAREFA FLYLADY ===\n');
    await printer.print(`Título: ${task.title}\n`);
    await printer.print(`Descrição: ${task.description}\n`);
    await printer.print(`Horário: ${task.time}\n`);
    await printer.print(`Categoria: ${task.category}\n`);
    if (task.zone) {
      await printer.print(`Zona: ${task.zone}\n`);
    }
    await printer.print(`Duração estimada: ${task.estimated_duration} min\n`);
    await printer.print('\n======================\n\n');
    
    await printer.execute();
  } catch (error) {
    console.error('Erro ao imprimir:', error);
    throw error;
  }
};

// Função auxiliar para imprimir lista de tarefas
const printTaskListToPrinter = async (tasks: any[], title: string = 'LISTA DE TAREFAS') => {
  try {
    const ThermalPrinter = await loadThermalPrinter();
    if (!ThermalPrinter) {
      console.log('📝 Simulação de impressão de lista (impressora não disponível):');
      console.log(`Total de tarefas: ${tasks.length}`);
      tasks.forEach(task => {
        console.log(`- ${task.time} - ${task.title}`);
      });
      return;
    }

    const printer = new ThermalPrinter({
      type: 'epson',
      interface: 'tcp://localhost:9100',
      characterSet: 'PC860_PORTUGUESE',
      removeSpecialCharacters: false,
      lineCharacter: '-',
      options: { timeout: 5000 }
    });
    
    await printer.print(`\n=== ${title} - FLYLADY ===\n`);
    await printer.print(`Data: ${new Date().toLocaleDateString('pt-BR')}\n`);
    await printer.print(`Total de tarefas: ${tasks.length}\n\n`);
    
    // Organizar por horário
    const sortedTasks = tasks.sort((a, b) => a.time.localeCompare(b.time));
    
    for (const task of sortedTasks) {
      await printer.print(`⏰ ${task.time} - ${task.title}\n`);
      await printer.print(`   ${task.description}\n`);
      await printer.print(`   Categoria: ${task.category} | Duração: ${task.estimated_duration}min\n`);
      if (task.zone) {
        await printer.print(`   Zona: ${task.zone}\n`);
      }
      await printer.print(`   Prioridade: ${task.priority.toUpperCase()}\n`);
      await printer.print('\n');
    }
    
    await printer.print('=================================\n');
    await printer.print('Bom trabalho! 💪\n\n');
    
    await printer.execute();
  } catch (error) {
    console.error('Erro ao imprimir lista:', error);
    throw error;
  }
};

// Testar impressora
router.post('/test', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const ThermalPrinter = await loadThermalPrinter();
    if (!ThermalPrinter) {
      console.log('📝 Simulação de teste de impressora (impressora não disponível):');
      console.log('Status: ✅ Sistema funcionando corretamente!');
      res.json({ message: 'Teste de impressão simulado com sucesso! (impressora não disponível)' });
      return;
    }

    const printer = new ThermalPrinter({
      type: 'epson',
      interface: 'tcp://localhost:9100',
      characterSet: 'PC860_PORTUGUESE',
      removeSpecialCharacters: false,
      lineCharacter: '-',
      options: { timeout: 5000 }
    });
    
    await printer.print('\n=== TESTE DE IMPRESSÃO FLYLADY ===\n');
    await printer.print(`Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);
    await printer.print('Status: ✅ Sistema funcionando corretamente!\n');
    await printer.print('\nSe você está lendo isto,\n');
    await printer.print('sua impressora está configurada\n');
    await printer.print('e funcionando perfeitamente! 🎉\n\n');
    await printer.print('==================================\n\n');
    
    await printer.execute();
    
    res.json({ message: 'Teste de impressão realizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao testar impressora:', error);
    res.status(500).json({ 
      error: 'Erro ao testar impressora', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}));

// Imprimir tarefa específica
router.post('/task/:taskId', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const { taskId } = req.params;
  const userId = req.user!.id;
  
  const task = getTaskById(taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  
  if (task.user_id !== userId) {
    return res.status(403).json({ error: 'Acesso negado à tarefa' });
  }
  
  try {
    await printTaskToPrinter(task);
    res.json({ message: 'Tarefa impressa com sucesso!' });
  } catch (error) {
    console.error('Erro ao imprimir tarefa:', error);
    res.status(500).json({ 
      error: 'Erro ao imprimir tarefa', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}));

// Imprimir todas as tarefas do usuário
router.post('/all-tasks', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  
  const tasks = getTasksByUserId(userId);
  
  if (tasks.length === 0) {
    return res.status(404).json({ error: 'Nenhuma tarefa encontrada' });
  }
  
  try {
    await printTaskListToPrinter(tasks);
    res.json({ 
      message: `Lista com ${tasks.length} tarefas impressa com sucesso!`,
      taskCount: tasks.length
    });
  } catch (error) {
    console.error('Erro ao imprimir lista de tarefas:', error);
    res.status(500).json({ 
      error: 'Erro ao imprimir lista de tarefas', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}));

// Imprimir tarefas de hoje
router.post('/today-tasks', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const today = new Date().getDay(); // 0 = Domingo
  
  const todayTasks = getTasksByDay(userId, today);
  
  if (todayTasks.length === 0) {
    return res.status(404).json({ error: 'Nenhuma tarefa para hoje' });
  }
  
  try {
    await printTaskListToPrinter(todayTasks, 'TAREFAS DO DIA');
    res.json({ 
      message: `Lista com ${todayTasks.length} tarefas de hoje impressa com sucesso!`,
      taskCount: todayTasks.length
    });
  } catch (error) {
    console.error('Erro ao imprimir tarefas de hoje:', error);
    res.status(500).json({ 
      error: 'Erro ao imprimir tarefas de hoje', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}));

export { router as printRouter };