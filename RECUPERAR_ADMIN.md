# 🚨 RECUPERAR ACESSO ADMIN - URGENTE

## ✅ Solução Rápida (2 minutos)

### Passo 1: Abrir Firebase Console
1. Acesse: https://console.firebase.google.com/project/recanto-do-amor-miserico-e5a7b/database
2. Faça login com: `williancustodioquintino@gmail.com`

### Passo 2: Ir para Realtime Database
1. No menu lateral esquerdo, clique em **"Realtime Database"**
2. Clique na aba **"Data"** (Dados)

### Passo 3: Encontrar seu usuário
1. Expanda o nó **"users"**
2. Procure pelo seu UID (será algo como `AbCdEf123...`)
3. Você pode procurar pelo seu email: `williancustodioquintino@gmail.com`

### Passo 4: Alterar role para admin
1. Clique no campo **"role"** do seu usuário
2. Digite: `admin`
3. Pressione **Enter** ou clique fora
4. Aguarde o Firebase salvar (ícone de check verde)

### Passo 5: Recarregar aplicação
1. Volte para: `http://localhost:3000/app/dashboard`
2. Recarregue a página (F5 ou Ctrl+R)
3. ✅ Você voltou a ser admin!

---

## 🔧 Método Alternativo: Via Código

Se preferir, execute no terminal:

```bash
# Isso abrirá o Firebase Console diretamente na aba de dados
start https://console.firebase.google.com/project/recanto-do-amor-miserico-e5a7b/database/recanto-do-amor-miserico-e5a7b/data/users
```

---

## 📸 Visual Passo a Passo

### Como encontrar seu usuário:
```
Realtime Database > Data
  └── users
      └── [SEU_UID]  ← Expanda este
          ├── email: "williancustodioquintino@gmail.com"  ← Confirme que é você
          ├── id: "seu-uid"
          ├── name: "Willian Quintino"
          └── role: "recantiano"  ← ALTERE PARA "admin"
```

### Onde clicar:
1. **Clique no valor** do campo `role`
2. **Digite**: `admin`
3. **Pressione Enter**
4. ✅ Pronto!

---

## 🛡️ Prevenção Futura

Para evitar perder admin acidentalmente, vou criar uma proteção:

### Opção 1: Confirmação antes de mudar
- DevRoleSelector perguntará: "Tem certeza que quer mudar de admin?"

### Opção 2: Bloquear mudança de admin para admin
- Admin não poderá mudar próprio role (apenas de outros)

**Qual você prefere?**

---

## ⚠️ IMPORTANTE

**NUNCA** mude seu próprio role de `admin` para outro role!

Se precisar testar outros roles:
1. Crie usuários de teste com outros emails
2. OU use outra aba anônima do navegador
3. Mantenha uma aba sempre como admin

---

## 📞 Ainda com problema?

Se não conseguir acessar o Firebase Console:

1. **Confirme que está logado com:** `williancustodioquintino@gmail.com`
2. **Abra este link direto:** https://console.firebase.google.com
3. **Selecione o projeto:** `recanto-do-amor-miserico-e5a7b`

---

**Você conseguirá voltar a ser admin em menos de 2 minutos!** 🚀

Siga o Passo a Passo acima e me avise quando recuperar o acesso.
