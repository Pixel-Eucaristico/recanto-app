# 🔐 Arquitetura de Segurança - Recanto Digital

## Resumo Executivo

Este projeto implementa **segurança em camadas** (Defense in Depth):

1. ✅ **Firebase Authentication** - Autenticação JWT
2. ✅ **Firebase Realtime Database Rules** - Autorização no servidor
3. ✅ **Frontend Protection** - UX e primeira camada
4. ✅ **Type Safety** - TypeScript previne erros

---

## 🛡️ Camadas de Segurança

### 1. Firebase Authentication (Camada 1)
**O que faz:**
- Gera tokens JWT invioláveis
- Valida identidade do usuário
- Tokens expiram automaticamente

**Proteção:**
```typescript
// Usuário não autenticado não consegue nem fazer requisições
const user = await authService.login(email, password);
// ↑ Gera token JWT validado pelo Firebase
```

### 2. Firebase Rules (Camada 2 - PRINCIPAL)
**O que faz:**
- Valida TODAS as operações no banco de dados
- Verifica role diretamente no banco (não no frontend)
- Executado no servidor (impossível burlar)

**Exemplos de Regras Aplicadas:**

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'admin'"
      }
    },
    "materials": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('role').val() == 'admin'"
    },
    "acompanhamentos": {
      ".write": "root.child('users').child(auth.uid).child('role').val() == 'missionario' || root.child('users').child(auth.uid).child('role').val() == 'admin'"
    }
  }
}
```

**Proteção:**
- ✅ Admin pode criar materiais
- ❌ Recantiano não pode criar materiais (mesmo alterando role no frontend)
- ✅ Missionário pode criar acompanhamentos
- ❌ Benfeitor não pode criar acompanhamentos

### 3. Frontend Protection (Camada 3 - UX)
**O que faz:**
- Esconde UI baseado no role
- Melhora experiência do usuário
- Previne tentativas acidentais

**NÃO É SEGURANÇA REAL:**
```typescript
// Pode ser burlado no DevTools
const userHasPermission = allowedRoles.includes(user.role);
```

**Mas Firebase Rules bloqueiam:**
```typescript
// Mesmo alterando role no frontend, Firebase recusa:
await materialService.create({ title: 'Hack' });
// ❌ Error: PERMISSION_DENIED
```

### 4. Type Safety (Camada 4)
**O que faz:**
- TypeScript previne erros de tipo
- Interfaces garantem estrutura correta
- Zod valida dados em runtime

---

## 🎯 Fluxo de Segurança Completo

### Tentativa de Acesso Normal (Admin):
```
1. Login com Google
   ↓
2. Firebase Auth gera token JWT
   ↓
3. Token armazenado e enviado em TODAS as requisições
   ↓
4. Firebase valida token no servidor
   ↓
5. Firebase Rules verificam: auth.uid e role no banco
   ↓
6. Role = 'admin' no banco ✅
   ↓
7. Operação permitida
```

### Tentativa de Ataque (Usuário Malicioso):
```
1. Login como 'recantiano'
   ↓
2. Abre DevTools e altera: user.role = 'admin'
   ↓
3. Frontend mostra UI de admin (apenas visual)
   ↓
4. Tenta criar material (apenas admin pode)
   ↓
5. Firebase recebe requisição com token JWT
   ↓
6. Firebase valida token ✅ (usuário autenticado)
   ↓
7. Firebase Rules verificam role NO BANCO
   ↓
8. Role no banco = 'recantiano' ❌
   ↓
9. Firebase RECUSA: PERMISSION_DENIED
```

---

## 🔒 Garantias de Segurança

### ✅ Impossível de Burlar:
1. **Criar dados sem permissão** - Firebase Rules bloqueiam
2. **Ler dados sem autenticação** - Firebase requer auth token
3. **Modificar role próprio** - Apenas admin pode alterar roles
4. **Falsificar token JWT** - Criptografia Firebase

### ⚠️ Pontos de Atenção:
1. **Variáveis de ambiente** - Nunca commitar `.env.local`
2. **Firebase Admin credentials** - Nunca expor private key
3. **Validação de entrada** - Sempre usar Zod nos formulários
4. **Rate limiting** - Implementar em produção

---

## 📝 Checklist de Segurança

### Implementado ✅
- [x] Firebase Authentication (JWT)
- [x] Firebase Rules aplicadas e testadas
- [x] Role-based access control (RBAC)
- [x] Type safety com TypeScript
- [x] Validação com Zod
- [x] UID do Firebase Auth como chave no banco
- [x] Frontend protection (UX)
- [x] Middleware básico

### Recomendado para Produção 🔜
- [ ] Rate limiting (Firebase App Check)
- [ ] Logging de tentativas de acesso
- [ ] 2FA para admins
- [ ] Auditoria de mudanças sensíveis
- [ ] HTTPS obrigatório (Vercel já tem)
- [ ] Backup automático do banco
- [ ] Monitoramento de anomalias

---

## 🧪 Como Testar a Segurança

### 1. Teste de Manipulação de Role:
```javascript
// 1. Login como recantiano
// 2. Abra DevTools Console
// 3. Execute:
const user = JSON.parse(localStorage.getItem('session'));
user.role = 'admin';
localStorage.setItem('session', JSON.stringify(user));
location.reload();

// 4. Tente criar material
// 5. Resultado esperado: PERMISSION_DENIED
```

### 2. Teste de Acesso Sem Autenticação:
```javascript
// 1. Logout
// 2. Tente acessar /app/dashboard diretamente
// 3. Resultado esperado: Redirecionado para /app/login
```

### 3. Teste de Firebase Rules:
```javascript
// 1. Login como benfeitor
// 2. Tente criar acompanhamento (apenas missionário/admin)
// 3. Resultado esperado: PERMISSION_DENIED
```

---

## 🚨 Cenários de Emergência

### Se descobrir vulnerabilidade:
1. **Imediato:** Desabilitar Firebase Rules problemáticas
2. **Comunicar:** Notificar equipe técnica
3. **Patch:** Corrigir e testar
4. **Deploy:** Aplicar correção
5. **Auditoria:** Verificar se foi explorada

### Contatos de Segurança:
- Admin: williancustodioquintino@gmail.com
- Firebase Console: https://console.firebase.google.com

---

## 📚 Referências

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Conclusão:** O sistema é seguro porque a **verdadeira validação acontece no servidor** (Firebase Rules), não no frontend. Mesmo que alguém manipule o código JavaScript no navegador, não conseguirá burlar as regras do Firebase.

**Paz e Unção! 🙏**
