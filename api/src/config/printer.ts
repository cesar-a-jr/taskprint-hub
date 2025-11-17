// Configuração da Impressora Térmica
export interface PrinterConfig {
  portPath: string;
  baudRate: number;
  autoConnect: boolean;
  fallbackToMock: boolean;
}

export const defaultPrinterConfig: PrinterConfig = {
  portPath: 'COM3', // Porta padrão - ajuste conforme necessário
  baudRate: 9600,   // Taxa de transmissão padrão
  autoConnect: true, // Tentar conectar automaticamente
  fallbackToMock: true // Usar modo simulação se impressora não estiver disponível
};

// Mapeamento de portas comuns para diferentes sistemas operacionais
export const commonPorts = {
  windows: ['COM1', 'COM2', 'COM3', 'COM4', 'COM5'],
  linux: ['/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyS0', '/dev/ttyS1'],
  mac: ['/dev/cu.usbserial', '/dev/cu.usbmodem', '/dev/tty.usbserial']
};

// Função para detectar o sistema operacional
export function detectOS(): 'windows' | 'linux' | 'mac' {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'mac';
  return 'linux';
}

// Função para obter portas sugeridas baseadas no sistema
export function getSuggestedPorts(): string[] {
  const os = detectOS();
  return commonPorts[os];
}