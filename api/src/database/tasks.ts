import { Task, TaskHistory, UserSettings } from '../types';

// Simulação de banco de dados - será substituído por banco real
export const tasks: Task[] = [];
export const taskHistory: TaskHistory[] = [];
export const userSettings: UserSettings[] = [];

// Funções de acesso ao banco (mock)
export const findTasksByUserId = (userId: string): Task[] => {
  return tasks.filter(task => task.user_id === userId);
};

export const findTaskById = (id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

export const findTasksByDay = (userId: string, dayOfWeek: number): Task[] => {
  return tasks.filter(task => 
    task.user_id === userId && 
    task.enabled && 
    (task.repeat_daily || task.days.includes(dayOfWeek))
  );
};

export const createTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task => {
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    created_at: new Date(),
    updated_at: new Date()
  };
  tasks.push(newTask);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Task | null => {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updated_at: new Date()
  };
  
  return tasks[taskIndex];
};

export const deleteTask = (id: string): boolean => {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) return false;
  
  tasks.splice(taskIndex, 1);
  return true;
};

export const createTaskHistory = (historyData: Omit<TaskHistory, 'id' | 'completed_at'>): TaskHistory => {
  const newHistory: TaskHistory = {
    ...historyData,
    id: Date.now().toString(),
    completed_at: new Date()
  };
  taskHistory.push(newHistory);
  return newHistory;
};

export const getUserSettings = (userId: string): UserSettings | undefined => {
  return userSettings.find(settings => settings.user_id === userId);
};

export const createUserSettings = (settingsData: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>): UserSettings => {
  const newSettings: UserSettings = {
    ...settingsData,
    id: Date.now().toString(),
    created_at: new Date(),
    updated_at: new Date()
  };
  userSettings.push(newSettings);
  return newSettings;
};

export const updateUserSettings = (userId: string, updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at'>>): UserSettings | null => {
  const settingsIndex = userSettings.findIndex(settings => settings.user_id === userId);
  if (settingsIndex === -1) return null;
  
  userSettings[settingsIndex] = {
    ...userSettings[settingsIndex],
    ...updates,
    updated_at: new Date()
  };
  
  return userSettings[settingsIndex];
};