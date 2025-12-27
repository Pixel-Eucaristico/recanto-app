# 📜 Scripts

## Status

✅ **Migração concluída** em 2025-10-06
- 1 usuário migrado
- Role admin configurado
- Regras deployadas

⚠️ **Scripts removidos** por segurança:
- `migrate-to-firestore.ts`
- `set-admin.ts`
- `tsconfig.json`

## Operações Administrativas

### Definir usuário como admin

**Firebase Console:**
1. https://console.firebase.google.com/
2. Firestore → users → [user-id]
3. Editar `role` → `admin`

**Firebase CLI:**
```bash
firebase firestore:update users/USER_ID '{"role": "admin"}'
```

## Segurança

- ❌ NUNCA commite `firebase-service-account.json`
- ✅ Use Firebase Console para operações admin
- ✅ Cloud Functions para produção

**Status:** ✅ Migração concluída | ✅ Pronto para produção
