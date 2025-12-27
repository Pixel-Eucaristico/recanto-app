# 🚀 Quick Start - Deploy na Vercel em 5 Minutos

Guia rápido para fazer deploy do projeto na Vercel.

## 📝 Checklist Pré-Deploy

Antes de começar, tenha em mãos:

- [ ] Conta na [Vercel](https://vercel.com) (gratuita)
- [ ] Repositório Git com o código (GitHub, GitLab ou Bitbucket)
- [ ] Credenciais do Firebase (API Keys + Service Account)
- [ ] (Opcional) Credenciais do Google Calendar OAuth

## ⚡ Passos Rápidos

### 1. Push para o Git

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Importar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta GitHub/GitLab/Bitbucket
3. Selecione o repositório `recanto-app`
4. **NÃO CLIQUE EM DEPLOY AINDA!**

### 3. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```env
# Firebase Client (obrigatório)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Firebase Admin (obrigatório - copie o JSON inteiro)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}

# Node
NODE_ENV=production
```

> 💡 **Dica**: Para o `FIREBASE_SERVICE_ACCOUNT_KEY`:
> 1. Firebase Console → Project Settings → Service Accounts
> 2. Generate New Private Key → Download JSON
> 3. Abra o arquivo JSON e copie TODO o conteúdo (incluindo `{}`)
> 4. Cole na variável (uma única linha)

### 4. Deploy!

1. Clique em **Deploy**
2. Aguarde 2-5 minutos
3. ✅ Pronto!

## 🔧 Pós-Deploy (Obrigatório)

### Autorizar Domínio no Firebase

1. Copie a URL do deploy: `https://seu-projeto.vercel.app`
2. Firebase Console → Authentication → Settings → Authorized domains
3. Clique em **Add domain** e adicione: `seu-projeto.vercel.app`
4. Salve

### Testar Autenticação

1. Acesse `https://seu-projeto.vercel.app/app/login`
2. Tente fazer login
3. Se funcionar, está tudo certo! 🎉

## 📋 Opcional: Google Calendar

Se quiser integração com Google Calendar:

1. Adicione as variáveis na Vercel:
   ```env
   GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=seu-client-secret
   GOOGLE_REDIRECT_URI=https://seu-projeto.vercel.app/api/calendar/callback
   NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
   ```

2. Google Cloud Console → Credentials → OAuth 2.0 Client
3. Adicione em **Authorized redirect URIs**:
   ```
   https://seu-projeto.vercel.app/api/calendar/callback
   ```

## 🎯 Criar Primeiro Admin

Após o deploy, você precisa criar um usuário admin:

1. Acesse `https://seu-projeto.vercel.app/app/register`
2. Registre-se com seu email
3. Vá para Firebase Console → Firestore Database
4. Encontre sua conta em `users/{userId}`
5. Edite o campo `role` para `"admin"`
6. Recarregue a página do dashboard

✅ Agora você é admin!

## 🐛 Problemas Comuns

### Build Falha

```bash
# Teste localmente primeiro:
npm run build

# Se funcionar, o problema é nas variáveis de ambiente
```

### Autenticação não Funciona

- Verifique se o domínio foi adicionado no Firebase
- Confirme que as variáveis `NEXT_PUBLIC_FIREBASE_*` estão corretas
- Teste em janela anônima (sem cache)

### "Unauthorized" nas API Routes

- Verifique se `FIREBASE_SERVICE_ACCOUNT_KEY` está correto
- Certifique-se de que copiou o JSON inteiro (incluindo `{}`)
- Não use `NEXT_PUBLIC_` nessa variável

## 📚 Documentação Completa

Para mais detalhes, veja:
- `VERCEL_DEPLOYMENT.md` - Guia completo com troubleshooting
- `GOOGLE_CALENDAR_SETUP.md` - Setup do Google Calendar
- `SET_ADMIN_INSTRUCTIONS.md` - Como criar usuários admin

## 🎉 Sucesso!

Seu projeto está online em: `https://seu-projeto.vercel.app`

**Próximos passos**:
1. ✅ Testar login
2. ✅ Criar usuário admin
3. ✅ Configurar Google Calendar (opcional)
4. ✅ Compartilhar com a comunidade!

---

**Tempo total**: ~5 minutos ⚡
