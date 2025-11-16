# 🗓️ Como Conectar o Google Calendar (Guia Rápido)

## 🎯 Objetivo
Permitir que eventos criados no sistema sincronizem automaticamente com o Google Calendar (e vice-versa), **SEM DUPLICAÇÃO**.

---

## 📱 PASSO A PASSO (15 minutos)

### **1️⃣ ACESSAR GOOGLE CLOUD CONSOLE**

🔗 **Link**: https://console.cloud.google.com/

1. Faça login com sua conta Google
2. No topo da tela, clique no **seletor de projetos**
3. Selecione: **"recanto-do-amor-miserico-e5a7b"**

✅ **Confirmação**: Você verá o nome do projeto no topo

---

### **2️⃣ ATIVAR A API DO GOOGLE CALENDAR**

🔗 **Link direto**: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com

1. Você verá a página "Google Calendar API"
2. Clique no botão azul: **"ATIVAR"** (ou "ENABLE")
3. Aguarde 5 segundos

✅ **Confirmação**: Aparecerá "API ativada"

---

### **3️⃣ CONFIGURAR TELA DE CONSENTIMENTO**

🔗 **Link direto**: https://console.cloud.google.com/apis/credentials/consent

**Se já estiver configurada, pule para o passo 4**

1. Escolha: **"Externo"** → Clique em **"CRIAR"**

2. **Preencha APENAS estes campos obrigatórios:**
   - Nome do app: `Recanto do Amor Misericordioso`
   - Email de suporte: `seu-email@gmail.com`
   - Email do desenvolvedor: `seu-email@gmail.com`

3. Clique em **"SALVAR E CONTINUAR"** (3 vezes até chegar em "Resumo")

4. Em "Resumo", clique em **"VOLTAR AO PAINEL"**

✅ **Confirmação**: Status "Em produção" ou "Teste"

---

### **4️⃣ CRIAR CREDENCIAIS OAUTH**

🔗 **Link direto**: https://console.cloud.google.com/apis/credentials

1. Clique no botão: **"+ CRIAR CREDENCIAIS"**
2. Escolha: **"ID do cliente OAuth"**
3. Tipo de aplicativo: **"Aplicativo da Web"**
4. Nome: `Recanto Calendar`

5. **IMPORTANTE - URIs de redirecionamento autorizados:**
   
   Clique em **"+ ADICIONAR URI"** e cole EXATAMENTE:
   ```
   http://localhost:3000/api/calendar/callback
   ```
   
   (Depois que fizer deploy, adicione também a URL de produção)

6. Clique em **"CRIAR"**

7. **COPIE AS CREDENCIAIS** que aparecem:
   - **ID do cliente**: algo como `12345-xxxx.apps.googleusercontent.com`
   - **Chave secreta do cliente**: algo como `GOCSPX-xxxxx`

✅ **Confirmação**: As credenciais foram copiadas

---

### **5️⃣ ADICIONAR ESCOPOS (Permissões)**

🔗 **Link direto**: https://console.cloud.google.com/apis/credentials/consent

1. Na seção "Tela de consentimento OAuth", clique em **"EDITAR APP"**
2. Clique em **"SALVAR E CONTINUAR"** até chegar em **"Escopos"**
3. Clique em **"ADICIONAR OU REMOVER ESCOPOS"**
4. Na busca, digite: `calendar`
5. **Marque estas 2 opções:**
   - ✅ `.../auth/calendar` (Ver, editar, compartilhar e excluir permanentemente todas as agendas)
   - ✅ `.../auth/calendar.events` (Ver e editar eventos)
6. Clique em **"ATUALIZAR"**
7. Clique em **"SALVAR E CONTINUAR"**

✅ **Confirmação**: Escopos adicionados

---

### **6️⃣ ADICIONAR USUÁRIO DE TESTE**

1. Ainda na tela de consentimento, clique em **"SALVAR E CONTINUAR"** até "Usuários de teste"
2. Clique em **"+ ADD USERS"**
3. Digite seu email: `seu-email@gmail.com`
4. Clique em **"ADICIONAR"**
5. Clique em **"SALVAR E CONTINUAR"**

✅ **Confirmação**: Seu email aparece na lista

---

### **7️⃣ CONFIGURAR .env.local**

1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione estas 3 linhas NO FINAL do arquivo:

```env
GOOGLE_CLIENT_ID=cole-aqui-seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=cole-aqui-seu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
```

3. **Substitua** os valores pelas credenciais que você copiou no Passo 4
4. **Salve o arquivo**

✅ **Confirmação**: `.env.local` atualizado

---

### **8️⃣ REINICIAR O SERVIDOR**

No terminal, pare o servidor (Ctrl+C) e rode novamente:

```bash
npm run dev
```

✅ **Confirmação**: Servidor reiniciado sem erros

---

### **9️⃣ TESTAR A CONEXÃO**

1. Abra o navegador: http://localhost:3000/app/login
2. Faça login no sistema
3. Vá para: http://localhost:3000/app/dashboard/schedule
4. Você verá um botão: **"Conectar Google Calendar"**
5. **Clique no botão**
6. Você será redirecionado para o Google
7. **IMPORTANTE**: Verá um aviso "Google hasn't verified this app"
   - Clique em **"Avançado"** (ou "Advanced")
   - Clique em **"Ir para Recanto do Amor Misericordioso (não seguro)"**
8. Marque todas as permissões
9. Clique em **"Continuar"**

✅ **Confirmação**: Você voltou para a Agenda e apareceram 2 novos botões:
- "Importar do Google"
- "Exportar para Google"

---

## 🔄 COMO USAR A SINCRONIZAÇÃO

### **📥 IMPORTAR DO GOOGLE → SISTEMA**

1. Crie eventos no seu Google Calendar (pelo celular ou web)
2. Na Agenda do sistema, clique em: **"Importar do Google"**
3. Os eventos do Google aparecerão na lista
4. ✅ **Sem duplicação**: Se o evento já existe, será atualizado (não duplicado)

### **📤 EXPORTAR DO SISTEMA → GOOGLE**

1. Crie eventos na Agenda do sistema
2. Clique em: **"Exportar para Google"**
3. Os eventos aparecerão no seu Google Calendar
4. ✅ **Sem duplicação**: Só envia eventos que ainda não estão no Google

### **🔄 SINCRONIZAÇÃO AUTOMÁTICA**

- ✅ Quando você **cria** um evento novo no sistema, ele vai automaticamente para o Google
- ✅ Quando você **edita** um evento sincronizado, a alteração vai para o Google
- ✅ Quando você **exclui** um evento sincronizado, ele é removido do Google

---

## ✅ CHECKLIST FINAL

- [ ] Google Calendar API ativada
- [ ] Tela de consentimento configurada
- [ ] Credenciais OAuth criadas
- [ ] URIs de redirecionamento corretos
- [ ] Escopos adicionados (calendar e calendar.events)
- [ ] Usuário de teste adicionado
- [ ] `.env.local` configurado
- [ ] Servidor reiniciado
- [ ] Conexão testada com sucesso
- [ ] Botões "Importar" e "Exportar" aparecem

---

## 🐛 PROBLEMAS COMUNS

### ❌ "redirect_uri_mismatch"
**Solução**: Verifique se a URI no Google Cloud é EXATAMENTE:
```
http://localhost:3000/api/calendar/callback
```

### ❌ "Access blocked: This app's request is invalid"
**Solução**: Adicione os escopos do calendar na tela de consentimento

### ❌ "invalid_client"
**Solução**: Verifique se copiou o Client ID e Secret corretamente

### ❌ Botão "Conectar" não aparece
**Solução**: Reinicie o servidor com `npm run dev`

---

## 🎉 PRONTO!

Agora você pode:
- ✅ Criar eventos no sistema e sincronizar com Google
- ✅ Importar eventos do Google para o sistema
- ✅ Tudo sem duplicação!

**Dúvidas? Me avise!** 🚀
