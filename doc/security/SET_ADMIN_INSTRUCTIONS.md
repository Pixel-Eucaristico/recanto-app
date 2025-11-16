# 🔐 Configurar Admin - Instruções

## ✅ Segurança Implementada

### 1. **DevRoleSelector - APENAS para ADMINS** 🔧
- ✅ Visível **APENAS** para usuários com `role: 'admin'`
- ✅ Cor alterada para **VERMELHO** indicando poder de admin
- ✅ Oculto em produção (`NODE_ENV === 'production'`)
- ✅ Outros usuários **não veem** o seletor

### 2. **Firebase Rules - MÁXIMA SEGURANÇA** 🛡️

#### Proteções Adicionadas:
- ✅ **Apenas admins podem alterar roles**
- ✅ **Validação de campos obrigatórios** em todas as entidades
- ✅ **Doações visíveis apenas para admin e dono**
- ✅ **Acompanhamentos protegidos** (admin, missionário, pai, ou próprio recantiano)
- ✅ **Desafios gerenciados apenas por admins**
- ✅ **Eventos criados por admin ou missionário**
- ✅ **Fórum restrito** a admin, missionário e recantiano

---

## 🚀 Como se tornar Admin

### Método 1: Login pelo App (RECOMENDADO)

1. **Faça login com Google:**
   ```bash
   npm run dev
   ```
   - Acesse: `http://localhost:3000/app/login`
   - Clique em **"Google"**
   - Entre com: `williancustodioquintino@gmail.com`

2. **Abra o Console Firebase:**
   - Acesse: https://console.firebase.google.com/project/recanto-do-amor-miserico-e5a7b/database
   - Vá em **Realtime Database** → **Data**

3. **Encontre seu usuário:**
   - Procure em `users/` pelo seu UID
   - Clique no seu usuário

4. **Altere o role manualmente:**
   - Clique no campo `role`
   - Altere para: `admin`
   - Salvar ✅

5. **Recarregue a página:**
   - Agora você é admin permanente!
   - DevRoleSelector aparece no canto inferior direito

### Método 2: Script Automático (Requer Firebase Admin SDK)

⚠️ **Requer configuração de credenciais Admin**

```bash
node scripts/set-admin-secure.mjs
```

---

## 🔒 Regras de Segurança Aplicadas

### Users (Usuários)
```json
{
  ".read": "auth != null",
  ".write": "auth.uid == $uid || admin",
  "role": {
    ".write": "admin only"  // 🔒 Apenas admins mudam roles
  }
}
```

### Materials (Materiais)
```json
{
  ".read": "auth != null",
  ".write": "admin only",  // 🔒 Apenas admins criam
  ".validate": "campos obrigatórios"
}
```

### Donations (Doações)
```json
{
  ".read": "admin OR próprio doador",  // 🔒 Privacidade
  ".write": "auth != null",
  ".validate": "campos obrigatórios"
}
```

### Forum Topics/Posts
```json
{
  ".read": "auth != null",
  ".write": "admin, missionário ou recantiano",  // 🔒 Restrito
  ".validate": "campos obrigatórios"
}
```

### Events (Eventos)
```json
{
  ".read": "auth != null",
  ".write": "admin ou missionário",  // 🔒 Gestão restrita
  ".validate": "campos obrigatórios"
}
```

### Acompanhamentos
```json
{
  ".read": "admin, missionário, pai, ou próprio recantiano",  // 🔒 Privacidade
  ".write": "admin ou missionário",
  ".validate": "campos obrigatórios"
}
```

### Desafios
```json
{
  ".read": "auth != null",
  ".write": "admin only",  // 🔒 Apenas admins criam desafios
  ".validate": "campos obrigatórios"
}
```

### Desafio Registros
```json
{
  ".read": "admin, missionário, ou próprio recantiano",  // 🔒 Privacidade
  ".write": "auth != null",
  ".validate": "campos obrigatórios"
}
```

---

## ✅ Checklist de Segurança

### Implementado ✅
- [x] Firebase Rules com validação de campos
- [x] Proteção de roles (apenas admin altera)
- [x] DevRoleSelector apenas para admins
- [x] Validação de dados obrigatórios
- [x] Privacidade de doações e acompanhamentos
- [x] Permissões específicas por role
- [x] Oculto em produção

### Próximos Passos (Produção) 🔜
- [ ] Firebase App Check (anti-bot)
- [ ] Rate limiting
- [ ] Logging de ações sensíveis
- [ ] 2FA para admins
- [ ] Backup automático

---

## 🧪 Testar Segurança

### 1. Teste - Apenas admin vê DevRoleSelector:
```
1. Login como recantiano
2. Resultado: ❌ DevRoleSelector não aparece

3. Login como admin (você)
4. Resultado: ✅ DevRoleSelector aparece (vermelho)
```

### 2. Teste - Não-admin não pode criar material:
```javascript
// Login como recantiano
await materialService.create({ title: 'Teste' });
// Resultado: ❌ PERMISSION_DENIED
```

### 3. Teste - Não pode mudar próprio role:
```javascript
// Login como recantiano
await userService.update(userId, { role: 'admin' });
// Resultado: ❌ PERMISSION_DENIED
```

---

## 📞 Suporte

**Admin Principal:** williancustodioquintino@gmail.com

**Firebase Console:** https://console.firebase.google.com/project/recanto-do-amor-miserico-e5a7b

---

**Paz e Unção! 🙏**

**Seu sistema está ULTRA SEGURO agora!** 🔒
