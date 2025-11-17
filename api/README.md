# FlyLady Task Management System - Backend

## Descrição

Backend para o sistema de gerenciamento de tarefas baseado no método FlyLady, com suporte a impressão automática e lembretes pessoais.

## Tecnologias

- Node.js
- TypeScript
- Express.js
- JWT para autenticação
- node-cron para agendamento
- node-thermal-printer para impressão

## Instalação

```bash
cd api
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure as variáveis de ambiente:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=sua-chave-secreta-aqui
CORS_ORIGIN=http://localhost:5173
```

## Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Rotas da API

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário

### Tarefas
- `GET /tasks` - Listar tarefas do usuário
- `GET /tasks/today` - Tarefas de hoje
- `GET /tasks/zone/:zoneId` - Tarefas por zona
- `GET /tasks/category/:category` - Tarefas por categoria
- `POST /tasks` - Criar nova tarefa
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Deletar tarefa
- `POST /tasks/:id/complete` - Marcar tarefa como concluída

### Usuários
- `GET /users/profile` - Perfil do usuário
- `PUT /users/profile` - Atualizar perfil
- `GET /users/settings` - Configurações do usuário
- `PUT /users/settings` - Atualizar configurações
- `DELETE /users/account` - Deletar conta

### Impressão
- `POST /print/task` - Imprimir tarefa específica
- `POST /print/today` - Imprimir tarefas do dia
- `GET /print/test` - Teste de impressão

### Lembretes Pessoais
- `GET /reminders` - Listar lembretes
- `POST /reminders` - Criar lembrete
- `PUT /reminders/:id` - Atualizar lembrete
- `DELETE /reminders/:id` - Deletar lembrete
- `GET /reminders/defaults` - Lembretes padrão
- `POST /reminders/defaults` - Adicionar lembretes padrão

## Sistema de Agendamento

O sistema possui agendamentos automáticos:

- **Tarefas próximas**: Verifica e imprime tarefas próximas do horário a cada 15 minutos
- **Lembretes pessoais**: Envia lembretes de cuidados pessoais a cada 5 minutos
- **Relatório semanal**: Gera relatório de produtividade aos domingos às 20h

## Estrutura do Projeto

```
api/
├── src/
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middlewares (auth, error handling)
│   ├── database/        # Acesso aos dados (mock por enquanto)
│   ├── services/        # Lógica de negócio
│   ├── types/           # Tipos TypeScript
│   └── server.ts        # Arquivo principal
├── dist/                # Arquivos compilados
└── package.json
```

## Configuração da Impressora

Para impressão térmica, configure a conexão com sua impressora no arquivo `src/routes/print.ts`. O padrão está configurado para conexão TCP na porta 9100.

## Próximos Passos

- [ ] Implementar banco de dados real (PostgreSQL/MongoDB)
- [ ] Adicionar testes automatizados
- [ ] Implementar WebSocket para notificações em tempo real
- [ ] Adicionar integração com calendários externos
- [ ] Criar sistema de backup automático