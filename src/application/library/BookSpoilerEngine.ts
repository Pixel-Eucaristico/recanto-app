/**
 * BookSpoilerEngine — pure logic.
 *
 * Calcula até onde o aluno pode ler de um livro `progressive` baseado nas aulas
 * que ele já concluiu e que referenciam o livro com `apply_spoiler=true`.
 *
 * Livro `open` => sempre integral (nunca corta).
 * Livro `progressive` sem nenhuma aula referenciando com spoiler => integral também.
 * Caso contrário => corta no maior `until_ref` entre as aulas concluídas.
 */

import { Book, BookChapter, BookBlock } from '@/domain/library/types';
import { CanonicalRefEntity, CanonicalRef } from '@/domain/library/entities/CanonicalRef';

/** Entrada — cada aula que cita o livro contribui com sua janela permitida. */
export interface SpoilerLessonInput {
  lesson_id: string;
  /** True se a aula faz parte do progresso do aluno (concluída/iniciada conforme regra). */
  user_completed: boolean;
  /** Configuração da aula. */
  apply_spoiler: boolean;
  /** Limite máximo que ESTA aula libera, se concluída. Pode ser ausente => libera até o end_ref dela. */
  until_ref?: string;
  /** Fallback quando `until_ref` ausente. */
  end_ref?: string;
}

export interface SpoilerComputation {
  /** Limite atual do aluno; null = sem corte (livro integral). */
  visible_until: CanonicalRef | null;
}

export class BookSpoilerEngine {
  /** Calcula até onde o aluno pode ler. */
  static compute(book: Book, lessons: SpoilerLessonInput[]): SpoilerComputation {
    if (book.spoiler_mode === 'open') return { visible_until: null };

    // Considera apenas aulas concluídas com apply_spoiler=true
    const candidates = lessons
      .filter(l => l.user_completed && l.apply_spoiler)
      .map(l => CanonicalRefEntity.tryParse(l.until_ref) ?? CanonicalRefEntity.tryParse(l.end_ref))
      .filter((r): r is CanonicalRef => r !== null);

    if (candidates.length === 0) {
      // Livro `progressive` mas nenhuma aula referencia com spoiler aplicado.
      // Default: libera integral (formador não definiu corte).
      return { visible_until: null };
    }

    return { visible_until: CanonicalRefEntity.max(candidates) };
  }

  /**
   * Aplica o corte aos capítulos, removendo (ou marcando como hidden) blocos além do limite.
   * Retorna lista de capítulos visíveis + flag `truncated_at` quando algum capítulo foi cortado.
   */
  static applyCut(chapters: BookChapter[], visibleUntil: CanonicalRef | null): {
    chapters: BookChapter[];
    truncatedAt?: string;
  } {
    if (!visibleUntil) return { chapters };

    const result: BookChapter[] = [];
    let truncatedAt: string | undefined;

    for (const ch of chapters) {
      // Capítulo todo além do limite — ignora
      if (ch.order > visibleUntil.chapter) {
        if (!truncatedAt) truncatedAt = `${visibleUntil.chapter}:${visibleUntil.paragraph ?? '∞'}`;
        continue;
      }

      // Capítulo anterior ao limite — passa inteiro
      if (ch.order < visibleUntil.chapter) {
        result.push(ch);
        continue;
      }

      // Capítulo == limite — corta blocos numerados que excedem o paragraph
      if (visibleUntil.paragraph === undefined) {
        // Permite o capítulo inteiro
        result.push(ch);
        continue;
      }

      const filtered: BookBlock[] = [];
      for (const b of ch.blocks) {
        const ref = CanonicalRefEntity.tryParse(b.ref);
        if (!ref) {
          // Heading/lista/código — passa se já estamos no capítulo certo
          filtered.push(b);
          continue;
        }
        if (CanonicalRefEntity.compare(ref, visibleUntil) <= 0) {
          filtered.push(b);
        } else {
          if (!truncatedAt) truncatedAt = CanonicalRefEntity.format(visibleUntil);
        }
      }
      result.push({ ...ch, blocks: filtered });
    }

    return { chapters: result, truncatedAt };
  }
}
