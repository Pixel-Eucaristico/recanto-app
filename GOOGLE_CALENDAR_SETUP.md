# 🗓️ Guia Completo: Configurar Google Calendar API

## ✅ Pré-requisitos
- Conta Google (Gmail)
- Projeto já criado no Firebase (você já tem)
- 15 minutos de tempo

---

## 📋 PASSO 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. **Login** com a mesma conta do Firebase
3. No topo da página, selecione o projeto: **"recanto-do-amor-miserico-e5a7b"**

---

## 📋 PASSO 2: Habilitar a Google Calendar API

1. Vá em: **APIs e Serviços** → **Biblioteca**
2. Pesquise: **"Google Calendar API"**
3. Clique em **"ATIVAR"** (Enable)

---

## 📋 PASSO 3: Configurar Tela de Consentimento OAuth

1. Vá em: **APIs e Serviços** → **Tela de consentimento OAuth**
2. Escolha: **"Externo"** (External)
3. Preencha:
   - **Nome do app**: `Recanto do Amor Misericordioso`
   - **Email de suporte**: seu email
4. **Adicionar escopos**:
   - Marque: `.../auth/calendar`
   - Marque: `.../auth/calendar.events`
5. **Adicionar usuários de teste**: seu email

---

## 📋 PASSO 4: Criar Credenciais OAuth 2.0

1. Vá em: **APIs e Serviços** → **Credenciais**
2. Clique: **"+ CRIAR CREDENCIAIS"** → **"ID do cliente OAuth"**
3. Tipo: **"Aplicativo da Web"**
4. **URIs de redirecionamento**:
   ```
   http://localhost:3000/api/calendar/callback
   https://SEU-DOMINIO.vercel.app/api/calendar/callback
   ```
5. Copie o **Client ID** e **Client Secret**

---

## 📋 PASSO 5: Configurar .env.local

Adicione no arquivo `.env.local`:

```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
```

---

## 📋 PASSO 6: Reiniciar Servidor

```bash
npm run dev
```

Agora acesse: http://localhost:3000/app/dashboard/schedule

Clique em "Conectar Google Calendar" e autorize!

---

## ✅ Checklist

- [ ] API ativada
- [ ] Tela de consentimento configurada
- [ ] Credenciais OAuth criadas
- [ ] .env.local configurado
- [ ] Servidor reiniciado
- [ ] Botão aparece no dashboard

