# 🔥 Firebase Setup - Recanto do Amor Misericordioso

## ✅ Configuração Completa

O projeto está 100% integrado com Firebase Realtime Database e Authentication!

## 🚀 Como Usar

### 1. **Login com Google (RECOMENDADO para Admin)**

1. Acesse: `http://localhost:3000/app/login`
2. Clique no botão **"Google"**
3. Faça login com: `williancustodioquintino@gmail.com`
4. Você será redirecionado para o dashboard

### 2. **Definir como Admin**

Após fazer login, você verá um **seletor de role amarelo** no canto inferior direito (apenas em desenvolvimento).

1. No seletor, escolha **"Admin"**
2. A página recarregará
3. Agora você tem acesso total como administrador!

### 3. **Alternativa: Login com Email/Senha**

- Registre um novo usuário em `/app/register`
- Use o seletor de role para definir permissões

## 🔐 Estrutura de Autenticação

### Fluxo de Autenticação
1. **Firebase Auth** - Gerencia autenticação (email/senha, Google, Facebook, Twitter)
2. **Realtime Database** - Armazena dados do usuário com role
3. **AuthContext** - Prove estado de autenticação para toda aplicação
4. **ProtectedRoute** - Protege rotas autenticadas

### Sincronização Automática
- Quando você faz login (qualquer método), o sistema:
  - Autentica no Firebase Auth
  - Busca/cria usuário no Realtime Database usando UID do Firebase Auth
  - Armazena role e informações adicionais

## 📊 Estrutura do Banco de Dados

```
/users/{uid}
  - id: string (UID do Firebase Auth)
  - name: string
  - email: string
  - role: 'admin' | 'missionario' | 'recantiano' | 'pai' | 'colaborador' | 'benfeitor' | null
  - created_at: string (ISO date)

/materials/{materialId}
/donations/{donationId}
/forum_topics/{topicId}
/forum_posts/{postId}
/events/{eventId}
/acompanhamentos/{acompanhamentoId}
/desafios/{desafioId}
/desafio_registros/{registroId}
```

## 🛡️ Regras de Segurança

✅ **Aplicadas com sucesso!**

- Usuários autenticados podem ler dados de outros usuários
- Usuários podem atualizar apenas seus próprios dados
- **Admins** podem modificar qualquer dado
- Materiais, Eventos e Desafios: apenas admins podem criar/editar
- Acompanhamentos: apenas missionários e admins
- Fórum e Doações: todos autenticados

## 🔧 Serviços Disponíveis

```typescript
// Importar serviços
import {
  userService,
  materialService,
  donationService,
  forumTopicService,
  forumPostService,
  eventService,
  acompanhamentoService,
  desafioService,
  desafioRegistroService
} from '@/services/firebase';

// Exemplo de uso
const user = await userService.get(userId);
const materials = await materialService.getMaterialsByCategory('formacao');
const donations = await donationService.getDonationsByStatus('confirmado');
```

## 👤 Roles Disponíveis

1. **admin** - Acesso total
2. **missionario** - Formação, fórum, acompanhamentos
3. **recantiano** - Desafios, materiais formativos
4. **pai** - Acompanhamento do filho recantiano
5. **colaborador** - Tarefas específicas
6. **benfeitor** - Área de doações
7. **null** - Visitante (acesso limitado)

## 🧪 Testando

### Teste Rápido
```bash
npm run dev
```

1. Acesse `http://localhost:3000/app/login`
2. Login com Google: `williancustodioquintino@gmail.com`
3. Use o seletor de role para testar diferentes permissões
4. Navegue pelo dashboard e veja as rotas filtradas por role

### Teste de Serviços
```typescript
// No dashboard, abra o console e teste:
import { userService } from '@/services/firebase';

// Listar usuários
const users = await userService.list();
console.log(users);

// Buscar por role
const admins = await userService.getUsersByRole('admin');
console.log(admins);
```

## 📝 Próximos Passos

1. ✅ Autenticação funcionando
2. ✅ Banco de dados configurado
3. ✅ Regras de segurança aplicadas
4. ✅ Serviços Firebase implementados
5. ⏳ Implementar interfaces de CRUD para cada entidade
6. ⏳ Upload de materiais (Supabase Storage)
7. ⏳ Sistema de notificações em tempo real

## 🚨 Importante

### Ambiente de Produção
- Remover `DevRoleSelector` (apenas desenvolvimento)
- Implementar sistema de convites para admins
- Adicionar validações adicionais de segurança
- Configurar variáveis de ambiente adequadamente

### Código Clean & SOLID
✅ Todos os serviços seguem:
- **Single Responsibility** - Cada serviço tem uma responsabilidade
- **Open/Closed** - BaseFirebaseService extensível sem modificação
- **Liskov Substitution** - Todos os serviços herdam BaseFirebaseService
- **Interface Segregation** - Métodos específicos por necessidade
- **Dependency Inversion** - Depende de abstrações (FirebaseUser, Role)

### Padrões Seguidos
✅ **Código em Inglês** - Variáveis, funções, classes
✅ **UI em Português** - Labels, mensagens, botões
✅ **Responsive** - Mobile-first com Tailwind CSS
✅ **Type Safety** - TypeScript completo em todas as entidades

## 📞 Suporte

Qualquer dúvida sobre Firebase:
1. Verifique o console do Firebase
2. Consulte `CLAUDE.md` para arquitetura
3. Veja exemplos em `src/services/firebase/`

---

**Paz e Unção! 🙏**
