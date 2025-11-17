import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { findUserById, updateUser, deleteUser, getUserSettings, createDefaultUserSettings, updateUserSettings } from '../database/sqlite';
import { z } from 'zod';

const router = Router();

const settingsSchema = z.object({
  print_advance_time: z.number().min(5).max(120).optional(),
  print_layout: z.enum(['compact', 'detailed']).optional(),
  water_reminder_interval: z.number().min(15).max(180).optional(),
  break_reminder_interval: z.number().min(15).max(180).optional(),
  stretch_reminder_interval: z.number().min(30).max(240).optional(),
  notification_sound: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  flylady_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  house_size: z.enum(['small', 'medium', 'large']).optional(),
  available_days: z.array(z.number().min(0).max(6)).optional()
});

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const user = findUserById(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at
  });
}));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const { name } = req.body;
  
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome deve ter no mínimo 2 caracteres' });
  }
  
  const updatedUser = updateUser(userId, { name: name.trim() });
  if (!updatedUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json({
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      created_at: updatedUser.created_at
    }
  });
}));

// Get user settings
router.get('/settings', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  let settings = getUserSettings(userId);
  
  // Create default settings if not exists
  if (!settings) {
    settings = createDefaultUserSettings(userId);
  }
  
  res.json(settings);
}));

// Update user settings
router.put('/settings', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const updates = settingsSchema.parse(req.body);
  
  const updatedSettings = updateUserSettings(userId, updates);
  if (!updatedSettings) {
    return res.status(404).json({ error: 'Configurações não encontradas' });
  }
  
  res.json({
    success: true,
    settings: updatedSettings
  });
}));

// Delete user account
router.delete('/account', authenticateToken, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  
  const deleted = deleteUser(userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json({ success: true, message: 'Conta deletada com sucesso' });
}));

export { router as usersRouter };