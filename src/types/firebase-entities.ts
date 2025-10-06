import { Role } from '@/features/auth/types/user';

// ============================================
// User Entity (Semana 1)
// ============================================
export interface FirebaseUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  missionario_responsavel_id?: string; // Para recantianos
  filho_recantiano_id?: string; // Para pais
  created_at: string;
  updated_at?: string;
}

// ============================================
// Materials Entity - Formação (Semana 2-3)
// ============================================
export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'text' | 'link';
  url?: string; // URL do Supabase Storage ou link externo
  content?: string; // Para tipo 'text'
  category: 'formacao' | 'espiritual' | 'carisma' | 'virtudes';
  target_audience: Role[]; // Quem pode acessar
  author?: string;
  created_by: string; // ID do admin que criou
  created_at: string;
  updated_at?: string;
}

// ============================================
// Donations Entity (Semana 4)
// ============================================
export interface Donation {
  id: string;
  value: number;
  method: 'pix' | 'transferencia' | 'dinheiro' | 'outros';
  donor_id?: string; // ID do usuário doador (se logado)
  donor_name?: string; // Nome do doador anônimo
  donor_email?: string;
  donor_phone?: string;
  date: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================
// Forum Entities (Semana 2-3)
// ============================================
export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  created_by: string; // ID do usuário
  created_by_name: string;
  category?: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  content: string;
  created_by: string; // ID do usuário
  created_by_name: string;
  is_approved: boolean; // Para moderação
  created_at: string;
  updated_at?: string;
}

// ============================================
// Events Entity - Agenda (Semana 3)
// ============================================
export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'oracao' | 'reuniao' | 'formacao' | 'celebracao' | 'outro';
  start: string; // ISO datetime
  end: string; // ISO datetime
  location?: string;
  target_audience: Role[]; // Quem pode ver
  is_public: boolean; // Se true, aparece na página inicial (apenas admin pode definir)
  google_calendar_id?: string; // ID do evento no Google Calendar (se sincronizado)
  last_synced_at?: string; // Última sincronização com Google Calendar
  created_by: string;
  created_at: string;
  updated_at?: string;
}

// ============================================
// Recantiano Acompanhamento (Semana 5)
// ============================================
export interface AcompanhamentoRecantiano {
  id: string;
  recantiano_id: string;
  missionario_id: string;
  date: string;
  tipo: 'encontro' | 'conversa' | 'oracao' | 'outro';
  observacoes: string;
  progresso: 'iniciante' | 'intermediario' | 'avancado';
  created_at: string;
  updated_at?: string;
}

// ============================================
// Desafios da Compaixão (Semana 6)
// ============================================
export interface Desafio {
  id: string;
  title: string;
  description: string;
  category: 'compaixao' | 'oracao' | 'servico' | 'virtude';
  difficulty: 'facil' | 'medio' | 'dificil';
  points?: number;
  created_at: string;
  updated_at?: string;
}

export interface DesafioRegistro {
  id: string;
  desafio_id: string;
  recantiano_id: string;
  completed: boolean;
  completion_date?: string;
  reflection?: string; // Diário de registro
  created_at: string;
  updated_at?: string;
}

// ============================================
// Tarefas para Colaboradores (Semana 15 - Fase 3)
// ============================================
export interface Tarefa {
  id: string;
  title: string;
  description: string;
  assigned_to: string; // ID do colaborador
  assigned_by: string; // ID do admin
  status: 'pendente' | 'em_andamento' | 'concluida';
  priority: 'baixa' | 'media' | 'alta';
  due_date?: string;
  created_at: string;
  updated_at?: string;
}
