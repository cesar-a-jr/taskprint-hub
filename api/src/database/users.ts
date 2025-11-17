import { User } from '../types';

// Simulação de banco de dados - será substituído por banco real
export const users: User[] = [];

// Funções de acesso ao banco (mock)
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const createUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    created_at: new Date(),
    updated_at: new Date()
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): User | null => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updated_at: new Date()
  };
  
  return users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return false;
  
  users.splice(userIndex, 1);
  return true;
};