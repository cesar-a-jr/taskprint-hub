import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { findTasksByUserId, findTasksByDay, findTaskById, findTasksByZone, findTasksByCategory, createTask, updateTask, deleteTask, createTaskHistory } from '../database/sqlite';
import { z } from 'zod';
import { Task } from '../types';

const router = Router();

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
  repeat_daily: z.boolean(),
  days: z.array(z.number().min(0).max(6)).optional(),
  enabled: z.boolean().optional(),
  category: z.enum(['morning', 'evening', 'zone', 'decluttering', 'personal']),
  zone: z.number().min(1).max(4).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimated_duration: z.number().min(1).max(120).optional()
});

// Get all tasks for authenticated user
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const tasks = findTasksByUserId(userId);
  
  res.json(tasks);
}));

// Get today's tasks
router.get('/today', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const today = new Date().getDay(); // 0 = Sunday
  const tasks = findTasksByDay(userId, today);
  
  res.json(tasks);
}));

// Get tasks by zone
router.get('/zone/:zoneId', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const zoneId = parseInt(req.params.zoneId);
  
  if (zoneId < 1 || zoneId > 4) {
    return res.status(400).json({ error: 'Zona deve ser entre 1 e 4' });
  }
  
  const zoneTasks = findTasksByZone(userId, zoneId);
  
  res.json(zoneTasks);
}));

// Get tasks by category
router.get('/category/:category', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const category = req.params.category as Task['category'];
  
  const validCategories = ['morning', 'evening', 'zone', 'decluttering', 'personal'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoria inválida' });
  }
  
  const categoryTasks = findTasksByCategory(userId, category);
  
  res.json(categoryTasks);
}));

// Create new task
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const taskData = taskSchema.parse(req.body);
  
  const newTask = createTask({
    ...taskData,
    user_id: userId,
    enabled: taskData.enabled ?? true,
    priority: taskData.priority || 'medium',
    estimated_duration: taskData.estimated_duration || 15,
    days: taskData.days || []
  });
  
  res.status(201).json({
    success: true,
    task: newTask
  });
}));

// Update task
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  const updates = taskSchema.partial().parse(req.body);
  
  const task = findTaskById(taskId);
  if (!task || task.user_id !== userId) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  
  const updatedTask = updateTask(taskId, updates);
  res.json({
    success: true,
    task: updatedTask
  });
}));

// Delete task
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  
  const task = findTaskById(taskId);
  if (!task || task.user_id !== userId) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  
  const deleted = deleteTask(taskId);
  if (!deleted) {
    return res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
  
  res.json({ success: true });
}));

// Complete task
router.post('/:id/complete', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  const { notes } = req.body;
  
  const task = findTaskById(taskId);
  if (!task || task.user_id !== userId) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  
  const historyEntry = createTaskHistory({
    task_id: taskId,
    user_id: userId,
    notes
  });
  
  res.json({
    success: true,
    history: historyEntry
  });
}));

export { router as tasksRouter };