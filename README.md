# Orbit CRM

Plataforma SaaS de gerenciamento de clientes construída como projeto de estudo para aprofundar e aprimorar meus conhecimentos em arquitetura com Next.js, tRPC, Drizzle, Redis e BullMQ.

## Objetivo

Explorar conceitos reais utilizados em produtos SaaS: multi-tenancy, RBAC, type safety end-to-end, cache distribuído e processamento assíncrono.

## Stack

- **Next.js 16** (App Router)
- **tRPC v11** + TanStack Query
- **Drizzle ORM** + PostgreSQL
- **SuperJSON** (serialização de tipos end-to-end)
- **Redis** + **BullMQ** (futuro)
- **Docker** (desenvolvimento e produção)
- **TypeScript** em toda a stack

## Conceitos Estudados

- Type safety end-to-end (tRPC + Drizzle + TypeScript)
- Multi-tenancy com Shared Database e isolamento por `tenantId`
- RBAC (Owner, Admin, Member)
- Autenticação e autorização
- Processamento assíncrono com filas
- DevOps e pipelines de CI/CD

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

## Documentação

-- Em breve
