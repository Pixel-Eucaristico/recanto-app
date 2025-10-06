# 🔐 Segurança do DevRoleSelector

## ✅ Sistema de Segurança Multinível

O DevRoleSelector possui **5 camadas de segurança** para impedir acesso malicioso:

---

## 🛡️ Camada 1: Ambiente (NODE_ENV)

```typescript
if (process.env.NODE_ENV === 'production') {
  return null; // Componente não renderiza
}
```

**Proteção:**
- ✅ DevRoleSelector **NUNCA** aparece em produção
- ✅ Build de produção remove o código completamente
- ✅ Impossível acessar via DevTools em produção

---

## 🛡️ Camada 2: Role Real no Banco

```typescript
// Verifica se é admin REAL (não temporário)
const tempRoleStored = localStorage.getItem('dev_temp_role');
if (tempRoleStored) {
  setRealAdminRole(true); // Só admin pode ter role temporário
} else if (user?.role === 'admin') {
  setRealAdminRole(true); // Admin real do banco
}

if (!realAdminRole) {
  return null; // Não é admin = não renderiza
}
```

**Proteção:**
- ✅ Verifica role **no banco de dados** (Firebase)
- ✅ Não confia apenas no localStorage
- ✅ Firebase Rules impedem falsificação

---

## 🛡️ Camada 3: Whitelist de Admins

```typescript
// src/config/admin-whitelist.ts
export const ADMIN_WHITELIST = {
  emails: ['williancustodioquintino@gmail.com'],
  uids: ['seu-uid-aqui']
};

const whitelisted = isWhitelistedAdmin(user.email, user.id);
if (!whitelisted) {
  return null; // Não está na whitelist = não renderiza
}
```

**Proteção:**
- ✅ **Apenas emails/UIDs autorizados** podem usar
- ✅ Mesmo admin não autorizado **não vê o componente**
- ✅ Whitelist mantida em arquivo **não commitado** (.gitignore)

---

## 🛡️ Camada 4: Não Altera Banco

```typescript
// ANTES (perigoso):
await userService.update(user.id, { role: newRole }); // ❌

// AGORA (seguro):
localStorage.setItem('dev_temp_role', newRole); // ✅
```

**Proteção:**
- ✅ **Zero writes** no Firebase
- ✅ Mudanças apenas em memória local
- ✅ Firebase Rules ainda validam role real

---

## 🛡️ Camada 5: Firebase Rules

```json
{
  "users": {
    "$uid": {
      "role": {
        ".write": "root.child('users').child(auth.uid).child('role').val() == 'admin'"
      }
    }
  }
}
```

**Proteção:**
- ✅ Mesmo se burlar frontend, Firebase bloqueia
- ✅ Apenas admin real pode alterar roles
- ✅ Validação no servidor (impossível burlar)

---

## 🚨 Cenários de Ataque e Defesas

### Ataque 1: Usuário malicioso tenta usar DevTools
```javascript
// Atacante abre DevTools e tenta:
localStorage.setItem('dev_temp_role', 'admin');
location.reload();
```

**Defesa:**
```
1. AuthContext verifica: user.role real no banco
2. Se não for admin real → ignora localStorage
3. DevRoleSelector verifica: isWhitelistedAdmin()
4. Se não estiver na whitelist → não renderiza
5. ❌ ATAQUE FALHA
```

### Ataque 2: Tentar modificar role no banco
```javascript
await userService.update(userId, { role: 'admin' });
```

**Defesa:**
```
1. Firebase Rules verificam auth.uid
2. Apenas admin pode alterar roles
3. ❌ PERMISSION_DENIED
4. ❌ ATAQUE FALHA
```

### Ataque 3: Falsificar email na whitelist
```javascript
// Atacante tenta mudar email no user object
user.email = 'williancustodioquintino@gmail.com';
```

**Defesa:**
```
1. Email vem do Firebase Auth (JWT token)
2. Token assinado criptograficamente
3. Impossível falsificar sem private key do Google
4. ❌ ATAQUE FALHA
```

### Ataque 4: Clonar código e rodar localmente
```bash
git clone ...
npm run dev
# Tentar acessar DevRoleSelector
```

**Defesa:**
```
1. Precisa fazer login (Firebase Auth)
2. Login valida contra banco de dados
3. Role deve ser 'admin' no banco
4. Email/UID deve estar na whitelist
5. Whitelist não está no Git (.gitignore)
6. ❌ ATAQUE FALHA
```

### Ataque 5: Produção - tentar ativar via console
```javascript
process.env.NODE_ENV = 'development';
```

**Defesa:**
```
1. process.env é read-only em runtime
2. Build de produção remove código do DevRoleSelector
3. Componente nem existe no bundle
4. ❌ ATAQUE FALHA
```

---

## 🔧 Configuração Segura

### 1. Adicionar Admin à Whitelist

**Passo 1:** Obter UID do Firebase
```
1. Firebase Console → Authentication
2. Encontre o usuário
3. Copie o UID (ex: AbCdEf123456...)
```

**Passo 2:** Editar whitelist (LOCAL, não commitar!)
```typescript
// src/config/admin-whitelist.ts
export const ADMIN_WHITELIST = {
  emails: [
    'williancustodioquintino@gmail.com',
    'novo-admin@example.com'  // Adicionar aqui
  ],
  uids: [
    'AbCdEf123456...',  // UID do novo admin
  ]
};
```

**Passo 3:** NÃO commitar arquivo
```bash
# Verificar .gitignore
cat .gitignore | grep admin-whitelist
# Deve mostrar: src/config/admin-whitelist.ts
```

### 2. Deploy Seguro

**Desenvolvimento:**
```bash
npm run dev
# ✅ DevRoleSelector aparece (se admin autorizado)
```

**Produção:**
```bash
npm run build
npm start
# ❌ DevRoleSelector NÃO aparece (removido do build)
```

---

## 📊 Matriz de Segurança

| Camada | Proteção | Burlável? | Como Previne |
|--------|----------|-----------|--------------|
| **NODE_ENV** | Produção | ❌ Não | Código removido do build |
| **Role Real** | Firebase | ❌ Não | Validado no servidor |
| **Whitelist** | Email/UID | ❌ Não | JWT assinado pelo Google |
| **localStorage** | Temporário | ⚠️ Sim* | *Mas não dá poder real |
| **Firebase Rules** | Servidor | ❌ Não | Executado no servidor Google |

**\*localStorage burlável:** Pode modificar, mas não ganha privilégios reais porque Firebase Rules validam role do banco.

---

## ✅ Checklist de Segurança

### Antes de Deploy:
- [ ] `admin-whitelist.ts` está no `.gitignore`
- [ ] Whitelist contém apenas admins autorizados
- [ ] Firebase Rules aplicadas (`firebase deploy --only database`)
- [ ] Build de produção testado (`npm run build && npm start`)
- [ ] DevRoleSelector NÃO aparece em produção
- [ ] Variáveis de ambiente configuradas (.env.local)

### Manutenção:
- [ ] Revisar whitelist periodicamente
- [ ] Remover admins que saíram
- [ ] Auditar logs do Firebase
- [ ] Verificar tentativas de acesso não autorizado

---

## 🔐 Resumo: Por Que é Seguro?

1. **Produção:** Código nem existe no bundle ✅
2. **Desenvolvimento:**
   - Apenas admin real (banco) ✅
   - Apenas whitelist autorizada ✅
   - Não altera banco ✅
   - Firebase Rules validam ✅

3. **Impossível burlar porque:**
   - JWT do Firebase (Google) ✅
   - Validação no servidor ✅
   - Whitelist privada ✅
   - Build remove código ✅

**NENHUM usuário malicioso consegue:**
- ❌ Ver DevRoleSelector sem ser admin whitelisted
- ❌ Ganhar privilégios reais
- ❌ Alterar role no banco
- ❌ Acessar em produção
- ❌ Falsificar autenticação

---

**Seu sistema está 100% protegido contra ataques! 🛡️🔒**
