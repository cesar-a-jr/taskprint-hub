import { Database } from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { createUser, createTask, createDefaultUserSettings, createPersonalReminder, findUserByEmail } from './sqlite';

export const seedDatabase = (db: Database) => {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário de teste (se não existir)
    let testUser;
    try {
      // Hash da senha antes de criar o usuário
      const hashedPassword = bcrypt.hashSync('123456', 10);
      testUser = createUser({
        email: 'teste@flylady.com',
        password: hashedPassword,
        name: 'Usuário Teste FlyLady'
      });
      console.log(`✅ Usuário criado: ${testUser.email}`);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('ℹ️ Usuário de teste já existe, atualizando senha');
        // Buscar usuário existente e atualizar senha para hash
        testUser = findUserByEmail('teste@flylady.com');
        if (testUser) {
          // Atualizar senha para versão hash se ainda estiver em texto plano
          const isPlainText = testUser.password === '123456';
          if (isPlainText) {
            const hashedPassword = bcrypt.hashSync('123456', 10);
            const { updateUser } = require('./sqlite');
            updateUser(testUser.id, { password: hashedPassword });
            console.log('✅ Senha do usuário atualizada para hash');
          }
        }
      } else {
        throw error;
      }
    }

    // Criar configurações padrão (se não existirem)
    try {
      if (testUser?.id) {
        createDefaultUserSettings(testUser.id);
        console.log('✅ Configurações criadas');
      } else {
        console.log('⚠️ Usuário não encontrado, pulando configurações');
      }
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('ℹ️ Configurações já existem, pulando criação');
      } else {
        throw error;
      }
    }

    // Tarefas matinais FlyLady
    const morningTasks = [
      {
        title: 'Arrumar a cama',
        description: 'Arrume sua cama assim que levantar. Isso define o tom do dia!',
        time: '07:00',
        repeat_daily: true,
        category: 'morning' as const,
        priority: 'high' as const,
        estimated_duration: 5,
        enabled: true
      },
      {
        title: 'Limpar a pia da cozinha',
        description: 'Deixe a pia limpa e brilhando antes de sair da cozinha',
        time: '07:30',
        repeat_daily: true,
        category: 'morning' as const,
        priority: 'high' as const,
        estimated_duration: 5,
        enabled: true
      },
      {
        title: 'Verificar calendário do dia',
        description: 'Revise seu calendário e prepare-se para o dia',
        time: '08:00',
        repeat_daily: true,
        category: 'morning' as const,
        priority: 'medium' as const,
        estimated_duration: 10,
        enabled: true
      }
    ];

    // Tarefas noturnas FlyLady
    const eveningTasks = [
      {
        title: 'Preparar roupas para amanhã',
        description: 'Selecione e prepare as roupas que usará amanhã',
        time: '21:00',
        repeat_daily: true,
        category: 'evening' as const,
        priority: 'medium' as const,
        estimated_duration: 10,
        enabled: true
      },
      {
        title: 'Limpar a pia antes de dormir',
        description: 'Deixe a pia limpa para começar o dia bem',
        time: '22:00',
        repeat_daily: true,
        category: 'evening' as const,
        priority: 'high' as const,
        estimated_duration: 5,
        enabled: true
      }
    ];

    // Tarefas de zona (semana 1 - Zona 1: Entrada, sala de estar e corredor)
    const zone1Tasks = [
      {
        title: 'Organizar sapateira',
        description: 'Organize os sapatos e limpe a área da entrada',
        time: '10:00',
        repeat_daily: false,
        days: [1], // Segunda-feira
        category: 'zone' as const,
        zone: 1,
        priority: 'medium' as const,
        estimated_duration: 20,
        enabled: true
      },
      {
        title: 'Limpar cantos e rodapés',
        description: 'Limpe os cantos e rodapés da sala de estar',
        time: '14:00',
        repeat_daily: false,
        days: [2], // Terça-feira
        category: 'zone' as const,
        zone: 1,
        priority: 'low' as const,
        estimated_duration: 30,
        enabled: true
      }
    ];

    // Tarefas de desapego
    const declutteringTasks = [
      {
        title: 'Doar 27 itens',
        description: 'Encontre 27 itens para doar ou descartar',
        time: '15:00',
        repeat_daily: false,
        days: [5], // Sexta-feira
        category: 'decluttering' as const,
        priority: 'medium' as const,
        estimated_duration: 30,
        enabled: true
      }
    ];

    // Criar todas as tarefas (somente se não existirem)
    const allTasks = [...morningTasks, ...eveningTasks, ...zone1Tasks, ...declutteringTasks];
    let createdTasks = 0;
    
    allTasks.forEach(task => {
      try {
        if (testUser?.id) {
          createTask({
            ...task,
            user_id: testUser.id,
            days: (task as any).days || []
          });
          createdTasks++;
        } else {
          console.log('⚠️ Usuário não encontrado, pulando tarefas');
        }
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
          console.log(`ℹ️ Tarefa "${task.title}" já existe, pulando`);
        } else {
          throw error;
        }
      }
    });

    console.log(`✅ ${createdTasks} novas tarefas FlyLady criadas`);

    // Criar lembretes pessoais padrão
    if (testUser?.id) {
      const defaultReminders = [
        {
          type: 'water' as const,
          message: '💧 Hora de beber água! Mantenha-se hidratado.',
          frequency: 60,
          enabled: true,
          user_id: testUser.id
        },
        {
          type: 'break' as const,
          message: '⏰ Tempo de uma pausa! Levante e se alongue um pouco.',
          frequency: 90,
          enabled: true,
          user_id: testUser.id
        },
        {
          type: 'stretch' as const,
          message: '🧘 Hora de se alongar! Movimente seu corpo.',
          frequency: 120,
          enabled: true,
          user_id: testUser.id
        },
        {
          type: 'posture' as const,
          message: '🪑 Verifique sua postura! Sentado corretamente?',
          frequency: 45,
          enabled: true,
          user_id: testUser.id
        }
      ];

      defaultReminders.forEach(reminder => {
        try {
          createPersonalReminder({
            ...reminder,
            user_id: testUser.id
          });
        } catch (error: any) {
          if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            console.log(`ℹ️ Lembrete "${reminder.type}" já existe, pulando`);
          } else {
            throw error;
          }
        }
      });
    }

    console.log(`✅ Lembretes pessoais criados`);

    console.log('🎉 Seed do banco de dados concluído com sucesso!');
    console.log('📧 Usuário de teste: teste@flylady.com');
    console.log('🔑 Senha: 123456');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  }
};