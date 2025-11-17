// @ts-ignore
import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  repeat_daily: boolean;
  days: number[];
  enabled: boolean;
  category: 'morning' | 'evening' | 'zone' | 'decluttering' | 'personal';
  zone?: number;
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserSettings {
  print_advance_time: number;
  print_layout: 'compact' | 'detailed';
  water_reminder_interval: number;
  break_reminder_interval: number;
  stretch_reminder_interval: number;
  notification_sound: boolean;
  theme: 'light' | 'dark' | 'auto';
  flylady_level: 'beginner' | 'intermediate' | 'advanced';
  house_size: 'small' | 'medium' | 'large';
  available_days: number[];
}

interface TaskState {
  tasks: Task[];
  todayTasks: Task[];
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchTodayTasks: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string, notes?: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  printTask: (taskId: string) => Promise<void>;
  printTodayTasks: () => Promise<void>;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  todayTasks: [],
  settings: null,
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/tasks', {
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error('Erro ao carregar tarefas');
      
      const tasks = await response.json();
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar tarefas', loading: false });
    }
  },

  fetchTodayTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/tasks/today', {
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error('Erro ao carregar tarefas de hoje');
      
      const todayTasks = await response.json();
      set({ todayTasks, loading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar tarefas de hoje', loading: false });
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/users/settings', {
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error('Erro ao carregar configurações');
      
      const settings = await response.json();
      set({ settings, loading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar configurações', loading: false });
    }
  },

  createTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(task)
      });
      
      if (!response.ok) throw new Error('Erro ao criar tarefa');
      
      await get().fetchTasks();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao criar tarefa', loading: false });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar tarefa');
      
      await get().fetchTasks();
      await get().fetchTodayTasks();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao atualizar tarefa', loading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error('Erro ao deletar tarefa');
      
      await get().fetchTasks();
      await get().fetchTodayTasks();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao deletar tarefa', loading: false });
      throw error;
    }
  },

  completeTask: async (id, notes) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}/complete`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) throw new Error('Erro ao completar tarefa');
      
      await get().fetchTasks();
      await get().fetchTodayTasks();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao completar tarefa', loading: false });
      throw error;
    }
  },

  updateSettings: async (settings) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/users/settings', {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar configurações');
      
      await get().fetchSettings();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao atualizar configurações', loading: false });
      throw error;
    }
  },

  printTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3000/print/task/${taskId}`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ taskId })
      });
      
      if (!response.ok) throw new Error('Erro ao imprimir tarefa');
      
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao imprimir tarefa', loading: false });
      throw error;
    }
  },

  printTodayTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/print/today', {
        method: 'POST',
        headers: getAuthHeader()
      });
      
      if (!response.ok) throw new Error('Erro ao imprimir tarefas de hoje');
      
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao imprimir tarefas de hoje', loading: false });
      throw error;
    }
  }
}));