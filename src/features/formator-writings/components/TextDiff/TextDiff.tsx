'use client';

import { useMemo } from 'react';

interface TextDiffProps {
  /** Versão mais antiga. */
  before: string;
  /** Versão mais recente. */
  after: string;
}

type Op = 'equal' | 'added' | 'removed';
interface Chunk { op: Op; text: string }

/**
 * Diff de texto por palavra, renderizado de forma legível.
 *
 * Existe pra substituir o dump de JSON: quem lê é formador/pastoral, não
 * desenvolvedor. Sem dependência externa — LCS simples basta pro tamanho dos
 * escritos (reflexões e posts, não arquivos).
 */
export function TextDiff({ before, after }: TextDiffProps) {
  const chunks = useMemo(() => diffWords(before, after), [before, after]);

  const unchanged = chunks.every(c => c.op === 'equal');
  if (unchanged) {
    return (
      <p className="text-xs text-base-content/50 italic">
        Nenhuma mudança de texto nesta edição.
      </p>
    );
  }

  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">
      {chunks.map((c, i) => {
        if (c.op === 'added') {
          return (
            <mark key={i} className="bg-success/15 text-base-content rounded px-0.5">
              {c.text}
            </mark>
          );
        }
        if (c.op === 'removed') {
          return (
            <del key={i} className="bg-error/15 text-base-content/70 rounded px-0.5 no-underline line-through">
              {c.text}
            </del>
          );
        }
        return <span key={i}>{c.text}</span>;
      })}
    </p>
  );
}

/** Quebra preservando os separadores, pra reconstruir o texto sem perder espaçamento. */
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter(t => t.length > 0);
}

function diffWords(before: string, after: string): Chunk[] {
  const a = tokenize(before);
  const b = tokenize(after);

  // Matriz LCS. Escritos são curtos; O(n*m) é aceitável aqui.
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const raw: Chunk[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      raw.push({ op: 'equal', text: a[i] });
      i++; j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      raw.push({ op: 'removed', text: a[i] });
      i++;
    } else {
      raw.push({ op: 'added', text: b[j] });
      j++;
    }
  }
  while (i < a.length) raw.push({ op: 'removed', text: a[i++] });
  while (j < b.length) raw.push({ op: 'added', text: b[j++] });

  // Junta tokens vizinhos de mesma operação — menos elementos, menos ruído visual.
  return raw.reduce<Chunk[]>((acc, chunk) => {
    const last = acc[acc.length - 1];
    if (last && last.op === chunk.op) last.text += chunk.text;
    else acc.push({ ...chunk });
    return acc;
  }, []);
}
