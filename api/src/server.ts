import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { tasksRouter } from './routes/tasks';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { printRouter } from './routes/print';
import { remindersRouter } from './routes/reminders';
import { errorHandler } from './middleware/errorHandler';
import { startScheduledTasks } from './services/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRouter);
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);
app.use('/print', printRouter);
app.use('/reminders', remindersRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor FlyLady rodando na porta ${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Iniciar tarefas agendadas
  startScheduledTasks();
  console.log('⏰ Sistema de agendamento iniciado');
});

export default app;