# Deploy na Vercel - Guia Completo

Este guia explica como fazer o deploy do **Recanto do Amor Misericordioso** na Vercel.

## 📋 Pré-requisitos

1. **Conta na Vercel** - [Criar conta gratuita](https://vercel.com/signup)
2. **Repositório Git** - GitHub, GitLab ou Bitbucket
3. **Firebase configurado** - Projeto com Firestore e Authentication
4. **Google Calendar API** (opcional) - Credenciais OAuth 2.0

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estejam commitados:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

### 2. Importar Projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta GitHub/GitLab/Bitbucket
3. Selecione o repositório `recanto-app`
4. Configure o projeto:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

### 3. Configurar Variáveis de Ambiente

Na aba **Environment Variables**, adicione:

#### **Firebase (Obrigatório)**

```env
# Firebase Client SDK (NEXT_PUBLIC_ = disponível no browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Firebase Admin SDK (Server-side only - NÃO usar NEXT_PUBLIC_)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

> ⚠️ **Importante**:
> - Variáveis `NEXT_PUBLIC_*` são expostas no browser
> - `FIREBASE_SERVICE_ACCOUNT_KEY` deve ser **privada** (sem NEXT_PUBLIC_)

#### **Google Calendar (Opcional)**

```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://seu-dominio.vercel.app/api/calendar/callback
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

> 📝 **Nota**: Deixe essas variáveis vazias ou remova se não for usar Google Calendar inicialmente.

#### **Node.js**

```env
NODE_ENV=production
```

### 4. Deploy

1. Clique em **Deploy**
2. Aguarde o build (2-5 minutos)
3. ✅ Deploy concluído!

Sua aplicação estará disponível em: `https://seu-projeto.vercel.app`

---

## 🔧 Configurações Pós-Deploy

### 1. Firebase - Adicionar Domínio Autorizado

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá para **Authentication** → **Settings** → **Authorized domains**
3. Adicione: `seu-projeto.vercel.app`

### 2. Google Calendar - Atualizar Redirect URI

Se estiver usando Google Calendar:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá para **APIs & Services** → **Credentials**
3. Edite o OAuth 2.0 Client ID
4. Adicione em **Authorized redirect URIs**:
   ```
   https://seu-projeto.vercel.app/api/calendar/callback
   ```
5. Atualize a variável de ambiente na Vercel:
   ```env
   GOOGLE_REDIRECT_URI=https://seu-projeto.vercel.app/api/calendar/callback
   NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
   ```

### 3. Firestore Rules - Deploy

Deploy das regras de segurança:

```bash
firebase deploy --only firestore:rules
```

---

## 🌐 Domínio Personalizado (Opcional)

### Configurar Domínio Próprio

1. Na Vercel, vá para **Settings** → **Domains**
2. Adicione seu domínio: `www.recantodoamor.com.br`
3. Configure os DNS no seu provedor:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Aguarde propagação DNS (até 48h)

### Atualizar Configurações

Após configurar o domínio:

1. **Firebase**: Adicionar `www.recantodoamor.com.br` aos domínios autorizados
2. **Google Calendar**: Atualizar redirect URI
3. **Vercel**: Atualizar variáveis de ambiente:
   ```env
   GOOGLE_REDIRECT_URI=https://www.recantodoamor.com.br/api/calendar/callback
   NEXT_PUBLIC_APP_URL=https://www.recantodoamor.com.br
   ```

---

## 📊 Monitoramento e Logs

### Ver Logs de Produção

1. Acesse o dashboard da Vercel
2. Vá para **Deployments** → Selecione o deploy
3. Clique em **Functions** para ver logs das API routes

### Analytics (Opcional)

Ative o Vercel Analytics:

1. Vá para **Analytics** no dashboard
2. Clique em **Enable**
3. Veja métricas de performance e visitantes

---

## 🛠️ Troubleshooting

### Build Falha

**Erro: `Module not found`**
```bash
# Localmente, teste o build:
npm run build

# Se funcionar localmente, verifique:
# 1. Todas as dependências estão em package.json
# 2. Imports usam paths absolutos corretos (@/)
```

**Erro: `Firebase Admin SDK initialization failed`**
```env
# Verifique se FIREBASE_SERVICE_ACCOUNT_KEY está correta
# Deve ser um JSON válido (sem quebras de linha)
```

### Autenticação não Funciona

1. Verifique se o domínio está autorizado no Firebase
2. Confirme que variáveis `NEXT_PUBLIC_FIREBASE_*` estão corretas
3. Verifique no browser console se há erros de CORS

### Google Calendar não Conecta

1. Verifique se `GOOGLE_REDIRECT_URI` aponta para o domínio correto
2. Confirme que o redirect URI está configurado no Google Cloud Console
3. Teste o OAuth flow em modo anônimo (sem cache)

### Firestore Rules Denied

```bash
# Deploy das rules:
firebase deploy --only firestore:rules

# Teste as rules no Firebase Console:
# Firestore → Rules → Playground
```

---

## 🔄 Continuous Deployment (CD)

A Vercel faz deploy automático quando você faz push:

```bash
# Desenvolvimento (branch main)
git push origin main  # → Deploy automático

# Preview (pull request)
git checkout -b feature/nova-funcionalidade
git push origin feature/nova-funcionalidade
# → Cria preview deployment automático
```

### Configurar Ambientes

**Production**: Branch `main`
- URL: `https://seu-projeto.vercel.app`
- Variáveis de produção

**Preview**: Outras branches
- URL: `https://seu-projeto-git-branch.vercel.app`
- Variáveis de preview (opcionais)

---

## 📈 Performance

### Otimizações Automáticas da Vercel

✅ **Compressão Brotli/Gzip**
✅ **CDN Global (Edge Network)**
✅ **Image Optimization** (Next.js Image)
✅ **Code Splitting automático**
✅ **Cache headers otimizados**

### Regiões

O projeto está configurado para usar a região **São Paulo (gru1)**:

```json
// vercel.json
{
  "regions": ["gru1"]
}
```

---

## 💰 Custos

### Plano Hobby (Gratuito)

✅ 100 GB bandwidth/mês
✅ Deployments ilimitados
✅ Domínios ilimitados
✅ SSL automático
✅ Edge Functions (100 horas/mês)

**Suficiente para MVP e primeiros usuários!**

### Quando Escalar

Migre para **Pro** ($20/mês) quando:
- Ultrapassar 100 GB bandwidth
- Precisar de mais de 100h de Edge Functions
- Quiser analytics avançados
- Precisar de proteção DDoS

---

## 🔐 Segurança

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` é **privada** (sem NEXT_PUBLIC_)
- [ ] Firestore rules fazem deploy e estão ativas
- [ ] Domínios autorizados no Firebase configurados
- [ ] Headers de segurança configurados (Vercel faz automaticamente)
- [ ] HTTPS ativo (Vercel faz automaticamente)

### Environment Variables - Boas Práticas

❌ **Nunca faça isso**:
```env
# NÃO exponha service account no browser
NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY=...
```

✅ **Sempre faça isso**:
```env
# Variáveis públicas (browser)
NEXT_PUBLIC_FIREBASE_API_KEY=...

# Variáveis privadas (server-side only)
FIREBASE_SERVICE_ACCOUNT_KEY=...
```

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting vs Vercel](https://vercel.com/guides/migrate-from-firebase)
- [Vercel CLI](https://vercel.com/docs/cli) - Deploy via terminal

---

## 🎉 Sucesso!

Seu projeto está online! 🚀

**Próximos passos**:
1. Testar autenticação em produção
2. Criar primeiro usuário admin (ver `SET_ADMIN_INSTRUCTIONS.md`)
3. Configurar Google Calendar (opcional)
4. Adicionar conteúdo (eventos, materiais, etc.)
5. Compartilhar com a comunidade!

---

**Dúvidas?** Consulte os logs da Vercel ou abra uma issue no repositório.
