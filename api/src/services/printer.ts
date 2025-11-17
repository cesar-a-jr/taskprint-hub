import { SerialPort } from 'serialport';

// Detectar se estamos em ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

// Em desenvolvimento, criar uma porta mock para testes
let port: SerialPort | null = null;

try {
  if (isDevelopment) {
    console.log('🧪 Modo desenvolvimento: usando impressora mock');
    // Em desenvolvimento, não conecta à porta real
  } else {
    // Em produção, tenta conectar à porta real
    port = new SerialPort({
      path: process.env.PRINTER_PORT || 'COM3', // Configurável via variável de ambiente
      baudRate: 9600,
      autoOpen: false
    });

    port.open((err) => {
      if (err) {
        console.error('❌ Erro ao abrir porta da impressora:', err.message);
        console.log('📝 Verifique se a impressora está conectada e a porta está correta');
        port = null;
      } else {
        console.log('✅ Impressora conectada com sucesso!');
      }
    });

    port.on('error', (err) => {
      console.error('❌ Erro na porta serial:', err.message);
    });
  }
} catch (error) {
  console.error('❌ Erro ao inicializar impressora:', error);
  port = null;
}

// Comandos ESC/POS
const CUT = Buffer.from([0x1D, 0x56, 0x00]);
const NEW_LINE = Buffer.from([0x0A]);
const ALIGN_CENTER = Buffer.from([0x1B, 0x61, 0x01]);
const ALIGN_LEFT = Buffer.from([0x1B, 0x61, 0x00]);
const BOLD_ON = Buffer.from([0x1B, 0x45, 0x01]);
const BOLD_OFF = Buffer.from([0x1B, 0x45, 0x00]);
const DOUBLE_SIZE = Buffer.from([0x1D, 0x21, 0x11]);
const NORMAL_SIZE = Buffer.from([0x1D, 0x21, 0x00]);

interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  repeat_daily: boolean;
  days?: number[];
  category: string;
  zone?: number;
}

function formatTask(task: Task): string {
  const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  
  let diasText = "Diariamente";
  if (!task.repeat_daily && task.days && task.days.length > 0) {
    diasText = task.days.map(d => diasSemana[d - 1]).join(", ");
  }

  return `
==============================
${task.title.toUpperCase()}
==============================

📋 Descrição: ${task.description}
🕐 Horário: ${task.time}
📅 Dias: ${diasText}
🏷️ Categoria: ${task.category}
${task.zone ? `🏠 Zona: ${task.zone}` : ''}

==============================

`;
}

export function printTask(task: Task): Promise<void> {
  return new Promise((resolve, reject) => {
    const texto = formatTask(task);
    
    if (isDevelopment || !port) {
      console.log("🧪 MODO DESENVOLVIMENTO - Texto que seria impresso:");
      console.log("═".repeat(50));
      console.log(texto);
      console.log("═".repeat(50));
      resolve();
      return;
    }

    if (!port || !port.isOpen) {
      reject(new Error('Impressora não conectada'));
      return;
    }

    console.log("🖨️ Texto sendo impresso:\n" + texto);

    const printBuffer = Buffer.concat([
      ALIGN_CENTER,
      BOLD_ON,
      Buffer.from("FLYLADY - TAREFA DO DIA\n"),
      BOLD_OFF,
      ALIGN_LEFT,
      Buffer.from(texto),
      NEW_LINE,
      NEW_LINE,
      NEW_LINE
    ]);

    port.write(printBuffer, (err) => {
      if (err) {
        console.error("❌ Erro ao imprimir:", err);
        reject(err);
        return;
      }

      port!.drain(() => {
        port!.write(CUT, (cutErr) => {
          if (cutErr) {
            console.error("❌ Erro ao cortar papel:", cutErr);
            reject(cutErr);
            return;
          }
          console.log("✅ Impressão concluída e papel cortado!");
          resolve();
        });
      });
    });
  });
}

export function printTaskList(tasks: Task[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      console.log("📄 Nenhuma tarefa para imprimir");
      resolve();
      return;
    }

    if (isDevelopment || !port) {
      console.log(`🧪 MODO DESENVOLVIMENTO - Lista com ${tasks.length} tarefas que seriam impressas:`);
      console.log("═".repeat(50));
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.time} - ${task.title}`);
        console.log(`   ${task.description}`);
        console.log(`   Categoria: ${task.category}`);
        console.log("");
      });
      console.log("═".repeat(50));
      resolve();
      return;
    }

    if (!port || !port.isOpen) {
      reject(new Error('Impressora não conectada'));
      return;
    }

    console.log(`🖨️ Imprimindo lista com ${tasks.length} tarefas...`);

    const header = Buffer.concat([
      ALIGN_CENTER,
      BOLD_ON,
      DOUBLE_SIZE,
      Buffer.from("FLYLADY - LISTA DE TAREFAS\n"),
      NORMAL_SIZE,
      BOLD_OFF,
      ALIGN_LEFT,
      Buffer.from(`Data: ${new Date().toLocaleDateString('pt-BR')}\n`),
      NEW_LINE
    ]);

    const taskBuffers = tasks.map((task, index) => {
      const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      let diasText = "Diário";
      if (!task.repeat_daily && task.days && task.days.length > 0) {
        diasText = task.days.map(d => diasSemana[d - 1]).join(", ");
      }

      return Buffer.concat([
        Buffer.from(`${index + 1}. ${task.time} - ${task.title}\n`),
        Buffer.from(`   ${task.description}\n`),
        Buffer.from(`   📅 ${diasText} | 🏷️ ${task.category}\n`),
        NEW_LINE
      ]);
    });

    const footer = Buffer.concat([
      ALIGN_CENTER,
      Buffer.from("═══════════════════════════════\n"),
      Buffer.from(`Total: ${tasks.length} tarefas\n`),
      NEW_LINE,
      NEW_LINE,
      NEW_LINE
    ]);

    const allBuffers = [header, ...taskBuffers, footer];
    const printBuffer = Buffer.concat(allBuffers);

    port.write(printBuffer, (err) => {
      if (err) {
        console.error("❌ Erro ao imprimir lista:", err);
        reject(err);
        return;
      }

      port!.drain(() => {
        port!.write(CUT, (cutErr) => {
          if (cutErr) {
            console.error("❌ Erro ao cortar papel:", cutErr);
            reject(cutErr);
            return;
          }
          console.log("✅ Lista impressa com sucesso!");
          resolve();
        });
      });
    });
  });
}

export function testPrinter(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isDevelopment || !port) {
      console.log("🧪 MODO DESENVOLVIMENTO - Teste de impressora");
      console.log("═".repeat(50));
      console.log("TESTE DE IMPRESSORA");
      console.log("Impressora conectada com sucesso!");
      console.log(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
      console.log("═".repeat(50));
      resolve();
      return;
    }

    if (!port || !port.isOpen) {
      reject(new Error('Impressora não conectada'));
      return;
    }

    console.log("🧪 Testando impressora...");
    
    const testBuffer = Buffer.concat([
      ALIGN_CENTER,
      BOLD_ON,
      DOUBLE_SIZE,
      Buffer.from("TESTE DE IMPRESSORA\n"),
      NORMAL_SIZE,
      BOLD_OFF,
      ALIGN_LEFT,
      Buffer.from("Impressora conectada com sucesso!\n"),
      Buffer.from(`Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`),
      NEW_LINE,
      NEW_LINE,
      NEW_LINE
    ]);

    port.write(testBuffer, (err) => {
      if (err) {
        console.error("❌ Erro no teste:", err);
        reject(err);
        return;
      }

      port!.drain(() => {
        port!.write(CUT, (cutErr) => {
          if (cutErr) {
            console.error("❌ Erro ao cortar papel:", cutErr);
            reject(cutErr);
            return;
          }
          console.log("✅ Teste concluído!");
          resolve();
        });
      });
    });
  });
}

export default {
  printTask,
  printTaskList,
  testPrinter
};