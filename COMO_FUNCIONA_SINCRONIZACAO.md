# 🔄 Como Funciona a Sincronização (Sem Duplicação)

## 📊 Diagrama do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    RECANTO APP                               │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   FIRESTORE      │         │  GOOGLE CALENDAR │          │
│  │   (Banco Local)  │◄───────►│  (Nuvem Google)  │          │
│  └──────────────────┘         └──────────────────┘          │
│                                                               │
│  Cada evento tem:                                            │
│  ✅ id (Firestore)                                           │
│  ✅ google_calendar_id (se sincronizado)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Proteção Contra Duplicação

### **1. Campo Único: `google_calendar_id`**

Cada evento salvo no Firestore pode ter um campo `google_calendar_id`:

```javascript
{
  id: "abc123",                    // ID no Firestore
  title: "Reunião de Oração",
  start: "2025-01-20T10:00:00Z",
  google_calendar_id: "xyz789"     // ID no Google Calendar (se sincronizado)
}
```

### **2. Exportação (Firestore → Google)**

```javascript
// Código em: src/app/api/calendar/export/route.ts

// Pega APENAS eventos que NÃO têm google_calendar_id
const unsyncedEvents = allEvents.filter(event => !event.google_calendar_id);

// Para cada evento não sincronizado:
for (const event of unsyncedEvents) {
  const googleEventId = await createEventInGoogle(event);
  
  // Salva o ID do Google no Firestore
  await eventService.update(event.id, {
    google_calendar_id: googleEventId  // ✅ Marcado como sincronizado
  });
}
```

**Resultado**:
- ✅ Evento vai para o Google **UMA VEZ**
- ✅ `google_calendar_id` salvo no Firestore
- ✅ Próxima exportação **IGNORA** este evento (já tem google_calendar_id)

---

### **3. Importação (Google → Firestore)**

```javascript
// Código em: src/integrations/google-calendar/GoogleCalendarService.ts

// Busca eventos do Google
const googleEvents = await fetchGoogleCalendarEvents();

// Busca eventos já sincronizados no Firestore
const existingEventsMap = new Map(
  existingEvents
    .filter(e => e.google_calendar_id)
    .map(e => [e.google_calendar_id, e])  // Mapeia por google_calendar_id
);

for (const googleEvent of googleEvents) {
  const existingEvent = existingEventsMap.get(googleEvent.id);
  
  if (existingEvent) {
    // ✅ ATUALIZA (não duplica)
    await eventService.update(existingEvent.id, updates);
  } else {
    // ✅ CRIA NOVO
    await eventService.create({
      ...newEvent,
      google_calendar_id: googleEvent.id  // Salva ID do Google
    });
  }
}
```

**Resultado**:
- ✅ Se o evento JÁ existe no Firestore → **ATUALIZA**
- ✅ Se o evento NÃO existe → **CRIA**
- ✅ **NUNCA duplica**

---

## 🔄 Cenários de Uso

### **Cenário 1: Criar Evento no Sistema**

```
1. Usuário cria "Reunião" na Agenda
   ↓
2. Salvo no Firestore (id: "abc123", google_calendar_id: null)
   ↓
3. Sistema detecta que Google Calendar está conectado
   ↓
4. Cria automaticamente no Google (google_id: "xyz789")
   ↓
5. Atualiza Firestore (google_calendar_id: "xyz789")
   ↓
✅ Evento existe em AMBOS sem duplicação
```

---

### **Cenário 2: Criar Evento no Google (Celular)**

```
1. Usuário cria "Missa" no Google Calendar (celular)
   ↓
2. Usuário clica "Importar do Google" no sistema
   ↓
3. Sistema busca eventos do Google
   ↓
4. Verifica: "Missa" existe no Firestore?
   - NÃO → Cria novo no Firestore com google_calendar_id
   ↓
✅ Evento importado SEM duplicação
```

---

### **Cenário 3: Editar Evento Sincronizado**

```
1. Usuário edita "Reunião" no sistema (muda horário)
   ↓
2. Sistema verifica: tem google_calendar_id?
   - SIM → Atualiza TAMBÉM no Google
   ↓
✅ Alteração sincronizada em AMBOS
```

---

### **Cenário 4: Exportar Eventos Antigos**

```
1. Usuário tem 10 eventos criados ANTES de conectar Google
   ↓
2. Usuário clica "Exportar para Google"
   ↓
3. Sistema filtra: quais NÃO têm google_calendar_id?
   - Resultado: 10 eventos
   ↓
4. Envia os 10 para o Google
   ↓
5. Atualiza cada um com google_calendar_id
   ↓
6. Usuário clica "Exportar" novamente
   ↓
7. Sistema filtra: quais NÃO têm google_calendar_id?
   - Resultado: 0 eventos (todos já sincronizados)
   ↓
✅ Nenhum evento duplicado
```

---

## 📋 Resumo da Proteção

| Ação | Como Evita Duplicação |
|------|----------------------|
| **Exportar → Google** | Filtra apenas eventos SEM `google_calendar_id` |
| **Importar ← Google** | Verifica se já existe por `google_calendar_id` antes de criar |
| **Criar novo no sistema** | Envia para Google UMA VEZ e salva o `google_calendar_id` |
| **Editar sincronizado** | Atualiza em AMBOS usando o `google_calendar_id` |
| **Excluir sincronizado** | Remove de AMBOS usando o `google_calendar_id` |

---

## 🎯 Conclusão

O sistema usa **`google_calendar_id`** como **chave única** para garantir que:

- ✅ Cada evento do Google tem **NO MÁXIMO** 1 correspondente no Firestore
- ✅ Cada evento do Firestore tem **NO MÁXIMO** 1 correspondente no Google
- ✅ **IMPOSSÍVEL** duplicar eventos em qualquer direção

**É 100% seguro sincronizar quantas vezes quiser!** 🚀
