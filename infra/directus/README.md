# Directus IaC

Esta pasta sera a fonte declarativa da instalacao Directus.

Estrutura planejada:

- `schema/`: collections, fields e relations.
- `access/`: roles e permissions.
- `flows/`: automacoes do Directus.
- `seed/`: dados iniciais essenciais.

O adapter Directus ainda esta bloqueado por contrato no codigo. Ele deve ser implementado dominio
por dominio, acompanhado por arquivos declarativos aqui.

## Comandos

Configure:

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_TOKEN=...
```

Depois rode:

```bash
npm run infra:directus:dry
npm run infra:directus:apply
npm run infra:directus:snapshot
```
