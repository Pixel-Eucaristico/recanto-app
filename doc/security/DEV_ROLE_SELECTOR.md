# 🔧 DevRoleSelector - Testador de Roles

## ✅ Novo Sistema: 100% Seguro!

### 🎯 Como Funciona Agora:

**NUNCA altera o banco de dados!** ✅

O DevRoleSelector agora funciona com **roles temporários** que:
- ✅ **Não salvam no Firebase**
- ✅ **Não alteram seu admin permanente**
- ✅ **Resetam ao recarregar sem role temporário**
- ✅ **Apenas para testes de UX/UI**

---

## 🚀 Como Usar

### 1. **Testar outro role:**
1. Expanda o DevRoleSelector (canto inferior direito)
2. No select, escolha o role que quer testar (ex: "Recantiano")
3. A página recarrega
4. ✅ Agora você vê a UI como se fosse recantiano
5. 🔒 Seu role **admin** continua seguro no banco!

### 2. **Voltar ao Admin:**
- **Opção 1:** Clique no botão **"Voltar ao Admin"** (🔄)
- **Opção 2:** Selecione **"Admin"** no select
- **Opção 3:** Recarregue sem role temporário

### 3. **Verificar Role Real:**
Sempre mostra: `Role Real (DB): admin 🔒`
- Este **NUNCA muda**
- É seu role permanente no Firebase

---

## 🔍 O Que Acontece Internamente

### Fluxo de Teste de Role:

```
1. Você escolhe "Recantiano"
   ↓
2. DevRoleSelector salva no localStorage: 'dev_temp_role' = 'recantiano'
   ↓
3. AuthContext lê o localStorage
   ↓
4. Se user.role real = 'admin' E existe dev_temp_role
   ↓
5. Aplica role temporário APENAS na UI: user.role = 'recantiano'
   ↓
6. Firebase continua com: role = 'admin' 🔒
   ↓
7. UI mostra sidebar/rotas de recantiano
   ↓
8. Firebase Rules ainda validam como admin (você tem poder total)
```

### Resetar:
```
1. Clica "Voltar ao Admin" OU seleciona "Admin"
   ↓
2. Remove localStorage: 'dev_temp_role'
   ↓
3. Recarrega página
   ↓
4. AuthContext não encontra dev_temp_role
   ↓
5. Usa role do banco: 'admin'
   ↓
6. ✅ Volta ao admin normal
```

---

## 🛡️ Segurança Garantida

### ✅ Impossível perder admin porque:

1. **Banco de dados nunca é alterado**
   ```typescript
   // ANTES (perigoso):
   await userService.update(user.id, { role: newRole }); // ❌

   // AGORA (seguro):
   localStorage.setItem('dev_temp_role', newRole); // ✅
   ```

2. **DevRoleSelector sempre verifica admin real**
   ```typescript
   // Se existe role temporário = você é admin real
   // Se não existe E user.role = 'admin' = você é admin real
   ```

3. **Firebase Rules validam role do banco**
   ```
   Mesmo testando como "recantiano", você pode:
   - Criar materiais (apenas admin pode)
   - Ver doações (apenas admin pode)
   - Alterar eventos (apenas admin pode)
   ```

4. **Produção desabilita automaticamente**
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     return null; // DevRoleSelector não aparece
   }
   ```

---

## 🎨 Interface Visual

### Quando NÃO está testando:
```
🔧 ADMIN MODE
├─ Admin: williancustodioquintino@gmail.com
├─ Role Real (DB): admin 🔒
├─ Testar role temporário:
└─ [Select: Admin ▼]
   ✅ Não altera o banco de dados
   ⚠️ Apenas desenvolvimento
```

### Quando está testando (ex: Recantiano):
```
🔧 ADMIN MODE (Testando)
├─ Admin: williancustodioquintino@gmail.com
├─ Role Real (DB): admin 🔒
├─ Testando como: recantiano
└─ [Select: Recantiano ▼]
   [🔄 Voltar ao Admin]  ← Botão para resetar
   ✅ Não altera o banco de dados
   ⚠️ Apenas desenvolvimento
```

---

## 🧪 Casos de Teste

### Teste 1: Sidebar de Recantiano
```
1. Selecione: "Recantiano"
2. Observe a sidebar
3. ✅ Deve mostrar: Início, Formação, Fórum, Meus Desafios
4. ❌ Não deve mostrar: Admin, Relatório Doações, Omie
```

### Teste 2: Sidebar de Missionário
```
1. Selecione: "Missionário"
2. Observe a sidebar
3. ✅ Deve mostrar: Início, Formação, Fórum, Acompanhamentos, Agenda
4. ❌ Não deve mostrar: Admin, Meus Desafios
```

### Teste 3: Sidebar de Benfeitor
```
1. Selecione: "Benfeitor"
2. Observe a sidebar
3. ✅ Deve mostrar: Início, Apoiar a Obra, Feedback, Sobre
4. ❌ Não deve mostrar: Admin, Formação, Fórum
```

### Teste 4: Verificar Admin Real
```
1. Enquanto testa como "Recantiano"
2. Abra Firebase Console
3. Verifique: users/[seu-uid]/role
4. ✅ Deve mostrar: "admin" (não mudou!)
```

### Teste 5: Resetar
```
1. Teste como "Colaborador"
2. Clique: "Voltar ao Admin"
3. ✅ DevRoleSelector reaparece (sumiu quando era colaborador)
4. ✅ Sidebar mostra todas as opções de admin
```

---

## ⚙️ Configurações

### localStorage Key:
```
'dev_temp_role' = 'recantiano' | 'missionario' | 'pai' | 'colaborador' | 'benfeitor' | null
```

### Para limpar manualmente (DevTools Console):
```javascript
localStorage.removeItem('dev_temp_role');
location.reload();
```

---

## 🚨 Troubleshooting

### Problema: DevRoleSelector sumiu
**Causa:** Você testou um role que não é admin
**Solução:**
```javascript
// Abra DevTools Console (F12)
localStorage.removeItem('dev_temp_role');
location.reload();
// ✅ DevRoleSelector volta a aparecer
```

### Problema: Não consigo voltar ao admin
**Solução 1 (localStorage):**
```javascript
localStorage.removeItem('dev_temp_role');
location.reload();
```

**Solução 2 (URL direta):**
```
http://localhost:3000/app/dashboard?reset_dev_role=true
```

### Problema: Role temporário não aplica
**Verificar:**
1. Está em desenvolvimento? (`NODE_ENV !== 'production'`)
2. Seu role real é admin? (Firebase Console)
3. localStorage tem a chave? (DevTools → Application → localStorage)

---

## 📊 Comparação: Antes vs Agora

| Aspecto | Antes (Perigoso) | Agora (Seguro) |
|---------|------------------|----------------|
| **Altera banco** | ✅ Sim (perigoso!) | ❌ Não (seguro!) |
| **Perde admin** | ✅ Sim | ❌ Impossível |
| **Recuperar** | Via Firebase Console | Automático |
| **Testes de UX** | ✅ Funciona | ✅ Funciona |
| **Produção** | Oculto | Oculto |
| **Reset fácil** | ❌ Não | ✅ Um clique |

---

## 🎯 Resumo

### ✅ Vantagens do Novo Sistema:
1. **100% seguro** - Nunca perde admin
2. **Testes fáceis** - Troca role com 1 clique
3. **Reset rápido** - Volta ao admin instantaneamente
4. **Visual claro** - Sempre mostra role real
5. **Sem riscos** - Banco nunca é alterado

### 🔐 Garantias:
- ✅ Role admin **permanente** no banco
- ✅ Testes **temporários** apenas na UI
- ✅ Firebase Rules validam **role real**
- ✅ Produção **desabilitada** automaticamente

---

**Agora você pode testar TODOS os roles com segurança total!** 🚀🔒
