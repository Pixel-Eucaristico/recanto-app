# Infrastructure as Code

Esta pasta concentra a infraestrutura declarativa dos backends suportados pelo Recanto.

- `firebase/`: regras, indices e deploy do Firebase/Firestore.
- `directus/`: schema, roles, permissions e seeds do Directus.

Por enquanto, os arquivos Firebase ativos continuam na raiz do projeto por compatibilidade com
`firebase-tools` e os scripts existentes. A migracao fisica para `infra/firebase` deve acontecer
em um PR separado, junto com o ajuste dos comandos de deploy.
