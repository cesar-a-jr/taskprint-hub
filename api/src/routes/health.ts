import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  res.json({
    message: '✅ FlyLady Task Management System - Servidor Online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}));

router.get('/health', asyncHandler(async (req: any, res: any) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(healthcheck);
}));

export { router as healthRouter };