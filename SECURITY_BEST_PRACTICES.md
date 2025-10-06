# 🔐 Segurança - Recanto App

## Práticas Implementadas

✅ **Service Account Keys** - No `.gitignore`, removidos após migração
✅ **Scripts Admin** - Removidos após uso (migração/set-admin)
✅ **Firestore Rules** - RBAC com validação de campos
✅ **Variáveis de Ambiente** - `.env.local` no `.gitignore`

## Operações Admin Seguras

### Definir Role de Usuário

**Firebase Console (Recomendado):**
1. console.firebase.google.com
2. Firestore → users → [user-id]
3. Editar campo `role`

**Cloud Function (Produção):**
```typescript
export const setUserRole = functions.https.onCall(async (data, context) => {
  // Verificar se caller é admin
  // Atualizar role
});
```

## Riscos e Prevenção

**Service Account vazado:** Revogar imediatamente no Console
**Regras permissivas:** Testar com Firebase Emulator antes de deploy
**Variáveis expostas:** Apenas `NEXT_PUBLIC_*` para chaves públicas

## Checklist Pré-Deploy

- [ ] `firebase deploy --only firestore:rules`
- [ ] Service Account Keys não no código
- [ ] `.env.local` no `.gitignore`
- [ ] 2FA habilitado na conta Firebase

## Em Caso de Incidente

1. Revogar acesso (Console → IAM)
2. Verificar logs
3. Revisar dados
4. Documentar incidente

**Última atualização:** 2025-10-06
