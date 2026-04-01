# Guia de Configuração e Implantação - Control Leads

Este documento descreve as etapas necessárias para configurar e rodar o projeto `control-leads` em um servidor de produção ou ambiente local de desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
*   **Node.js** (v18+)
*   **Docker** e **Docker Compose** (para o WAHA)
*   **Gerenciador de Pacotes:** `npm` ou `pnpm`
*   **Instância Supabase:** (Cloud ou Self-hosted)

---

## 🛠️ 1. Configuração do Banco de Dados (Supabase)

O projeto utiliza o Supabase como backend. Siga estas etapas para configurar o banco de dados:

### Gerenciamento de Migrações
As migrações estão localizadas em `supabase/migrations/`. Se você estiver usando a CLI do Supabase:

1.  Vincule ao seu projeto: `supabase link --project-ref seu-id-projeto`
2.  Aplique as migrações: `supabase db push`

### Tabelas Principais (SaaS/Multitenancy)
O sistema é multilocatário (SaaS), baseado na tabela `tenants`. Certifique-se de que cada profissional ou clínica esteja vinculado a um `tenant_id`.

### Webhooks (CRITICAL)
Para que o WhatsApp funcione corretamente, você **deve** configurar um Webhook no dashboard do Supabase (ou via SQL) que aponte para o seu serviço de tratamento de mensagens (WAHA) ou para a API do Next.js se houver lógica de roteamento.

---

## 🔑 2. Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública anon (segura para o frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Chave de Serviço (Service Role) - APENAS BACKEND
# Usada para ignorar RLS em funções administrativas e roteamento de mensagens.
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

---

## 🐳 3. Infraestrutura WAHA (WhatsApp Web API)

O WAHA é executado via Docker para gerenciar as sessões do WhatsApp.

1.  **Iniciar o container:**
    ```bash
    docker-compose up -d
    ```

2.  **Configurações Importantes (`docker-compose.yml`):**
    *   **Porta padrão:** `3002` (Exposta no host).
    *   **Dashboard/API Key:** Por padrão definida como `30e724584f1a4382ac9a23f5e1262ed3`. 
    *   **Recomendação:** Altere estas chaves no `docker-compose.yml` antes de subir em produção para garantir a segurança.

---

## 🚀 4. Rodando a Aplicação Next.js

### Localmente (Desenvolvimento)
```bash
npm install
npm run dev
# Acesse em http://localhost:3000
```

### Servidor (Produção)
1.  **Instalar dependências:** `npm install`
2.  **Gerar o build:** `npm run build`
3.  **Iniciar o servidor:** `npm run start`

> [!TIP]
> Em produção, recomenda-se usar um gerenciador de processos como o **PM2** e um proxy reverso como **Nginx** para gerenciar o tráfego HTTPS na porta 443.

---

## 🔍 5. Verificações de Saúde (Health Checks)

*   **Next.js:** Acesse a URL principal.
*   **Supabase:** Verifique se as chamadas de API retornam dados dos leads/pacientes.
*   **WAHA:** Acesse `http://seu-servidor:3002/dashboard` e verifique se a sessão "default" está ativa e pronta para ler o QR Code.

---

## 🛡️ Considerações de Segurança

1.  **RLS (Row Level Security):** Certifique-se de que as políticas em `00002_rls_missing_policies.sql` estão aplicadas para proteger os dados entre diferentes tenants.
2.  **Secrets:** Nunca versionar o arquivo `.env` real ou as chaves de API do WAHA no Git.
3.  **Backup:** Configure backups automáticos no Supabase/PostgreSQL.
