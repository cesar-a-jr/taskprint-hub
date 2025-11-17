import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { createUser, findUserByEmail } from '../database/sqlite';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres')
});

// Login
router.post('/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = loginSchema.parse(req.body);
  
  const user = findUserByEmail(email);
  if (!user) {
    throw createError('Credenciais inválidas', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createError('Credenciais inválidas', 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
}));

// Register
router.post('/register', asyncHandler(async (req: any, res: any) => {
  const { email, password, name } = registerSchema.parse(req.body);
  
  // Check if user exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw createError('Email já cadastrado', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = createUser({
    email,
    password: hashedPassword,
    name
  });

  // Generate token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    }
  });
}));

export { router as authRouter };