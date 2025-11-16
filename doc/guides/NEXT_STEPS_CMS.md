# 🚀 Próximos Passos - CMS

## ✅ Já Implementado

### Sistema CMS Completo
- ✅ 4 Mods disponíveis (Hero, HeroMission, EventsSection, Testimonials)
- ✅ Editor visual com biblioteca de Mods
- ✅ Formulários dinâmicos baseados em config
- ✅ Reordenação com botões up/down
- ✅ Home page padrão editável
- ✅ Botão "Personalizar" funcionando

### Bibliotecas Instaladas
- ✅ @dnd-kit/core (drag-and-drop)
- ✅ @dnd-kit/sortable
- ✅ @dnd-kit/utilities

---

## 📋 Próximas Implementações

### 1. Drag-and-Drop para Reordenar Blocos

#### Arquivos a Modificar

**`src/app/(app)/app/dashboard/cms/[pageId]/edit/page.tsx`**

Adicionar imports:
```typescript
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
```

Adicionar handler:
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  })
);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  setPage((prevPage) => {
    if (!prevPage) return prevPage;

    const oldIndex = prevPage.blocks.findIndex(b => b.id === active.id);
    const newIndex = prevPage.blocks.findIndex(b => b.id === over.id);

    const newBlocks = arrayMove(prevPage.blocks, oldIndex, newIndex);

    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i;
    });

    return { ...prevPage, blocks: newBlocks };
  });
};
```

Envolver lista de blocos:
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={page.blocks.map(b => b.id)}
    strategy={verticalListSortingStrategy}
  >
    {page.blocks.map((block, index) => (
      <SortableBlockEditor
        key={block.id}
        block={block}
        index={index}
        // ... props
      />
    ))}
  </SortableContext>
</DndContext>
```

**`src/components/cms-editor/BlockEditor.tsx`**

Converter para componente sortable:
```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableBlockEditor({ block, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        {/* Drag handle */}
        <GripVertical className="w-5 h-5" />
      </div>
      <BlockEditor block={block} {...props} />
    </div>
  );
}
```

---

### 2. Depoimentos Editáveis no CMS

#### Opção A: Criar Coleção Firebase

**1. Criar tipo** em `src/types/firebase-entities.ts`:
```typescript
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  comment: string;
  date: string;
  order: number;
  is_published: boolean;
  created_at: string;
}
```

**2. Criar service** `src/services/firebase/TestimonialService.ts`:
```typescript
import { BaseFirebaseService } from './BaseFirebaseService';
import { Testimonial } from '@/types/firebase-entities';

class TestimonialService extends BaseFirebaseService<Testimonial> {
  constructor() {
    super('testimonials');
  }

  async getPublishedTestimonials(limit?: number): Promise<Testimonial[]> {
    return this.queryWithOrder('order', 'asc', limit);
  }
}

export const testimonialService = new TestimonialService();
```

**3. Criar rota de gerenciamento** `/app/dashboard/testimonials`:
- Lista depoimentos
- Criar/editar/excluir depoimentos
- Reordenar com drag-and-drop
- Publicar/despublicar

**4. Atualizar regras Firestore**:
```
match /testimonials/{testimonialId} {
  allow read: if resource.data.is_published == true || isAdmin();
  allow create, update, delete: if isAdmin();
}
```

**5. Atualizar Mod Testimonials** para buscar do Firebase:
```typescript
const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

useEffect(() => {
  const loadTestimonials = async () => {
    const data = await testimonialService.getPublishedTestimonials(3);
    setTestimonials(data);
  };
  loadTestimonials();
}, []);
```

#### Opção B: Editor In-Page (Mais Simples)

Adicionar props no Testimonials Mod para aceitar depoimentos customizados:

```typescript
interface TestimonialsProps {
  title?: string;
  testimonials?: Array<{
    name: string;
    role: string;
    comment: string;
    avatar?: string;
  }>;
}
```

Atualizar config:
```typescript
{
  name: 'testimonials',
  label: 'Depoimentos (JSON)',
  type: 'string',
  multiline: true,
  required: false,
  default: JSON.stringify([
    {
      name: 'João Silva',
      role: 'Membro da Comunidade',
      comment: 'Texto do depoimento...',
      avatar: 'https://...'
    }
  ], null, 2),
  description: 'Array JSON de depoimentos'
}
```

---

## 🎯 Recomendação

Para uma solução profissional e escalável:

1. **Implementar drag-and-drop primeiro** (melhora UX significativamente)
2. **Criar coleção Testimonials no Firebase** (Opção A)
3. **Criar rota `/app/dashboard/testimonials`** para gerenciar
4. **Adicionar drag-and-drop no gerenciador de depoimentos**

---

## 📦 Pacotes Já Instalados

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

Compatível com:
- ✅ React 19
- ✅ Next.js 15.5.2
- ✅ DaisyUI 5.0.50

---

## 🧪 Teste de Drag-and-Drop

Após implementar, teste:

1. Acesse editor de página
2. Arraste blocos pela handle (ícone de grip)
3. Solte em nova posição
4. ✅ Blocos reordenados automaticamente
5. Salve e verifique ordem persistida

---

## 📝 Documentação

- [@dnd-kit Docs](https://docs.dndkit.com/)
- [Sortable Examples](https://docs.dndkit.com/presets/sortable)
- [DaisyUI](https://daisyui.com/)

---

**Pronto para implementar! 🚀**
