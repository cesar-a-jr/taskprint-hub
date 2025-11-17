import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { PersonalReminder } from '../types';
import { findPersonalRemindersByUserId, createPersonalReminder, updatePersonalReminder, deletePersonalReminder } from '../database/sqlite';

const router = Router();

// Mock database for personal reminders
const personalReminders: PersonalReminder[] = [];

// Get personal reminders
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const userReminders = findPersonalRemindersByUserId(userId);
  res.json(userReminders);
}));

// Create personal reminder
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const { type, message, frequency, enabled } = req.body;
  
  if (!type || !message || !frequency) {
    return res.status(400).json({ error: 'Tipo, mensagem e frequência são obrigatórios' });
  }
  
  const validTypes = ['water', 'break', 'stretch', 'posture', 'eye-care'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }
  
  if (frequency < 15 || frequency > 480) {
    return res.status(400).json({ error: 'Frequência deve ser entre 15 e 480 minutos' });
  }
  
  const newReminder = createPersonalReminder({
    user_id: userId,
    type,
    message,
    frequency,
    enabled: enabled ?? true
  });
  
  res.status(201).json({
    success: true,
    reminder: newReminder
  });
}));

// Update personal reminder
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const reminderId = req.params.id;
  const updates = req.body;
  
  const updatedReminder = updatePersonalReminder(reminderId, updates);
  if (!updatedReminder) {
    return res.status(404).json({ error: 'Lembrete não encontrado' });
  }
  
  res.json({
    success: true,
    reminder: updatedReminder
  });
}));

// Delete personal reminder
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const reminderId = req.params.id;
  
  const deleted = deletePersonalReminder(reminderId);
  if (!deleted) {
    return res.status(404).json({ error: 'Lembrete não encontrado' });
  }
  
  res.json({ success: true });
}));

// Get default personal reminders
router.get('/defaults', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const defaults = [
    {
      type: 'water',
      message: '💧 Hora de beber água! Mantenha-se hidratado.',
      frequency: 60,
      enabled: true
    },
    {
      type: 'break',
      message: '⏰ Tempo de uma pausa! Levante e se alongue um pouco.',
      frequency: 90,
      enabled: true
    },
    {
      type: 'stretch',
      message: '🧘 Hora de se alongar! Movimente seu corpo.',
      frequency: 120,
      enabled: true
    },
    {
      type: 'posture',
      message: '🪑 Verifique sua postura! Sentado corretamente?',
      frequency: 45,
      enabled: true
    },
    {
      type: 'eye-care',
      message: '👁️ Descanse seus olhos! Olhe para algo distante por 20 segundos.',
      frequency: 20,
      enabled: true
    }
  ];
  
  res.json(defaults);
}));

// Add default reminders to user
router.post('/defaults', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  
  // Check if user already has reminders
  const existingReminders = findPersonalRemindersByUserId(userId);
  if (existingReminders.length > 0) {
    return res.status(400).json({ error: 'Você já tem lembretes pessoais configurados' });
  }
  
  const defaults = [
    {
      type: 'water' as const,
      message: '💧 Hora de beber água! Mantenha-se hidratado.',
      frequency: 60,
      enabled: true
    },
    {
      type: 'break' as const,
      message: '⏰ Tempo de uma pausa! Levante e se alongue um pouco.',
      frequency: 90,
      enabled: true
    },
    {
      type: 'stretch' as const,
      message: '🧘 Hora de se alongar! Movimente seu corpo.',
      frequency: 120,
      enabled: true
    },
    {
      type: 'posture' as const,
      message: '🪑 Verifique sua postura! Sentado corretamente?',
      frequency: 45,
      enabled: true
    },
    {
      type: 'eye-care' as const,
      message: '👁️ Descanse seus olhos! Olhe para algo distante por 20 segundos.',
      frequency: 20,
      enabled: true
    }
  ];
  
  const createdReminders = defaults.map((defaultReminder) => {
    return createPersonalReminder({
      user_id: userId,
      ...defaultReminder
    });
  });
  
  res.status(201).json({
    success: true,
    reminders: createdReminders
  });
}));

export { router as remindersRouter };