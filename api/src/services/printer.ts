import { SerialPort } from 'serialport';

// ESC/POS commands
const CUT = Buffer.from([0x1D, 0x56, 0x00]); // Corte de papel
const NEW_LINE = Buffer.from([0x0A]); // Nova linha
const ALIGN_CENTER = Buffer.from([0x1B, 0x61, 0x01]); // Alinhamento centralizado
const ALIGN_LEFT = Buffer.from([0x1B, 0x61, 0x00]); // Alinhamento à esquerda
const BOLD_ON = Buffer.from([0x1B, 0x45, 0x01]); // Negrito ligado
const BOLD_OFF = Buffer.from([0x1B, 0x45, 0x00]); // Negrito desligado
const DOUBLE_HEIGHT = Buffer.from([0x1D, 0x21, 0x01]); // Altura dupla
const NORMAL_SIZE = Buffer.from([0x1D, 0x21, 0x00]); // Tamanho normal

export class ThermalPrinterService {
  private port: SerialPort | null = null;
  private isConnected = false;
  private portPath: string;
  private baudRate: number;

  constructor(portPath: string = 'COM3', baudRate: number = 9600) {
    this.portPath = portPath;
    this.baudRate = baudRate;
  }

  async connect(): Promise<boolean> {
    try {
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: this.baudRate,
        autoOpen: false,
      });

      return new Promise((resolve) => {
        this.port!.open((err) => {
          if (err) {
            console.error('❌ Erro ao conectar à impressora:', err.message);
            this.isConnected = false;
            resolve(false);
          } else {
            console.log('✅ Impressora conectada com sucesso!');
            this.isConnected = true;
            resolve(true);
          }
        });

        this.port!.on('error', (err) => {
          console.error('❌ Erro na impressora:', err.message);
          this.isConnected = false;
        });

        this.port!.on('close', () => {
          console.log('📄 Conexão com impressora fechada');
          this.isConnected = false;
        });
      });
    } catch (error) {
      console.error('❌ Erro ao criar conexão serial:', error);
      this.isConnected = false;
      return false;
    }
  }

  disconnect(): void {
    if (this.port && this.isConnected) {
      this.port.close();
      this.isConnected = false;
    }
  }

  isPrinterConnected(): boolean {
    return this.isConnected;
  }

  private async writeBuffer(buffer: Buffer): Promise<boolean> {
    if (!this.port || !this.isConnected) {
      console.error('❌ Impressora não conectada');
      return false;
    }

    return new Promise((resolve) => {
      this.port!.write(buffer, (err) => {
        if (err) {
          console.error('❌ Erro ao escrever na impressora:', err.message);
          resolve(false);
        } else {
          this.port!.drain(() => {
            resolve(true);
          });
        }
      });
    });
  }

  async printText(text: string): Promise<boolean> {
    const buffer = Buffer.from(text, 'utf-8');
    return await this.writeBuffer(buffer);
  }

  async printLine(text: string = ''): Promise<boolean> {
    const buffer = Buffer.from(text + '\n', 'utf-8');
    return await this.writeBuffer(buffer);
  }

  async cutPaper(): Promise<boolean> {
    return await this.writeBuffer(CUT);
  }

  async setAlignCenter(): Promise<boolean> {
    return await this.writeBuffer(ALIGN_CENTER);
  }

  async setAlignLeft(): Promise<boolean> {
    return await this.writeBuffer(ALIGN_LEFT);
  }

  async setBold(on: boolean = true): Promise<boolean> {
    return await this.writeBuffer(on ? BOLD_ON : BOLD_OFF);
  }

  async setDoubleHeight(): Promise<boolean> {
    return await this.writeBuffer(DOUBLE_HEIGHT);
  }

  async setNormalSize(): Promise<boolean> {
    return await this.writeBuffer(NORMAL_SIZE);
  }

  formatTask(task: any): string {
    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    
    let diasText = "Diariamente";
    if (!task.repeat_daily && task.days?.length > 0) {
      diasText = task.days.map((d: number) => diasSemana[d - 1]).join(", ");
    }

    return `
==============================
        AVISO PROGRAMADO  
==============================

ID: ${task.id}
Título: ${task.title}
Descrição: ${task.description}
Horário: ${task.time}
Dias: ${diasText}
Categoria: ${task.category}
Prioridade: ${task.priority}
Duração: ${task.estimated_duration} minutos
${task.zone ? `Zona: ${task.zone}` : ''}

==============================

`;
  }

  async printTask(task: any): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.log('📝 Modo simulação - Impressão da tarefa:');
        console.log(this.formatTask(task));
        return true;
      }

      const texto = this.formatTask(task);
      console.log("🖨️ Texto sendo impresso:\n" + texto);

      // Configurar formatação
      await this.setAlignCenter();
      await this.setBold(true);
      await this.setDoubleHeight();
      
      // Imprimir cabeçalho
      await this.printLine("==============================");
      await this.printLine("        AVISO PROGRAMADO      ");
      await this.printLine("==============================");
      
      // Voltar ao normal para o conteúdo
      await this.setNormalSize();
      await this.setAlignLeft();
      await this.setBold(false);
      
      // Imprimir conteúdo
      await this.printLine();
      await this.printLine(`ID: ${task.id}`);
      await this.setBold(true);
      await this.printLine(`Título: ${task.title}`);
      await this.setBold(false);
      await this.printLine(`Descrição: ${task.description}`);
      await this.printLine(`Horário: ${task.time}`);
      
      const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      let diasText = "Diariamente";
      if (!task.repeat_daily && task.days?.length > 0) {
        diasText = task.days.map((d: number) => diasSemana[d - 1]).join(", ");
      }
      await this.printLine(`Dias: ${diasText}`);
      await this.printLine(`Categoria: ${task.category}`);
      await this.printLine(`Prioridade: ${task.priority}`);
      await this.printLine(`Duração: ${task.estimated_duration} minutos`);
      if (task.zone) {
        await this.printLine(`Zona: ${task.zone}`);
      }
      
      await this.printLine();
      await this.printLine("==============================");
      await this.printLine();
      
      // Cortar papel
      await this.cutPaper();
      
      console.log("✔ Impressão concluída e papel cortado!");
      return true;
    } catch (error) {
      console.error('❌ Erro ao imprimir tarefa:', error);
      return false;
    }
  }

  async printTaskList(tasks: any[], title: string = 'LISTA DE TAREFAS'): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.log('📝 Modo simulação - Lista de tarefas:');
        console.log(`Total de tarefas: ${tasks.length}`);
        tasks.forEach(task => {
          console.log(`- ${task.time} - ${task.title}`);
        });
        return true;
      }

      // Configurar formatação do cabeçalho
      await this.setAlignCenter();
      await this.setBold(true);
      await this.setDoubleHeight();
      
      // Imprimir cabeçalho
      await this.printLine(`=== ${title} - FLYLADY ===`);
      
      await this.setNormalSize();
      await this.printLine(`Data: ${new Date().toLocaleDateString('pt-BR')}`);
      await this.printLine(`Total de tarefas: ${tasks.length}`);
      await this.printLine();
      
      // Voltar ao normal para as tarefas
      await this.setAlignLeft();
      await this.setBold(false);
      
      // Organizar por horário
      const sortedTasks = tasks.sort((a, b) => a.time.localeCompare(b.time));
      
      for (const task of sortedTasks) {
        await this.setBold(true);
        await this.printLine(`⏰ ${task.time} - ${task.title}`);
        await this.setBold(false);
        await this.printLine(`   ${task.description}`);
        await this.printLine(`   Categoria: ${task.category} | Duração: ${task.estimated_duration}min`);
        if (task.zone) {
          await this.printLine(`   Zona: ${task.zone}`);
        }
        await this.printLine(`   Prioridade: ${task.priority.toUpperCase()}`);
        await this.printLine();
      }
      
      await this.printLine("=================================");
      await this.setBold(true);
      await this.printLine("Bom trabalho! 💪");
      await this.setBold(false);
      await this.printLine();
      
      // Cortar papel
      await this.cutPaper();
      
      console.log(`✔ Lista com ${tasks.length} tarefas impressa com sucesso!`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao imprimir lista de tarefas:', error);
      return false;
    }
  }
}
