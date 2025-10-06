# Google Calendar Integration Setup

Este guia explica como configurar a integração bidirecional entre o Google Calendar e a aplicação Recanto do Amor Misericordioso.

## 📋 Pré-requisitos

1. **Projeto no Google Cloud Console**
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um novo projeto ou selecione um existente
   - Ative a **Google Calendar API**

2. **Credenciais OAuth 2.0**
   - Vá para "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "OAuth client ID"
   - Escolha "Web application"
   - Configure:
     - **Authorized JavaScript origins**: `http://localhost:3000`, `https://seu-dominio.com`
     - **Authorized redirect URIs**: `http://localhost:3000/api/calendar/callback`, `https://seu-dominio.com/api/calendar/callback`
   - Copie o **Client ID** e **Client Secret**

## 🔐 Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env.local`:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# Production
# GOOGLE_REDIRECT_URI=https://seu-dominio.com/api/calendar/callback
```

## 🚀 Como Usar

### 1. Conectar Google Calendar (Admin)

1. Faça login como **admin** no dashboard
2. Vá para **Agenda Comunitária** (`/app/dashboard/schedule`)
3. Clique no botão **"Conectar Google Calendar"**
4. Será redirecionado para a tela de consentimento do Google
5. Faça login com a conta Google que deseja sincronizar
6. Autorize as permissões solicitadas
7. Você será redirecionado de volta para a agenda

✅ **Pronto!** A sincronização está ativa.

### 2. Sincronização Automática

Após conectar, a sincronização funciona da seguinte forma:

#### **Google Calendar → Aplicação**

- Eventos do Google Calendar são importados automaticamente
- Novos eventos aparecem na área logada
- Eventos são marcados como **privados** por padrão
- Admin pode tornar eventos **públicos** depois

#### **Aplicação → Google Calendar**

- Ao criar um evento na aplicação, ele é adicionado ao Google Calendar
- Ao editar um evento, as mudanças são refletidas no Google Calendar
- Ao deletar um evento, ele é removido do Google Calendar

#### **Sincronização Manual**

- Clique no botão **"Sincronizar"** para forçar uma sincronização
- Útil se houver atrasos ou para garantir que está tudo atualizado

### 3. Tornar Eventos Públicos

Por padrão, todos os eventos são **privados** (visíveis apenas na área logada).

Para tornar um evento público (visível na página inicial):

1. Vá para **Agenda Comunitária**
2. Encontre o evento
3. Clique no botão **"Tornar Público"**

✅ O evento agora aparece na **página inicial** para visitantes não autenticados.

> ⚠️ **Importante**: Apenas **admins** podem marcar eventos como públicos.

## 🔄 Como Funciona a Sincronização

### Fluxo de Dados

```
Google Calendar ←──────→ Firestore ←──────→ Aplicação Web
                 (sync)             (real-time)
```

### Campos Sincronizados

| Google Calendar | Firestore Event |
|----------------|-----------------|
| `summary` | `title` |
| `description` | `description` |
| `location` | `location` |
| `start.dateTime` | `start` |
| `end.dateTime` | `end` |
| `id` | `google_calendar_id` |

### Campos Adicionais (Firestore)

- `is_public`: Booleano controlado apenas por admin
- `type`: Tipo do evento (oração, reunião, formação, etc.)
- `target_audience`: Roles que podem visualizar
- `last_synced_at`: Timestamp da última sincronização

## 📊 Webhooks (Push Notifications)

A aplicação usa **webhooks** do Google Calendar para receber notificações em tempo real:

- Quando um evento é criado, editado ou deletado no Google Calendar
- A aplicação recebe uma notificação e sincroniza automaticamente
- Não é necessário polling constante

### Renovação de Webhooks

Webhooks do Google expiram após ~7 dias. A aplicação:
- Salva a data de expiração no Firestore
- Precisa renovar automaticamente antes da expiração
- **TODO**: Implementar job cron para renovação automática

## 🔒 Segurança

### Firestore Rules

Eventos públicos são acessíveis a todos:

```javascript
allow read: if isAuthenticated() || (resource.data.is_public == true);
```

Campo `is_public` só pode ser alterado por admins:

```javascript
allow update: if isAdmin() || !request.resource.data.diff(resource.data).affectedKeys().hasAny(['is_public']);
```

### OAuth Tokens

- Tokens são criptografados e armazenados no Firestore
- Apenas o admin conectado pode ler seus próprios tokens
- Refresh tokens são usados para renovar access tokens expirados

## 🛠️ Troubleshooting

### "Erro ao conectar Google Calendar"

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que a Google Calendar API está ativada no Cloud Console
3. Verifique se o redirect URI está configurado corretamente

### "Sincronização falhou"

1. Clique em "Sincronizar" manualmente
2. Verifique os logs do console para erros
3. Confirme que o token não expirou (a aplicação renova automaticamente)

### Eventos não aparecem na página inicial

1. Verifique se o evento está marcado como **público** (ícone de globo 🌍)
2. Confirme que a data do evento é futura
3. Verifique se `PublicEvents` está importado em `MainPage.tsx`

## 📦 Dependências

```json
{
  "googleapis": "^140.0.0",
  "google-auth-library": "^9.0.0"
}
```

Instale com:

```bash
npm install googleapis google-auth-library
```

## 🎯 Próximos Passos

- [ ] Implementar renovação automática de webhooks (cron job)
- [ ] Adicionar sincronização de participantes do evento
- [ ] Suporte para eventos recorrentes
- [ ] Interface para configurar calendários múltiplos
- [ ] Notificações push quando eventos públicos são criados

## 📚 Referências

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Push Notifications (Webhooks)](https://developers.google.com/calendar/api/guides/push)

---

**✅ Configuração completa!** Agora você tem sincronização bidirecional entre Google Calendar e a aplicação, com controle de visibilidade pública por admin.
