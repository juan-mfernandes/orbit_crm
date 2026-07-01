# Plano de Acao Tecnico - Orbit CRM

Baseado no README e no estado atual da aplicacao, este plano prioriza os conceitos que o projeto quer estudar: multi-tenancy, RBAC, type safety end-to-end, cache distribuido e processamento assincrono.

## 1. Analise de Impacto Multi-Tenant

### Objetivo arquitetural
Construir um CRM SaaS com banco compartilhado e isolamento logico por tenant, garantindo que todo dado de negocio seja sempre filtrado por `tenantId`.

### Riscos principais
- Vazamento de dados entre empresas ao esquecer filtros por `tenantId`.
- Escalada indevida de privilegios ao validar papel do usuario apenas no frontend.
- Acoplamento precoce entre dominios antes da base de autenticacao e autorizacao estar pronta.

### Mitigacoes
- Toda tabela de negocio deve conter `tenantId` com referencia a `tenants.id`.
- Todo acesso a dados deve sair de procedures protegidas que recebam `tenantId` via contexto.
- RBAC deve ser aplicado no backend, nunca apenas na interface.
- Criar helpers centrais para `requireTenant`, `requireRole` e filtros padrao por tenant.

## 2. Passo 1: Banco de Dados

### Objetivo
Introduzir a espinha dorsal multi-tenant antes dos modulos do CRM.

### Ordem de modelagem
1. `tenants`
2. `users`
3. `memberships` ou `tenantUsers`
4. `sessions` ou integracao com provider de auth
5. `accounts` se houver login social
6. Tabelas de dominio: `customers`, `contacts`, `deals`, `activities`, `notes`, `tags`

### Schema sugerido com Drizzle
```ts
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "admin", "member"]);
export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: roleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  title: text("title").notNull(),
  valueCents: integer("value_cents").notNull().default(0),
  stage: dealStageEnum("stage").notNull().default("lead"),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  dealId: uuid("deal_id").references(() => deals.id),
  actorUserId: uuid("actor_user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Comando de migration
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Decisao de escopo
Para estudo, vale começar com `tenants`, `users`, `memberships`, `customers` e `deals`. `activities` entra logo depois para auditar interacoes e alimentar jobs futuros.

## 3. Passo 2: Backend (tRPC)

### Objetivo
Sair do `publicProcedure` puro e estruturar contexto, autenticacao, tenant e autorizacao.

### Camadas a criar
- `createTRPCContext` com `user`, `session`, `tenantId`, `role`
- `publicProcedure`
- `protectedProcedure`
- `tenantProcedure`
- `roleProcedure(["owner" | "admin" | "member"])`

### Routers iniciais
```ts
appRouter = router({
  health,
  auth,
  tenants,
  customers,
  deals,
  dashboard,
});
```

### Procedures sugeridas

#### `auth`
- `signIn`
- `signOut`
- `me`
- `switchTenant`

#### `tenants`
- `listMyTenants`
- `createTenant`
- `inviteMember`
- `listMembers`
- `changeMemberRole`

#### `customers`
- `list`
- `getById`
- `create`
- `update`
- `archive`

#### `deals`
- `list`
- `getPipeline`
- `create`
- `updateStage`
- `updateValue`
- `remove`

#### `dashboard`
- `summary`
- `recentActivities`
- `pipelineMetrics`

### Inputs com Zod
```ts
const createCustomerInput = z.object({
  name: z.string().min(2),
  email: z.email().optional(),
  phone: z.string().min(8).optional(),
  company: z.string().min(2).optional(),
  ownerUserId: z.uuid().optional(),
});

const createDealInput = z.object({
  customerId: z.uuid(),
  title: z.string().min(3),
  valueCents: z.number().int().nonnegative(),
  stage: z.enum(["lead", "qualified", "proposal", "won", "lost"]).optional(),
});
```

### Regras de backend para estudo
- Toda query de negocio deve filtrar por `tenantId`.
- Toda mutacao relevante deve validar papel do usuario.
- Centralizar erros com `TRPCError` para mapear `UNAUTHORIZED`, `FORBIDDEN` e `NOT_FOUND`.
- Manter retorno tipado para consumo direto no frontend sem DTOs duplicados.

## 4. Passo 3: Background Jobs e Cache

### Quando introduzir Redis
Redis entra depois que CRUD multi-tenant e RBAC estiverem funcionando. Antes disso, ele aumenta complexidade sem agregar tanto ao aprendizado principal.

### Jobs BullMQ recomendados

#### Job 1: `activity-log`
- Disparado em criacao e mudanca de status de deals.
- Salva eventos de auditoria e timeline.
- Bom para estudar desacoplamento entre mutacao principal e efeitos colaterais.

#### Job 2: `daily-dashboard-refresh`
- Consolida metricas de pipeline e performance por tenant.
- Pode alimentar widgets da home do CRM.

#### Job 3: `import-customers`
- Processa CSV em lote.
- Excelente para estudar fila, retries, progresso e idempotencia.

### Cache Redis sugerido
- `dashboard:summary:{tenantId}` com TTL curto.
- `pipeline:metrics:{tenantId}` com TTL curto.
- `tenant:members:{tenantId}` se a leitura ficar frequente.

### Regras de invalidação
- Criacao ou alteracao de customer invalida listas e dashboard basico.
- Mudanca em deal invalida pipeline e summary do tenant.
- Troca de membros invalida cache de permissao e membros do tenant.

## 5. Passo 4: Frontend

### Estrategia de composicao
- Server Components para layout autenticado, carregamento inicial de sessao e tenant atual.
- Client Components para formularios, filtros, drag-and-drop de pipeline e mutacoes via TanStack Query.

### Estrutura de paginas recomendada
- `/login`
- `/select-tenant`
- `/app/dashboard`
- `/app/customers`
- `/app/customers/[id]`
- `/app/deals`
- `/app/settings/members`

### Componentes principais
- `AppShell`
- `TenantSwitcher`
- `PermissionGate`
- `CustomersTable`
- `CustomerForm`
- `DealsPipeline`
- `DealStageColumn`
- `DashboardCards`
- `MembersManager`

### Uso de optimistic updates
Vale usar em:
- criacao rapida de customer
- movimentacao de deal no pipeline
- troca de role de membro

Nao vale no inicio para:
- login
- switch de tenant
- imports em lote

### Ordem de entrega no frontend
1. Login e selecao de tenant
2. Dashboard simples com metricas basicas
3. CRUD de customers
4. Pipeline de deals
5. Gestao de membros e roles
6. Timeline de atividades
7. Importacao em lote e feedback assincroco

## 6. Plano de Acao por Fases

### Fase 0 - Fundacao tecnica
- Adicionar Drizzle ORM e configuracao de conexao com Postgres.
- Definir estrutura de pastas para `db`, `schemas`, `services` e `routers`.
- Introduzir variaveis de ambiente validadas.
- Evoluir `createTRPCContext` para suportar sessao.

### Fase 1 - Multi-tenancy e Auth
- Criar tabelas `tenants`, `users` e `memberships`.
- Implementar autenticacao.
- Resolver tenant atual no contexto.
- Criar `protectedProcedure` e `tenantProcedure`.

### Fase 2 - RBAC e gestao de membros
- Implementar guardas por role.
- Criar tela de membros do tenant.
- Permitir invite e alteracao de papeis.

### Fase 3 - CRM core
- Implementar CRUD de customers.
- Implementar CRUD de deals.
- Criar pipeline por estagio.
- Expor dashboard com KPIs basicos.

### Fase 4 - Assincronia e cache
- Subir Redis local.
- Integrar BullMQ.
- Registrar atividades por job.
- Cachear dashboard e pipeline.

### Fase 5 - DevOps e maturidade
- Dockerizar app, Postgres e Redis.
- Criar pipeline CI com lint, build e testes.
- Adicionar seeds e dados de demo.
- Documentar arquitetura e decisoes tecnicas.

## 7. Checklist de Funcionalidades do CRM alinhado aos objetivos de estudo

### Essencial para o objetivo do projeto
- [ ] Autenticacao com sessao segura.
- [ ] Selecao e troca de tenant por usuario.
- [ ] Isolamento de dados por `tenantId` em todas as tabelas de negocio.
- [ ] RBAC com papeis `owner`, `admin` e `member`.
- [ ] Contexto tRPC com `user`, `tenantId` e `role`.
- [ ] Procedures protegidas e autorizadas no backend.
- [ ] Validacao de input com Zod em toda mutacao.
- [ ] Type safety end-to-end entre frontend, tRPC e banco.

### Core funcional do CRM
- [ ] Cadastro e listagem de clientes.
- [ ] Edicao e arquivamento de clientes.
- [ ] Cadastro de deals vinculados a clientes.
- [ ] Pipeline de vendas por estagio.
- [ ] Dashboard com quantidade de clientes, deals por etapa e valor total em aberto.
- [ ] Historico basico de atividades por cliente ou deal.

### Funcionalidades orientadas ao estudo avancado
- [ ] Cache Redis para dashboard e pipeline.
- [ ] Jobs BullMQ para auditoria e agregacao de metricas.
- [ ] Importacao assincorna de clientes via CSV.
- [ ] Invalicao de cache por tenant apos mutacoes.
- [ ] Retries e tratamento de falhas em jobs.

### Funcionalidades de maturidade tecnica
- [ ] Docker Compose com app, Postgres e Redis.
- [ ] Seeds para ambiente local.
- [ ] Health check de app e dependencias.
- [ ] Testes de autorizacao por tenant e role.
- [ ] CI com lint e build.
- [ ] README expandido com arquitetura, fluxo de tenant e roadmap.

## 8. Checklist de Execucao sugerido
- [ ] Preparar banco, Drizzle e env validation.
- [ ] Modelar `tenants`, `users` e `memberships`.
- [ ] Implementar autenticacao e sessao.
- [ ] Injetar `tenantId` e `role` no contexto tRPC.
- [ ] Criar guardas `protectedProcedure` e `roleProcedure`.
- [ ] Entregar CRUD de customers.
- [ ] Entregar CRUD e pipeline de deals.
- [ ] Montar dashboard inicial.
- [ ] Adicionar timeline de atividades.
- [ ] Integrar Redis e cachear consultas de leitura intensa.
- [ ] Integrar BullMQ para auditoria e importacao.
- [ ] Dockerizar stack e configurar CI.
- [ ] Documentar aprendizados e decisoes de arquitetura.
