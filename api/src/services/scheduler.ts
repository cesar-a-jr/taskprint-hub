import cron from 'node-cron';
import { findTasksByDay, createTaskHistory, getUserSettings, getAllUsers, getPersonalRemindersByUserId } from '../database/sqlite';
// import ThermalPrinter from 'node-thermal-printer';

// Função para imprimir tarefas que estão próximas do horário
const printUpcomingTasks = async () => {
  console.log('🕐 Verificando tarefas próximas...');
  
  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutos desde meia-noite
    const today = now.getDay();
    
    // Buscar todos os usuários do banco
    const users = getAllUsers();
    
    for (const userId of users) {
      const settings = getUserSettings(userId);
      if (!settings || !settings.print_advance_time) continue;
      
      const advanceMinutes = settings.print_advance_time;
      const tasks = findTasksByDay(userId, today);
      
      // Filtrar tarefas que estão próximas do horário
      const upcomingTasks = tasks.filter((task: any) => {
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskMinutes = hours * 60 + minutes;
        const timeDiff = taskMinutes - currentTime;
        
        return timeDiff > 0 && timeDiff <= advanceMinutes && task.enabled;
      });
      
      if (upcomingTasks.length > 0) {
        console.log(`📋 Encontradas ${upcomingTasks.length} tarefas próximas para usuário ${userId}`);
        
        try {
          // Usar o serviço de impressão que criamos
          const { default: ThermalPrinterService } = await import('./printer');
          const printerService = new ThermalPrinterService('COM3', 9600);
          await printerService.printTaskList(upcomingTasks, 'TAREFAS PRÓXIMAS');
          console.log(`✅ Tarefas impressas com sucesso para usuário ${userId}`);
        } catch (printError) {
          console.error(`❌ Erro ao imprimir para usuário ${userId}:`, printError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tarefas próximas:', error);
  }
};

// Função para enviar lembretes pessoais
const sendPersonalReminders = async () => {
  console.log('💧 Verificando lembretes pessoais...');
  
  try {
    const users = getAllUsers();
    
    for (const user of users) {
      const reminders = getPersonalRemindersByUserId(user);
      const enabledReminders = reminders.filter((r: any) => r.enabled);
      
      if (enabledReminders.length > 0) {
        console.log(`📢 Usuário ${user} tem ${enabledReminders.length} lembretes ativos`);
        // Aqui você pode implementar lógica para enviar notificações
        // Por exemplo, verificar se é hora de enviar um lembrete específico
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar lembretes pessoais:', error);
  }
};

// Função para gerar relatório semanal
const generateWeeklyReport = async () => {
  console.log('📊 Gerando relatório semanal...');
  
  // Implementar lógica de relatório semanal
  // Por enquanto, apenas log
  console.log('📈 Relatório semanal em desenvolvimento');
};

// Iniciar agendamentos
export const startScheduledTasks = () => {
  // Verificar tarefas próximas a cada 15 minutos
  cron.schedule('*/15 * * * *', () => {
    printUpcomingTasks();
  });
  
  // Verificar lembretes pessoais a cada 5 minutos
  cron.schedule('*/5 * * * *', () => {
    sendPersonalReminders();
  });
  
  // Gerar relatório semanal aos domingos às 20h
  cron.schedule('0 20 * * 0', () => {
    generateWeeklyReport();
  });
  
  console.log('⏰ Sistema de agendamento configurado:');
  console.log('  - Tarefas próximas: a cada 15 minutos');
  console.log('  - Lembretes pessoais: a cada 5 minutos');
  console.log('  - Relatório semanal: domingos às 20h');
};