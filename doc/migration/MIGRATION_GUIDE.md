# 🔄 Migração: Realtime Database → Firestore

**Status:** ✅ Concluída em 2025-10-06

## Por que Firestore?

- Queries compostas (múltiplos filtros + orderBy)
- 10 GB grátis vs 1 GB
- Conexões ilimitadas vs 100k
- Offline support nativo
- Array queries (array-contains)

## Mudanças Principais

1. **BaseFirebaseService** → Firestore com `collection()`, `doc()`, `addDoc()`
2. **Novos métodos:** `queryWithFilters()`, `queryWithOrder()`, `onQueryChange()`
3. **Serviços otimizados:** MaterialService, EventService, AcompanhamentoService
4. **Security Rules:** `firestore.rules` com RBAC

## Deploy

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Troubleshooting

**"Missing permissions":** `firebase deploy --only firestore:rules`
**"Query requires index":** Copiar link do console e criar índice automaticamente

## Dados Migrados

- ✅ 1 usuário
- ✅ Role admin configurado
- ✅ Regras deployadas
- ✅ Índices criados
- ⚠️ Scripts removidos por segurança

**Migração criada:** 2025-10-05
**Concluída:** 2025-10-06
**Autor:** Claude Code (Anthropic)
