import { Task } from '../types';

// Configurações padrão do sistema FlyLady
export const FLYLADY_CONFIG = {
  zones: {
    1: 'Entrada/Sala de Estar',
    2: 'Cozinha',
    3: 'Banheiro/Área de Serviço',
    4: 'Quarto Principal'
  },
  
  morningRoutine: [
    {
      title: 'Acordar e arrumar a cama',
      description: 'Comece o dia com o quarto organizado',
      time: '07:00',
      estimated_duration: 5,
      priority: 'high' as const
    },
    {
      title: 'Verificar calendário do dia',
      description: 'Revise seus compromissos e tarefas',
      time: '07:05',
      estimated_duration: 5,
      priority: 'high' as const
    },
    {
      title: '15 minutos de limpeza rápida',
      description: 'Limpeza focada em uma área específica',
      time: '07:30',
      estimated_duration: 15,
      priority: 'medium' as const
    }
  ],
  
  eveningRoutine: [
    {
      title: 'Preparar roupas do dia seguinte',
      description: 'Organize o que vai vestir amanhã',
      time: '21:00',
      estimated_duration: 10,
      priority: 'medium' as const
    },
    {
      title: 'Limpar pia da cozinha',
      description: 'Deixe a cozinha pronta para amanhã',
      time: '21:30',
      estimated_duration: 10,
      priority: 'high' as const
    },
    {
      title: 'Verificar calendário para amanhã',
      description: 'Prepare-se para o dia seguinte',
      time: '22:00',
      estimated_duration: 5,
      priority: 'high' as const
    }
  ],
  
  zoneTasks: {
    1: [
      {
        title: 'Organizar sapateira',
        description: 'Arrumar sapatos e limpar entrada',
        time: '10:00',
        estimated_duration: 15,
        priority: 'medium' as const
      },
      {
        title: 'Limpar superfícies da sala',
        description: 'Limpar mesas e prateleiras',
        time: '14:00',
        estimated_duration: 20,
        priority: 'medium' as const
      }
    ],
    2: [
      {
        title: 'Limpar bancada da cozinha',
        description: 'Deixar a bancada limpa e organizada',
        time: '09:00',
        estimated_duration: 15,
        priority: 'high' as const
      },
      {
        title: 'Organizar geladeira',
        description: 'Verificar validade e organizar prateleiras',
        time: '11:00',
        estimated_duration: 20,
        priority: 'low' as const
      }
    ],
    3: [
      {
        title: 'Limpar pia do banheiro',
        description: 'Limpeza completa da pia e torneira',
        time: '08:00',
        estimated_duration: 15,
        priority: 'high' as const
      },
      {
        title: 'Organizar armário de limpeza',
        description: 'Verificar produtos e organizar',
        time: '15:00',
        estimated_duration: 15,
        priority: 'low' as const
      }
    ],
    4: [
      {
        title: 'Organizar guarda-roupa',
        description: 'Dobrar roupas e organizar gavetas',
        time: '16:00',
        estimated_duration: 30,
        priority: 'medium' as const
      },
      {
        title: 'Trocar lençóis',
        description: 'Colocar lençóis limpos na cama',
        time: '10:00',
        estimated_duration: 20,
        priority: 'medium' as const
      }
    ]
  }
};

// Função para gerar tarefas padrão para um usuário
export const generateDefaultTasks = (userId: string): Omit<Task, 'id' | 'created_at' | 'updated_at'>[] => {
  const tasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[] = [];
  
  // Adicionar rotina matinal
  FLYLADY_CONFIG.morningRoutine.forEach((routine, index) => {
    tasks.push({
      user_id: userId,
      title: routine.title,
      description: routine.description,
      time: routine.time,
      repeat_daily: true,
      days: [],
      enabled: true,
      category: 'morning',
      priority: routine.priority,
      estimated_duration: routine.estimated_duration
    });
  });
  
  // Adicionar rotina noturna
  FLYLADY_CONFIG.eveningRoutine.forEach((routine, index) => {
    tasks.push({
      user_id: userId,
      title: routine.title,
      description: routine.description,
      time: routine.time,
      repeat_daily: true,
      days: [],
      enabled: true,
      category: 'evening',
      priority: routine.priority,
      estimated_duration: routine.estimated_duration
    });
  });
  
  // Adicionar tarefas de zona (semana 1 como exemplo)
  FLYLADY_CONFIG.zoneTasks[1].forEach((zoneTask, index) => {
    tasks.push({
      user_id: userId,
      title: zoneTask.title,
      description: zoneTask.description,
      time: zoneTask.time,
      repeat_daily: false,
      days: [1, 2, 3, 4, 5], // Segunda a sexta
      enabled: true,
      category: 'zone',
      zone: 1,
      priority: zoneTask.priority,
      estimated_duration: zoneTask.estimated_duration
    });
  });
  
  // Adicionar tarefas pessoais
  tasks.push({
    user_id: userId,
    title: 'Tomar água',
    description: 'Mantenha-se hidratado ao longo do dia',
    time: '09:00',
    repeat_daily: true,
    days: [],
    enabled: true,
    category: 'personal',
    priority: 'medium',
    estimated_duration: 2
  });
  
  tasks.push({
    user_id: userId,
    title: 'Alongamento rápido',
    description: 'Movimente seu corpo, especialmente se estiver sentado muito tempo',
    time: '15:00',
    repeat_daily: true,
    days: [],
    enabled: true,
    category: 'personal',
    priority: 'medium',
    estimated_duration: 5
  });
  
  return tasks;
};

// Função para determinar a zona da semana atual
export const getCurrentWeekZone = (): number => {
  const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return (currentWeek % 4) + 1; // Retorna 1, 2, 3 ou 4
};

// Função para obter tarefas da zona atual
export const getCurrentZoneTasks = (zoneNumber: number) => {
  return FLYLADY_CONFIG.zoneTasks[zoneNumber as keyof typeof FLYLADY_CONFIG.zoneTasks] || [];
};