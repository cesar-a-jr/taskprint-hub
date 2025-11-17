import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getTaskById, getTasksByUserId, getTasksByDay } from '../database/sqlite';
import ThermalPrinterService from '../services/printer';

// Criar instância do serviço de impressão
const printerService = new ThermalPrinterService('COM3', 9600);

const router = Router();

// Função auxiliar para imprimir tarefa
const printTaskToPrinter = async (task: any) => {
  try {
    return await printerService.printTask(task);
  } catch (error) {
    console.error('Erro ao imprimir tarefa:', error);
    throw error;
  }
};

// Função auxiliar para imprimir lista de tarefas
const printTaskListToPrinter = async (tasks: any[], title: string = 'LISTA DE TAREFAS') => {
  try {
    return await printerService.printTaskList(tasks, title);
  } catch (error) {
    console.error('Erro ao imprimir lista:', error);
    throw error;
  }
};

// Testar impressora
router.post('/test', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    // Tentar conectar à impressora
    const connected = await printerService.connect();
    
    if (!connected) {
      console.log('📝 Simulação de teste de impressora (impressora não disponível):');
      console.log('Status: ✅ Sistema funcionando corretamente!');
      res.json({ message: 'Teste de impressão simulado com sucesso! (impressora não disponível)' });
      return;
    }

    // Imprimir teste
    await printerService.setAlignCenter();
    await printerService.setBold(true);
    await printerService.setDoubleHeight();
    
    await printerService.printLine("==============================");
    await printerService.printLine("=== TESTE DE IMPRESSÃO FLYLADY ===");
    await printerService.printLine("==============================");
    
    await printerService.setNormalSize();
    await printerService.printLine();
    await printerService.printLine(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
    await printerService.printLine();
    await printerService.setBold(true);
    await printerService.printLine('Status: ✅ Sistema funcionando corretamente!');
    await printerService.setBold(false);
    await printerService.printLine();
    await printerService.printLine('Se você está lendo isto,');
    await printerService.printLine('sua impressora está configurada');
    await printerService.printLine('e funcionando perfeitamente! 🎉');
    await printerService.printLine();
    await printerService.printLine("==================================");
    await printerService.printLine();
    
    // Cortar papel
    await printerService.cutPaper();
    
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