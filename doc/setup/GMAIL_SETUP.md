# Configuração Gmail OAuth2 - Guia Completo

Este guia explica como configurar o envio automático de emails via Gmail usando OAuth2 para notificações de formulários.

## Pré-requisitos

- Conta Google/Gmail
- Projeto Firebase configurado
- Acesso ao Google Cloud Console

## Passo 1: Criar Credenciais OAuth2 no Google Cloud

### 1.1 Acessar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto Firebase (ou crie um novo)
3. No menu lateral, vá em **APIs & Services** → **Credentials**

### 1.2 Configurar Tela de Consentimento OAuth

1. Clique em **OAuth consent screen**
2. Selecione **External** (ou Internal se for Google Workspace)
3. Preencha:
   - **App name:** Recanto do Amor Misericordioso
   - **User support email:** Seu email
   - **Developer contact information:** Seu email
4. Clique em **Save and Continue**
5. Em **Scopes**, clique em **Add or Remove Scopes** e adicione:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
6. Salve e continue

### 1.3 Criar Credenciais OAuth 2.0

1. Volte para **Credentials**
2. Clique em **Create Credentials** → **OAuth client ID**
3. Selecione **Web application**
4. Preencha:
   - **Name:** Recanto Web App
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com.br` (produção)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/gmail/callback` (desenvolvimento)
     - `https://seu-dominio.com.br/api/gmail/callback` (produção)
5. Clique em **Create**
6. **IMPORTANTE:** Copie o **Client ID** e **Client Secret**

## Passo 2: Configurar Variáveis de Ambiente

### 2.1 Adicionar ao .env.local

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```bash
# Google OAuth2 para Gmail
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou https://seu-dominio.com.br

# Gmail Access Token (será preenchido automaticamente após autenticação)
GMAIL_ACCESS_TOKEN=
```

### 2.2 Adicionar ao Vercel (Produção)

Se estiver usando Vercel:

1. Acesse o dashboard do Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as mesmas variáveis acima

## Passo 3: Conectar Gmail no Painel Admin

### 3.1 Acessar Configurações

1. Acesse `/app/dashboard/admin`
2. Clique na aba **"Email & Notificações"**

### 3.2 Configurar Email do Administrador

1. Preencha:
   - **Email do Administrador:** Email que receberá as notificações
   - **Nome do Administrador:** Seu nome
2. Marque as notificações que deseja receber:
   - ☑️ Notificar em novos contatos
   - ☑️ Notificar em novas histórias
3. Clique em **Salvar Configurações**

### 3.3 Conectar Gmail

1. No card "Conexão Gmail", clique em **Conectar Gmail**
2. Você será redirecionado para a tela de login do Google
3. Selecione a conta Gmail que enviará os emails
4. Clique em **Permitir** para autorizar o acesso
5. Você será redirecionado de volta ao painel admin
6. Verifique se aparece "✅ Gmail conectado"

## Passo 4: Testar Envio de Emails

### 4.1 Testar Formulário de Contato

1. Acesse a página de contatos: `/contatos`
2. Preencha o formulário de contato
3. Envie a mensagem
4. Verifique se recebeu o email de notificação

### 4.2 Testar Formulário de História

1. Na mesma página `/contatos`, role até "Queremos Conhecer Sua História"
2. Preencha o formulário
3. Envie sua história
4. Verifique se recebeu o email de notificação

### 4.3 Verificar no Painel Admin

1. Acesse `/app/dashboard/admin`
2. Clique na aba **"Formulários"**
3. Verifique se as submissões aparecem
4. Clique em **Ver Detalhes** para visualizar

## Fluxo de Funcionamento

```
┌─────────────────┐
│ Usuário preenche│
│   formulário    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/forms/│
│  contact/story  │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌────────────────┐    ┌──────────────────┐
│ Salva no       │    │ Envia email via  │
│ Firestore      │    │ Gmail API        │
└────────────────┘    └──────────────────┘
         │                      │
         │                      ▼
         │            ┌──────────────────┐
         │            │ Admin recebe     │
         └───────────►│ notificação      │
                      └──────────────────┘
```

## Estrutura de Dados no Firestore

### Coleção: `form_submissions`

```json
{
  "id": "auto-generated-id",
  "type": "contact" | "story",
  "data": {
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "subject": "Dúvida sobre retiros",
    "message": "Gostaria de saber..."
  },
  "submitted_at": "2025-10-12T10:30:00.000Z",
  "status": "new" | "read" | "replied" | "archived",
  "admin_notes": "Opcional",
  "replied_at": "2025-10-12T12:00:00.000Z",
  "replied_by": "admin"
}
```

### Documento: `config/admin_email`

```json
{
  "email": "admin@recanto.org.br",
  "name": "Administrador",
  "notify_on_contact": true,
  "notify_on_story": true,
  "updated_at": "2025-10-12T10:00:00.000Z",
  "updated_by": "admin"
}
```

### Documento: `config/gmail_oauth`

```json
{
  "access_token": "ya29.a0...",
  "refresh_token": "1//0g...",
  "expires_at": "2025-10-12T11:00:00.000Z",
  "updated_at": "2025-10-12T10:00:00.000Z"
}
```

## Renovação Automática de Token

O sistema renova automaticamente o access token quando expirar:

1. A cada requisição, verifica se o token expirou
2. Se expirado, usa o `refresh_token` para obter novo `access_token`
3. Salva o novo token no Firestore
4. Continua o envio do email normalmente

## Troubleshooting

### Erro: "Gmail access token not set"

**Solução:** Conecte o Gmail no painel admin conforme Passo 3.

### Erro: "Failed to send email"

**Possíveis causas:**
1. Token expirado - Reconecte o Gmail
2. Permissões insuficientes - Verifique os scopes
3. Email inválido - Verifique o email do admin

**Solução:** Verifique os logs no console e reconecte o Gmail se necessário.

### Emails não chegam

**Verificar:**
1. Caixa de spam
2. Email do administrador está correto
3. Notificações estão ativadas
4. Gmail está conectado (card verde)

## Segurança

### Boas Práticas

✅ **NUNCA** commite credenciais no código
✅ Use variáveis de ambiente para secrets
✅ Tokens armazenados apenas no Firestore (protegido por regras)
✅ Apenas admins podem acessar configurações
✅ OAuth2 renova tokens automaticamente

### Regras de Segurança do Firestore

```javascript
// firestore.rules
match /config/{document} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

match /form_submissions/{submissionId} {
  allow create: if true; // Formulários públicos podem criar
  allow read, update, delete: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Custos

### Gmail API

- **Gratuito** para até 500 emails/dia
- Após 500: Limitações aplicam

### Firestore

- Leitura/escrita de configurações: ~100 operações/dia
- Armazenamento: < 1MB

**Custo total estimado:** $0/mês

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do console
2. Consulte a [documentação oficial do Gmail API](https://developers.google.com/gmail/api)
3. Verifique as [regras do Firestore](https://firebase.google.com/docs/firestore/security)

---

**Última atualização:** 2025-10-12
**Versão:** 1.0.0
