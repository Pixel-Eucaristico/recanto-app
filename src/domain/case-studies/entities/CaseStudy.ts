import { CaseStudy, CaseNode } from '@/domain/case-studies/types';

export class CaseStudyEntity {
  static validate(cs: Pick<CaseStudy, 'title' | 'start_node_id' | 'nodes'>): string[] {
    const errors: string[] = [];
    if (!cs.title?.trim() || cs.title.trim().length < 3) errors.push('Título com no mínimo 3 caracteres.');
    if (!cs.start_node_id || !cs.nodes?.[cs.start_node_id]) errors.push('Nó de início inválido ou inexistente.');
    const nodes = cs.nodes ?? {};
    const ids = Object.keys(nodes);
    if (ids.length < 2) errors.push('Caso deve ter ao menos 2 nós.');

    // Valida choices
    for (const id of ids) {
      const node = nodes[id];
      if (!node.text?.trim()) errors.push(`Nó ${id}: texto vazio.`);
      if (node.choices && node.choices.length > 0) {
        node.choices.forEach((ch, i) => {
          if (!ch.label?.trim()) errors.push(`Nó ${id} escolha ${i + 1}: label vazio.`);
          if (!ch.next_node_id) errors.push(`Nó ${id} escolha ${i + 1}: sem destino.`);
          if (ch.next_node_id && !nodes[ch.next_node_id]) errors.push(`Nó ${id} escolha ${i + 1}: destino ${ch.next_node_id} não existe.`);
          if (ch.next_node_id === id) errors.push(`Nó ${id} escolha ${i + 1}: auto-loop proibido.`);
        });
      }
    }

    // Detecta nó inalcançável a partir do start (BFS)
    const start = cs.start_node_id;
    if (start && nodes[start]) {
      const visited = new Set<string>();
      const queue = [start];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        const node = nodes[cur];
        (node?.choices ?? []).forEach(ch => {
          if (ch.next_node_id && nodes[ch.next_node_id]) queue.push(ch.next_node_id);
        });
      }
      const orphans = ids.filter(id => !visited.has(id));
      if (orphans.length > 0) errors.push(`Nós inalcançáveis: ${orphans.join(', ')}.`);
    }

    return errors;
  }

  static isEnd(node: CaseNode | undefined): boolean {
    if (!node) return true;
    if (node.is_end) return true;
    return !node.choices || node.choices.length === 0;
  }

  static getChoice(node: CaseNode | undefined, choiceId: string) {
    return node?.choices?.find(c => c.id === choiceId);
  }
}
