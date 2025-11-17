export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  time: string; // HH:MM format
  repeat_daily: boolean;
  days: number[]; // 0-6 (Sunday to Saturday)
  enabled: boolean;
  category: 'morning' | 'evening' | 'zone' | 'decluttering' | 'personal';
  zone?: number; // 1-4 for zone tasks
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number; // minutes
  created_at: Date;
  updated_at: Date;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: Date;
  notes?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  print_advance_time: number; // minutes before task time
  print_layout: 'compact' | 'detailed';
  water_reminder_interval: number; // minutes
  break_reminder_interval: number; // minutes
  stretch_reminder_interval: number; // minutes
  notification_sound: boolean;
  theme: 'light' | 'dark' | 'auto';
  flylady_level: 'beginner' | 'intermediate' | 'advanced';
  house_size: 'small' | 'medium' | 'large';
  available_days: number[]; // 0-6 (Sunday to Saturday)
  created_at: Date;
  updated_at: Date;
}

export interface PersonalReminder {
  id: string;
  user_id: string;
  type: 'water' | 'break' | 'stretch' | 'posture' | 'eye-care';
  message: string;
  frequency: number; // minutes
  enabled: boolean;
  last_triggered?: Date;
  created_at: Date;
  updated_at: Date;
}