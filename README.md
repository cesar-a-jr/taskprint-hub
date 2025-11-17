# FlyLady Task Management System

Sistema completo de gerenciamento de tarefas domésticas baseado no método FlyLady, com impressão automática e lembretes pessoais.

## 🚀 Começando

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou pnpm

### Instalação e Execução

1. **Backend (API)**
```bash
cd api
npm install
npm run dev
```

2. **Frontend (React)**
```bash
# Na raiz do projeto
npm install
npm run dev
```

## 📋 Funcionalidades

### Sistema FlyLady
- **Rotinas Matinais**: Tarefas para começar o dia organizado
- **Rotinas Noturnas**: Preparação para o dia seguinte
- **Zonas Semanais**: Divisão da casa em 4 zonas de limpeza
- **15 Minutos de Limpeza**: Tarefas rápidas e focadas
- **Decluttering**: Organização e desapego

### Impressão Inteligente
- **Agendamento Automático**: Imprime tarefas X minutos antes do horário
- **Layout Otimizado**: Formato térmico claro e organizado
- **Confirmação Visual**: Feedback quando imprimir
- **Teste de Impressão**: Verificação da conexão com impressora

### Lembretes Pessoais
- **Hidratação**: Lembretes para beber água
- **Alongamento**: Alertas para movimentar o corpo
- **Pausa Visual**: Descanso para os olhos
- **Postura**: Verificação de postura sentada
- **Pausas Regulares**: Intervalos de descanso

## 🔧 Estrutura do Projeto

```
/Users/cesaraugusto/dev/taskprint-hub/
├── api/                    # Backend Express + TypeScript
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares (auth, error handling)
│   │   ├── database/       # Acesso aos dados (mock)
│   │   ├── services/       # Lógica de negócio
│   │   └── types/          # Tipos TypeScript
│   └── server.ts          # Arquivo principal
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes React
│   ├── stores/            # Zustand stores
│   ├── pages/             # Páginas principais
│   └── ...
└── package.json           # Dependências do frontend
```

## 📡 API Endpoints

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário

### Tarefas
- `GET /tasks` - Listar tarefas do usuário
- `GET /tasks/today` - Tarefas de hoje
- `GET /tasks/zone/:zoneId` - Tarefas por zona
- `POST /tasks` - Criar nova tarefa
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Deletar tarefa

### Impressão
- `POST /print/task` - Imprimir tarefa específica
- `POST /print/today` - Imprimir tarefas do dia
- `GET /print/test` - Teste de impressão

## 🎯 Como Usar

### 1. Criar Conta
Acesse a aplicação e crie sua conta para começar.

### 2. Configurar Tarefas
- Crie tarefas personalizadas ou use as sugestões FlyLady
- Defina horários, dias da semana e prioridades
- Organize por categorias (manhã, noite, zona, etc.)

### 3. Sistema de Zonas
- **Semana 1**: Zona 1 (Entrada/Sala de Estar)
- **Semana 2**: Zona 2 (Cozinha)
- **Semana 3**: Zona 3 (Banheiro/Área de Serviço)
- **Semana 4**: Zona 4 (Quarto Principal)

### 4. Impressão Automática
- Configure o tempo de antecedência para impressão
- As tarefas serão impressas automaticamente
- Use o botão de teste para verificar a impressora

### 5. Lembretes Pessoais
- Configure lembretes de hidratação, pausas e alongamento
- Receba notificações durante o dia
- Mantenha-se saudável enquanto trabalha em casa

## 🖨️ Configuração da Impressora

O sistema usa impressão térmica via conexão TCP. Configure sua impressora:

1. Conecte a impressora à rede
2. Configure o IP e porta (padrão: localhost:9100)
3. Teste a conexão usando o botão "Teste de Impressão"

## ⚙️ Configurações

### Variáveis de Ambiente (Backend)
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=sua-chave-secreta
CORS_ORIGIN=http://localhost:5173
```

### Configurações do Usuário
- Tempo de antecedência para impressão
- Intervalos de lembretes pessoais
- Layout de impressão (compacto/detalhado)
- Nível de experiência FlyLady

## 🚀 Desenvolvimento

### Backend
```bash
cd api
npm run dev      # Modo desenvolvimento
npm run build    # Build para produção
npm run lint     # Verificar código
```

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run lint     # Verificar código
```

## 📊 Métricas e Relatórios

- Tarefas concluídas por semana
- Tempo gasto por categoria
- Adesão ao método FlyLady
- Progresso nas zonas da casa

## 🔒 Segurança

- Autenticação JWT
- CORS configurado
- Validação de dados com Zod
- Hash de senhas com bcrypt

## 📝 Próximos Passos

- [ ] Implementar banco de dados real (PostgreSQL)
- [ ] Adicionar testes automatizados
- [ ] Implementar WebSocket para notificações real-time
- [ ] Criar aplicativo mobile
- [ ] Adicionar integração com calendários externos
- [ ] Implementar sistema de backup automático

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**FlyLady Task Manager** - Organize sua casa, cuide de si mesma! 💪✨
