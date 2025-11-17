import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { User, Task, TaskHistory, UserSettings, PersonalReminder } from '../types';

const dbPath = path.join(__dirname, '../../database.sqlite');
const db: DatabaseType = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
export const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      time TEXT NOT NULL,
      repeat_daily BOOLEAN DEFAULT 0,
      days TEXT DEFAULT '[]',
      enabled BOOLEAN DEFAULT 1,
      category TEXT NOT NULL,
      zone INTEGER,
      priority TEXT DEFAULT 'medium',
      estimated_duration INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    CREATE INDEX IF NOT EXISTS tasks_zone ON tasks(zone);
    CREATE INDEX IF NOT EXISTS idx_tasks_enabled ON tasks(enabled);
  `);

  // Task history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_history (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_task_history_user_id ON task_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_history_completed_at ON task_history(completed_at);
  `);

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      print_advance_time INTEGER DEFAULT 15,
      print_layout TEXT DEFAULT 'compact',
      water_reminder_interval INTEGER DEFAULT 60,
      break_reminder_interval INTEGER DEFAULT 90,
      stretch_reminder_interval INTEGER DEFAULT 120,
      notification_sound BOOLEAN DEFAULT 1,
      theme TEXT DEFAULT 'auto',
      flylady_level TEXT DEFAULT 'beginner',
      house_size TEXT DEFAULT 'medium',
      available_days TEXT DEFAULT '[1,2,3,4,5]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
  `);

  // Personal reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      frequency INTEGER NOT NULL,
      enabled BOOLEAN DEFAULT 1,
      last_triggered DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_personal_reminders_user_id ON personal_reminders(user_id);
    CREATE INDEX IF NOT EXISTS idx_personal_reminders_type ON personal_reminders(type);
    CREATE INDEX IF NOT EXISTS idx_personal_reminders_enabled ON personal_reminders(enabled);
  `);

  console.log('✅ Banco de dados SQLite inicializado com sucesso!');
};

// Helper function to serialize/deserialize arrays
const serializeArray = (arr: any[]): string => JSON.stringify(arr);
const deserializeArray = (str: string): any[] => {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

// User operations
export const createUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, userData.email, userData.password, userData.name, now, now);
  
  // Create default settings for the user
  createDefaultUserSettings(id);
  
  return {
    id,
    email: userData.email,
    password: userData.password,
    name: userData.name,
    created_at: new Date(now),
    updated_at: new Date(now)
  };
};

export const findUserByEmail = (email: string): User | null => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const row = stmt.get(email) as any;
  
  if (!row) return null;
  
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
};

export const findUserById = (id: string): User | null => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
};

export const getAllUsers = (): string[] => {
  const stmt = db.prepare('SELECT id FROM users');
  const rows = stmt.all() as { id: string }[];
  return rows.map(row => row.id);
};

export const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): User | null => {
  const allowedUpdates = ['email', 'password', 'name', 'updated_at'];
  const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key));
  
  if (updateFields.length === 0) return null;
  
  const setClause = updateFields.map(field => `${field} = ?`).join(', ');
  const values = [...Object.values(updates).filter((_, index) => updateFields.includes(Object.keys(updates)[index])), new Date().toISOString(), id];
  
  const stmt = db.prepare(`UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`);
  const result = stmt.run(...values);
  
  if (result.changes === 0) return null;
  
  return findUserById(id);
};

export const deleteUser = (id: string): boolean => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

// Task operations
export const createTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO tasks (
      id, user_id, title, description, time, repeat_daily, days, enabled,
      category, zone, priority, estimated_duration, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    taskData.user_id,
    taskData.title,
    taskData.description,
    taskData.time,
    taskData.repeat_daily ? 1 : 0,
    serializeArray(taskData.days),
    taskData.enabled ? 1 : 0,
    taskData.category,
    taskData.zone || null,
    taskData.priority,
    taskData.estimated_duration,
    now,
    now
  );
  
  return {
    id,
    ...taskData,
    created_at: new Date(now),
    updated_at: new Date(now)
  };
};

export const findTasksByUserId = (userId: string): Task[] => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY time ASC');
  const rows = stmt.all(userId) as any[];
  
  return rows.map(row => ({
    ...row,
    days: deserializeArray(row.days),
    repeat_daily: Boolean(row.repeat_daily),
    enabled: Boolean(row.enabled),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  }));
};

export const findTaskById = (id: string): Task | null => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    ...row,
    days: deserializeArray(row.days),
    repeat_daily: Boolean(row.repeat_daily),
    enabled: Boolean(row.enabled),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
};

export const findTasksByZone = (userId: string, zone: number): Task[] => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND zone = ? AND enabled = 1 ORDER BY time ASC');
  const rows = stmt.all(userId, zone) as any[];
  
  return rows.map(row => ({
    ...row,
    days: deserializeArray(row.days),
    repeat_daily: Boolean(row.repeat_daily),
    enabled: Boolean(row.enabled),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  }));
};

export const findTasksByCategory = (userId: string, category: string): Task[] => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND category = ? AND enabled = 1 ORDER BY time ASC');
  const rows = stmt.all(userId, category) as any[];
  
  return rows.map(row => ({
    ...row,
    days: deserializeArray(row.days),
    repeat_daily: Boolean(row.repeat_daily),
    enabled: Boolean(row.enabled),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  }));
};

export const findTasksByDay = (userId: string, dayOfWeek: number): Task[] => {
  const stmt = db.prepare(`
    SELECT * FROM tasks 
    WHERE user_id = ? 
      AND enabled = 1 
      AND (
        repeat_daily = 1 
        OR days LIKE '%"${dayOfWeek}"%'
      )
    ORDER BY time ASC
  `);
  
  const rows = stmt.all(userId) as any[];
  
  return rows.map(row => ({
    ...row,
    days: deserializeArray(row.days),
    repeat_daily: Boolean(row.repeat_daily),
    enabled: Boolean(row.enabled),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  }));
};

export const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Task | null => {
  const allowedUpdates = [
    'title', 'description', 'time', 'repeat_daily', 'days', 'enabled',
    'category', 'zone', 'priority', 'estimated_duration', 'updated_at'
  ];
  
  const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key));
  
  if (updateFields.length === 0) return null;
  
  // Handle special cases
  const processedUpdates: any = { ...updates };
  if (updates.days) {
    processedUpdates.days = serializeArray(updates.days);
  }
  if (updates.repeat_daily !== undefined) {
    processedUpdates.repeat_daily = updates.repeat_daily ? 1 : 0;
  }
  if (updates.enabled !== undefined) {
    processedUpdates.enabled = updates.enabled ? 1 : 0;
  }
  
  const setClause = updateFields.map(field => `${field} = ?`).join(', ');
  const values = [...Object.values(processedUpdates).filter((_, index) => updateFields.includes(Object.keys(updates)[index])), new Date().toISOString(), id];
  
  const stmt = db.prepare(`UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ?`);
  const result = stmt.run(...values);
  
  if (result.changes === 0) return null;
  
  return findTaskById(id);
};

export const deleteTask = (id: string): boolean => {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

// Task history operations
export const createTaskHistory = (historyData: Omit<TaskHistory, 'id' | 'completed_at'>): TaskHistory => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO task_history (id, task_id, user_id, completed_at, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, historyData.task_id, historyData.user_id, now, historyData.notes || null);
  
  return {
    id,
    ...historyData,
    completed_at: new Date(now)
  };
};

// User settings operations
export const createDefaultUserSettings = (userId: string): UserSettings => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO user_settings (
      id, user_id, print_advance_time, print_layout, water_reminder_interval,
      break_reminder_interval, stretch_reminder_interval, notification_sound,
      theme, flylady_level, house_size, available_days, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    userId,
    15, // print_advance_time
    'compact', // print_layout
    60, // water_reminder_interval
    90, // break_reminder_interval
    120, // stretch_reminder_interval
    1, // notification_sound
    'auto', // theme
    'beginner', // flylady_level
    'medium', // house_size
    serializeArray([1, 2, 3, 4, 5]), // available_days (Monday to Friday)
    now,
    now
  );
  
  return {
    id,
    user_id: userId,
    print_advance_time: 15,
    print_layout: 'compact',
    water_reminder_interval: 60,
    break_reminder_interval: 90,
    stretch_reminder_interval: 120,
    notification_sound: true,
    theme: 'auto',
    flylady_level: 'beginner',
    house_size: 'medium',
    available_days: [1, 2, 3, 4, 5],
    created_at: new Date(now),
    updated_at: new Date(now)
  };
};

export const getUserSettings = (userId: string): UserSettings | null => {
  const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?');
  const row = stmt.get(userId) as any;
  
  if (!row) return null;
  
  return {
    ...row,
    available_days: deserializeArray(row.available_days),
    notification_sound: Boolean(row.notification_sound),
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
};

export const updateUserSettings = (userId: string, updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at'>>): UserSettings | null => {
  const allowedUpdates = [
    'print_advance_time', 'print_layout', 'water_reminder_interval',
    'break_reminder_interval', 'stretch_reminder_interval', 'notification_sound',
    'theme', 'flylady_level', 'house_size', 'available_days', 'updated_at'
  ];
  
  const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key));
  
  if (updateFields.length === 0) return null;
  
  // Handle special cases
  const processedUpdates: any = { ...updates };
  if (updates.available_days) {
    processedUpdates.available_days = serializeArray(updates.available_days);
  }
  if (updates.notification_sound !== undefined) {
    processedUpdates.notification_sound = updates.notification_sound ? 1 : 0;
  }
  
  const setClause = updateFields.map(field => `${field} = ?`).join(', ');
  const values = [...Object.values(processedUpdates).filter((_, index) => updateFields.includes(Object.keys(updates)[index])), new Date().toISOString(), userId];
  
  const stmt = db.prepare(`UPDATE user_settings SET ${setClause}, updated_at = ? WHERE user_id = ?`);
  const result = stmt.run(...values);
  
  if (result.changes === 0) return null;
  
  return getUserSettings(userId);
};

// Personal reminders operations
export const createPersonalReminder = (reminderData: Omit<PersonalReminder, 'id' | 'created_at' | 'updated_at'>): PersonalReminder => {
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO personal_reminders (
      id, user_id, type, message, frequency, enabled, last_triggered, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    reminderData.user_id,
    reminderData.type,
    reminderData.message,
    reminderData.frequency,
    reminderData.enabled ? 1 : 0,
    reminderData.last_triggered ? reminderData.last_triggered.toISOString() : null,
    now,
    now
  );
  
  return {
    id,
    ...reminderData,
    created_at: new Date(now),
    updated_at: new Date(now)
  };
};

export const findPersonalRemindersByUserId = (userId: string): PersonalReminder[] => {
  const stmt = db.prepare('SELECT * FROM personal_reminders WHERE user_id = ? ORDER BY type ASC');
  const rows = stmt.all(userId) as any[];
  
  return rows.map(row => ({
    ...row,
    enabled: Boolean(row.enabled),
    last_triggered: row.last_triggered ? new Date(row.last_triggered) : undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  }));
};

export const updatePersonalReminder = (id: string, updates: Partial<Omit<PersonalReminder, 'id' | 'created_at'>>): PersonalReminder | null => {
  const allowedUpdates = [
    'type', 'message', 'frequency', 'enabled', 'last_triggered', 'updated_at'
  ];
  
  const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key));
  
  if (updateFields.length === 0) return null;
  
  // Handle special cases
  const processedUpdates: any = { ...updates };
  if (updates.enabled !== undefined) {
    processedUpdates.enabled = updates.enabled ? 1 : 0;
  }
  if (updates.last_triggered !== undefined) {
    processedUpdates.last_triggered = updates.last_triggered ? updates.last_triggered.toISOString() : null;
  }
  
  const setClause = updateFields.map(field => `${field} = ?`).join(', ');
  const values = [...Object.values(processedUpdates).filter((_, index) => updateFields.includes(Object.keys(updates)[index])), new Date().toISOString(), id];
  
  const stmt = db.prepare(`UPDATE personal_reminders SET ${setClause}, updated_at = ? WHERE id = ?`);
  const result = stmt.run(...values);
  
  if (result.changes === 0) return null;
  
  return findPersonalReminderById(id);
};

export const deletePersonalReminder = (id: string): boolean => {
  const stmt = db.prepare('DELETE FROM personal_reminders WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

export const findPersonalReminderById = (id: string): PersonalReminder | null => {
  const stmt = db.prepare('SELECT * FROM personal_reminders WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    ...row,
    enabled: Boolean(row.enabled),
    last_triggered: row.last_triggered ? new Date(row.last_triggered) : undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
};

// Initialize database
initializeDatabase();

// Exportar funções que faltavam
export const getTasksByUserId = findTasksByUserId;
export const getTasksByDay = findTasksByDay;
export const getTaskById = findTaskById;
export const getTasksByZone = findTasksByZone;
export const getTasksByCategory = findTasksByCategory;
export const getUserById = findUserById;
export const getPersonalRemindersByUserId = findPersonalRemindersByUserId;
export const createUserSettings = createDefaultUserSettings;

export default db;