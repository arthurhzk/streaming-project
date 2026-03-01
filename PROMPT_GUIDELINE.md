# Guia de Prompts — Criando Services e Packages

> Como escrever prompts eficientes para criação de novos serviços e packages neste monorepo,
> gastando o mínimo de tokens sem perder qualidade.

---

## Princípios Gerais

**Referencie, não repita.** Os docs já existem. Aponte para eles em vez de copiar as regras no prompt.

**Liste os arquivos esperados.** Sem isso o agente decide o escopo sozinho e pode gerar mais do que você precisa.

**Passe só o que é específico.** Nome, porta, stack, env vars — o que muda de serviço para serviço. O resto está nos docs.

**Silencie o resumo final.** Agentes adoram explicar o que fizeram. "Não explique o que fez" economiza 300–500 tokens por resposta.

**Um objetivo por prompt.** Misturar "cria o serviço + configura o banco + adiciona autenticação" em um prompt só aumenta chance de erro e desperdiça tokens em retrabalho.

---

## Criando um Novo Serviço

### Prompt base

```
Crie o serviço {nome-do-servico} seguindo ADDING-NEW-SERVICES.md e TYPESCRIPT-CONFIG.md.

Stack: {ex: NestJS + Prisma + PostgreSQL}
Porta padrão: {ex: 3001}
Env vars: {ex: DATABASE_URL, JWT_SECRET, PORT}

Arquivos esperados:
- apps/{nome-do-servico}/package.json
- apps/{nome-do-servico}/tsconfig.json
- apps/{nome-do-servico}/.eslintrc.js
- apps/{nome-do-servico}/.prettierrc.js
- apps/{nome-do-servico}/vitest.config.ts
- apps/{nome-do-servico}/src/index.ts
- apps/{nome-do-servico}/src/config/env.ts
- apps/{nome-do-servico}/README.md

Não explique o que fez, só gere os arquivos.
```

### Exemplo preenchido

```
Crie o serviço auth-service seguindo ADDING-NEW-SERVICES.md e TYPESCRIPT-CONFIG.md.

Stack: NestJS + Prisma + PostgreSQL
Porta padrão: 3001
Env vars: DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT

Arquivos esperados:
- apps/auth-service/package.json
- apps/auth-service/tsconfig.json
- apps/auth-service/.eslintrc.js
- apps/auth-service/.prettierrc.js
- apps/auth-service/vitest.config.ts
- apps/auth-service/src/index.ts
- apps/auth-service/src/config/env.ts
- apps/auth-service/README.md

Não explique o que fez, só gere os arquivos.
```

### Quando adicionar contexto extra

Só inclua informações adicionais se forem realmente específicas do serviço e não estiverem cobertas pelos docs:

```
Crie o serviço notification-service seguindo ADDING-NEW-SERVICES.md e TYPESCRIPT-CONFIG.md.

Stack: NestJS + BullMQ + Redis
Porta padrão: 3003
Env vars: REDIS_URL, PORT, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

Contexto adicional:
- Este serviço é apenas um worker, não expõe HTTP
- Consome eventos da fila "notifications" no Redis
- Não precisa de banco de dados relacional

Arquivos esperados:
- apps/notification-service/package.json
- apps/notification-service/tsconfig.json
- apps/notification-service/.eslintrc.js
- apps/notification-service/.prettierrc.js
- apps/notification-service/vitest.config.ts
- apps/notification-service/src/index.ts
- apps/notification-service/src/config/env.ts
- apps/notification-service/README.md

Não explique o que fez, só gere os arquivos.
```

---

## Criando um Novo Package

### Prompt base

```
Crie o package {nome-do-package} seguindo MONOREPO-STRUCTURE.md.

Propósito: {descrição em uma linha do que o package faz}
Consumido por: {ex: auth-service, user-service}
Exporta: {ex: funções utilitárias de validação de CPF e CNPJ}

Arquivos esperados:
- packages/{nome-do-package}/package.json
- packages/{nome-do-package}/tsconfig.json
- packages/{nome-do-package}/src/index.ts

Não explique o que fez, só gere os arquivos.
```

### Exemplo — package de utilitários compartilhados

```
Crie o package shared-validators seguindo MONOREPO-STRUCTURE.md.

Propósito: validações reutilizáveis de dados brasileiros
Consumido por: auth-service, user-service, payment-service
Exporta: funções para validar CPF, CNPJ e telefone

Arquivos esperados:
- packages/shared-validators/package.json
- packages/shared-validators/tsconfig.json
- packages/shared-validators/src/index.ts
- packages/shared-validators/src/cpf.ts
- packages/shared-validators/src/cnpj.ts
- packages/shared-validators/src/phone.ts

Não explique o que fez, só gere os arquivos.
```

### Exemplo — package de tipos compartilhados

```
Crie o package shared-types seguindo MONOREPO-STRUCTURE.md.

Propósito: contratos de tipos TypeScript compartilhados entre serviços
Consumido por: todos os serviços
Exporta: interfaces User, Order, Product e seus DTOs relacionados

Arquivos esperados:
- packages/shared-types/package.json
- packages/shared-types/tsconfig.json
- packages/shared-types/src/index.ts
- packages/shared-types/src/user.ts
- packages/shared-types/src/order.ts
- packages/shared-types/src/product.ts

Não explique o que fez, só gere os arquivos.
```

---

## Adicionando Funcionalidades a um Serviço Existente

Depois que o serviço existe, use prompts focados em uma funcionalidade por vez:

```
No auth-service, crie o módulo de autenticação JWT seguindo CODING-PATTERNS.md.

Funcionalidade: login com email e senha, retorna access token e refresh token
Endpoints:
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

Não explique o que fez, só gere os arquivos.
```

---

## O Que Nunca Colocar no Prompt

Estas informações já estão nos docs e repetí-las desperdiça tokens:

- ❌ "use alias `@service-name/*`" — está em TYPESCRIPT-CONFIG.md
- ❌ "nunca use imports relativos" — está em TYPESCRIPT-CONFIG.md
- ❌ "estenda `@repo/tsconfig/node.json`" — está em ADDING-NEW-SERVICES.md
- ❌ "valide env vars com zod" — está em ADDING-NEW-SERVICES.md
- ❌ "use `workspace:*` para packages internos" — está em PACKAGE-MANAGER.md
- ❌ "siga kebab-case para o nome" — está em MONOREPO-STRUCTURE.md

Se você se pegar escrevendo qualquer uma dessas, pare — o doc já cobre.

---

## Checklist Pós-geração

Após o agente gerar os arquivos, verifique rapidamente:

```bash
# Confirma que não há imports relativos
grep -r "from '\.\." apps/nome-do-servico/src
grep -r "from '\." apps/nome-do-servico/src

# Confirma que o build passa
pnpm --filter nome-do-servico run build

# Confirma que o lint passa
pnpm --filter nome-do-servico run lint
```

Se qualquer um desses falhar, use um prompt cirúrgico para corrigir:

```
No auth-service, corrija todos os imports relativos substituindo por aliases @auth-service/*.
Não altere nenhum outro arquivo. Não explique o que fez.
```

---

**Last Updated**: 2026-03-01
