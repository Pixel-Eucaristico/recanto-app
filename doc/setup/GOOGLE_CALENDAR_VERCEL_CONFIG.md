# ⚙️ Configurar Google Calendar na Vercel - Passo a Passo

Guia completo para configurar a integração do Google Calendar após deploy na Vercel.

## 📋 Pré-requisitos

- ✅ Aplicação já deployada na Vercel
- ✅ Projeto Firebase configurado
- ✅ Conta Google Cloud Platform

## 🚀 Passo 1: Configurar Google Cloud Console

### 1.1. Acessar Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Selecione seu projeto (ou crie um novo)
3. Se for novo projeto:
   - Clique em "Novo Projeto"
   - Nome: `Recanto App` (ou outro nome)
   - Clique em "Criar"

### 1.2. Ativar Google Calendar API

1. No menu lateral, vá para **APIs & Services** → **Library**
2. Pesquise por "Google Calendar API"
3. Clique na API
4. Clique em **Enable** (Ativar)
5. Aguarde alguns segundos até ativar

### 1.3. Criar Credenciais OAuth 2.0

1. No menu lateral, vá para **APIs & Services** → **Credentials**
2. Clique em **+ Create Credentials** → **OAuth client ID**
3. Se aparecer "Configure Consent Screen":
   - Clique em **Configure Consent Screen**
   - Selecione **External** (ou Internal se for G Suite)
   - Clique em **Create**

#### Configurar OAuth Consent Screen

1. **App information**:
   - App name: `Recanto do Amor Misericordioso`
   - User support email: `seu-email@gmail.com`
   - App logo: (opcional)

2. **App domain** (opcional):
   - Application home page: `https://seu-projeto.vercel.app`
   - Privacy policy: `https://seu-projeto.vercel.app/privacy` (opcional)
   - Terms of service: `https://seu-projeto.vercel.app/terms` (opcional)

3. **Developer contact information**:
   - Email addresses: `seu-email@gmail.com`

4. Clique em **Save and Continue**

5. **Scopes** (permissões):
   - Clique em **Add or Remove Scopes**
   - Pesquise e adicione:
     - `https://www.googleapis.com/auth/calendar` (Acesso completo)
     - `https://www.googleapis.com/auth/calendar.events` (Eventos)
   - Clique em **Update**
   - Clique em **Save and Continue**

6. **Test users** (se External):
   - Clique em **+ Add Users**
   - Adicione seu email do Google que será admin: `admin@gmail.com`
   - Clique em **Save and Continue**

7. **Summary**:
   - Revise as informações
   - Clique em **Back to Dashboard**

#### Criar OAuth Client ID

1. Volte para **Credentials**
2. Clique em **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Recanto App - Web Client`

5. **Authorized JavaScript origins**:
   ```
   https://seu-projeto.vercel.app
   ```

6. **Authorized redirect URIs** (IMPORTANTE):
   ```
   https://seu-projeto.vercel.app/api/calendar/callback
   ```

   > ⚠️ **Importante**: Substitua `seu-projeto.vercel.app` pela URL real da Vercel

7. Clique em **Create**

8. **Copie as credenciais**:
   - Client ID: `123456789-abc...apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

   > 💡 **Dica**: Salve em um arquivo de texto temporário

---

## 🔧 Passo 2: Configurar Variáveis na Vercel

### 2.1. Adicionar Variáveis de Ambiente

1. Acesse [vercel.com](https://vercel.com)
2. Selecione seu projeto: `recanto-app`
3. Vá para **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu-client-secret
GOOGLE_REDIRECT_URI=https://seu-projeto.vercel.app/api/calendar/callback
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

**Preencha com seus valores reais!**

### 2.2. Aplicar nos Ambientes

Para cada variável, marque:
- ✅ **Production**
- ✅ **Preview** (opcional)
- ✅ **Development** (opcional)

### 2.3. Redeploy

1. Vá para **Deployments**
2. No último deploy, clique nos três pontos (...) → **Redeploy**
3. Marque **Use existing Build Cache**
4. Clique em **Redeploy**

Aguarde 1-2 minutos para completar.

---

## ✅ Passo 3: Testar Integração

### 3.1. Fazer Login como Admin

1. Acesse `https://seu-projeto.vercel.app/app/login`
2. Faça login com conta **admin** (role `admin` no Firestore)

### 3.2. Conectar Google Calendar

1. Vá para **Agenda Comunitária** (`/app/dashboard/schedule`)
2. Clique no botão **"Conectar Google Calendar"**
3. Você será redirecionado para o Google
4. Faça login com a conta Google que adicionou como "test user"
5. Autorize as permissões solicitadas:
   - ✅ Ver eventos do calendário
   - ✅ Criar eventos
   - ✅ Editar eventos
   - ✅ Deletar eventos
6. Clique em **Permitir**

### 3.3. Verificar Conexão

Após autorizar, você será redirecionado de volta para a agenda.

Verifique se:
- ✅ O botão mudou para **"Sincronizar"**
- ✅ Eventos do Google Calendar aparecem na lista
- ✅ Não há mensagens de erro

### 3.4. Criar Evento de Teste

1. Clique em **"Novo Evento"**
2. Preencha:
   - Título: `Teste Sincronização`
   - Descrição: `Teste de integração com Google Calendar`
   - Tipo: `Oração`
   - Início: (data futura)
   - Término: (1 hora depois)
   - Marque: ☑️ **Tornar público**
3. Clique em **"Criar Evento"**

### 3.5. Verificar no Google Calendar

1. Acesse [calendar.google.com](https://calendar.google.com)
2. Verifique se o evento `Teste Sincronização` aparece
3. Se aparecer, a integração está funcionando! ✅

---

## 🌐 Passo 4: Verificar Eventos Públicos

1. Abra uma janela anônima (Ctrl+Shift+N)
2. Acesse `https://seu-projeto.vercel.app`
3. Role até a seção **"Próximos Eventos"**
4. O evento que você marcou como público deve aparecer

✅ **Integração completa!**

---

## 🔄 Sincronização Bidirecional

Agora você tem sincronização automática:

### Google Calendar → Aplicação
- ✅ Eventos criados no Google Calendar aparecem na área logada
- ✅ Eventos editados no Google Calendar são atualizados
- ✅ Eventos deletados no Google Calendar são removidos

### Aplicação → Google Calendar
- ✅ Eventos criados na app são adicionados ao Google Calendar
- ✅ Eventos editados na app atualizam no Google Calendar
- ✅ Eventos deletados na app são removidos do Google Calendar

### Controle de Visibilidade Pública
- ✅ Admin pode marcar eventos como **públicos**
- ✅ Eventos públicos aparecem na **página inicial**
- ✅ Apenas admin pode alterar visibilidade

---

## 🐛 Troubleshooting

### Erro: "Redirect URI mismatch"

**Causa**: O redirect URI configurado no Google Cloud não corresponde à URL da Vercel.

**Solução**:
1. Vá para Google Cloud Console → Credentials
2. Edite o OAuth 2.0 Client ID
3. Verifique se o redirect URI é exatamente:
   ```
   https://seu-projeto.vercel.app/api/calendar/callback
   ```
4. Salve e tente novamente

### Erro: "Access denied"

**Causa**: Seu email não está na lista de test users.

**Solução**:
1. Google Cloud Console → OAuth consent screen → Test users
2. Adicione seu email
3. Tente novamente

### Eventos não sincronizam

**Causa**: Tokens expirados ou variáveis de ambiente incorretas.

**Solução**:
1. Vercel → Settings → Environment Variables
2. Verifique se `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI` estão corretos
3. Redeploy o projeto
4. Desconecte e reconecte o Google Calendar

### Botão "Conectar Google Calendar" não aparece

**Causa**: Usuário não é admin.

**Solução**:
1. Firebase Console → Firestore Database
2. Encontre seu usuário em `users/{userId}`
3. Edite o campo `role` para `"admin"`
4. Recarregue a página

---

## 🔐 Segurança

### Boas Práticas

✅ **Nunca exponha o Client Secret**:
- Não commite no Git
- Use apenas em variáveis de ambiente server-side
- Não use `NEXT_PUBLIC_` no Client Secret

✅ **Limite test users**:
- Adicione apenas emails confiáveis
- Para produção, publique o app (veja abaixo)

✅ **Revise permissões**:
- Conceda apenas permissões necessárias
- Use scopes mínimos necessários

### Publicar App (Produção)

Quando estiver pronto para liberar para todos:

1. Google Cloud Console → OAuth consent screen
2. Clique em **Publish App**
3. Revise as informações
4. Envie para verificação do Google (pode levar dias/semanas)
5. Após aprovação, qualquer usuário pode conectar

> ⚠️ **Nota**: Enquanto não publicar, apenas test users podem conectar.

---

## 📊 Monitoramento

### Verificar Logs de Sincronização

1. Vercel → Deployments → Selecione o deploy
2. Clique em **Functions**
3. Filtre por:
   - `/api/calendar/sync` - Sincronizações manuais
   - `/api/calendar/webhook` - Notificações do Google
4. Veja logs de erros ou sucessos

### Firestore: Configurações de Sincronização

1. Firebase Console → Firestore Database
2. Navegue para `google_calendar_configs/{userId}`
3. Veja:
   - `syncEnabled`: Se está ativo
   - `lastSync`: Última sincronização
   - `tokens`: Tokens OAuth (criptografados)

---

## 🎯 Próximos Passos

Agora que o Google Calendar está configurado:

1. ✅ Crie eventos na área logada
2. ✅ Marque eventos importantes como públicos
3. ✅ Sincronize calendários existentes do Google
4. ✅ Compartilhe eventos públicos com a comunidade

---

## 📚 Documentação Relacionada

- `GOOGLE_CALENDAR_SETUP.md` - Guia técnico completo
- `VERCEL_DEPLOYMENT.md` - Deploy na Vercel
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

## 🎉 Sucesso!

Sua integração com Google Calendar está completa e funcionando! 🚀

**Dúvidas?** Consulte os logs na Vercel ou revise as configurações no Google Cloud Console.
