# 🥗 Daily Diet API

Uma API REST completa para o controle de refeições de usuários, desenvolvida com Node.js, TypeScript, Fastify e SQLite.

## 📋 Características

### 👤 Gerenciamento de Usuários
- ✅ Criar novo usuário
- ✅ Autenticação com JWT
- ✅ Atualizar perfil (nome, email)
- ✅ Alterar senha
- ✅ Visualizar métricas das refeições

### 🍽️ Gerenciamento de Refeições
- ✅ Criar refeição
- ✅ Editar refeição (todos os campos)
- ✅ Deletar refeição
- ✅ Listar todas as refeições do usuário
- ✅ Buscar refeição específica
- ✅ Filtrar refeições por nome, descrição, data ou status de dieta

## 🛠 Stack Tecnológico

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework Web**: Fastify
- **Banco de Dados**: SQLite
- **Query Builder**: Knex.js
- **Autenticação**: JWT (@fastify/jwt)
- **Hash de Senha**: Bcrypt
- **Validação**: Zod
- **UUID**: Crypto (Node.js nativo)
- **Testes**: Vitest

## 📁 Estrutura do Projeto

```
src/
├── app.ts                 # Configuração do Fastify
├── server.ts             # Entry point da aplicação
├── database/
│   ├── database.ts       # Configuração do Knex
│   └── migrations/       # Migrações do banco de dados
├── env/
│   └── index.ts          # Validação de variáveis de ambiente
├── routes/
│   ├── users.ts          # Rotas de usuários
│   └── meals.ts          # Rotas de refeições
├── controllers/
│   ├── usersController.ts   # Lógica de requisição de usuários
│   └── mealsController.ts   # Lógica de requisição de refeições
├── services/
│   ├── usersService.ts      # Regras de negócio de usuários
│   └── mealsService.ts      # Regras de negócio de refeições
├── repositories/
│   ├── usersRepository.ts   # Acesso a dados de usuários
│   └── mealsRepository.ts   # Acesso a dados de refeições
├── middleware/
│   └── verifyUserLoggedIn.ts # Middleware de autenticação
└── utils/
    ├── password.ts       # Funções de hash e verificação de senha
    ├── uuid.ts          # Geração de UUID
    └── datetime.ts      # Funções de data/hora
tests/
├── setup.ts             # Setup dos testes
└── e2e.test.ts          # Testes E2E
```

## 🚀 Começando

### Pré-requisitos

- Node.js v18+
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <https://github.com/leorms11/dailey-diet-api-nodejs.git>
cd daily-diet-api-nodejs
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example e .env.test.example
```

4. Execute as migrações do banco de dados:
```bash
npm run knex -- migrate:latest
```

5. Inicie o servidor:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3333`

## 📚 Endpoints da API

### 📝 Usuários

#### Criar Usuário
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-03-04T...",
    "updatedAt": "2026-03-04T..."
  }
}
```

#### Atualizar Perfil (Requer autenticação)
```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Alterar Senha (Requer autenticação)
```http
PUT /api/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Visualizar Perfil (Requer autenticação)
```http
GET /api/profile
Authorization: Bearer <token>
```

### 🍽️ Refeições

#### Criar Refeição (Requer autenticação)
```http
POST /api/meals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Almoço",
  "description": "Arroz, feijão e salada",
  "date": "2026-03-04 12:30",
  "isOnDiet": true
}
```

#### Listar Refeições (Requer autenticação)
```http
GET /api/meals
Authorization: Bearer <token>
```

#### Buscar Refeição Específica (Requer autenticação)
```http
GET /api/meals/{id}
Authorization: Bearer <token>
```

#### Filtrar Refeições (Requer autenticação)
```http
GET /api/meals?field=name&value=Almoço
Authorization: Bearer <token>

# Opções de field:
# - name: Busca por nome
# - description: Busca por descrição
# - date: Busca por data
# - isOnDiet: Filtrar por status (true/false)
```

#### Atualizar Refeição (Requer autenticação)
```http
PUT /api/meals/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Almoço atualizado",
  "description": "Novo almoço",
  "date": "2026-03-04 12:00",
  "isOnDiet": false
}
```

#### Deletar Refeição (Requer autenticação)
```http
DELETE /api/meals/{id}
Authorization: Bearer <token>
```

#### Métricas do Usuário (Requer autenticação)
```http
GET /api/metrics
Authorization: Bearer <token>

Response:
{
  "totalMeals": 10,
  "totalOnDiet": 7,
  "totalOffDiet": 3,
  "bestOnDietStreak": 4
}
```

## 🧪 Testes

Execute os testes E2E:

```bash
npm test
```

Os testes cobrem:
- ✅ Criação de usuários
- ✅ Autenticação
- ✅ Atualização de perfil
- ✅ Alteração de senha
- ✅ CRUD de refeições
- ✅ Filtros de refeições
- ✅ Métricas do usuário
- ✅ Validações de segurança

## 🔧 Scripts Disponíveis

```bash
# Iniciar servidor em modo desenvolviment com auto-reload
npm run dev

# Executar testes
npm test

# Lint do código
npm run lint

# Fix issues detectados por lint
npm run lint:fix

# Build production
npm build

# Executar migrações
npm run knex -- migrate:latest

# Criar nova migração
npm run knex -- migrate:make NOME_DA_MIGRATION

# Reverter última migração
npm run knex -- migrate:rollback
```

## 📊 Modelo de Dados

### Usuários
```
{
  id: UUID (auto-generated)
  name: string
  email: string (unique)
  password: string (hashed)
  createdAt: ISO 8601 timestamp
  updatedAt: ISO 8601 timestamp
}
```

### Refeições
```
{
  id: UUID (auto-generated)
  name: string
  description: string (optional)
  date: string (DD/MM/YYYY - HH:MM)
  isOnDiet: boolean
  userId: UUID (foreign key)
  createdAt: ISO 8601 timestamp
  updatedAt: ISO 8601 timestamp
}
```

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT
- ✅ Validação de entrada com Zod
- ✅ Isolamento de dados por usuário
- ✅ Middleware de verificação de autenticação

## 📝 Variáveis de Ambiente

```
NODE_ENV=development              # environment (development, production, staging, test)
DATABASE_URL="./src/database/app.db"  # caminho do arquivo SQLite
JWT_SECRET="secret-key"           # chave secreta para JWT (altere em produção)
PORT=3333                         # porta do servidor (padrão: 3333)
```

## 🤝 Regras de Negócio Importantes

1. **Isolamento de Dados**: Cada usuário só pode acessar suas próprias refeições
2. **Validação de Entrada**: Todos os campos são validados conforme especificado
3. **Autenticação Obrigatória**: Rotas de refeição e perfil requerem JWT válido
4. **Criptografia**: Senhas são sempre criptografadas antes do armazenamento
5. **Histórico**: Campos `createdAt` e `updatedAt` são gerenciados automaticamente

## 📖 Exemplos de Uso

### Exemplo Completo com Curl

```bash
# 1. Criar usuário
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# 2. Fazer login
TOKEN=$(curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' | jq -r '.token')

# 3. Criar refeição
curl -X POST http://localhost:3333/api/meals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Almoço",
    "description": "Arroz e feijão",
    "date": "2026-03-04 12:00",
    "isOnDiet": true
  }'

# 4. Listar refeições
curl -X GET http://localhost:3333/api/meals \
  -H "Authorization: Bearer $TOKEN"

# 5. Obter métricas
curl -X GET http://localhost:3333/api/metrics \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Solução de Problemas

### Erro de migração
Se encontrar erros ao executar migrações:
```bash
# Rollback de todas as migrações
npm run knex -- migrate:rollback --all

# Executar novamente
npm run knex -- migrate:latest
```

### Banco de dados corrompido
```bash
# Deletar banco de dados e recriar
rm src/database/app.db
npm run knex -- migrate:latest
```

## 📄 Licença

Este projeto foi criado como parte de um desafio de desenvolvimento backend.

## 👨‍💻 Autor - Leonardo Santos

Desenvolvido como um projeto de aprendizado em Node.js, TypeScript e arquitetura de APIs REST.
