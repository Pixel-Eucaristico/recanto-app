import { MindMapTemplate, MindMapNode, MindMapEdge, MindMapState } from '@/domain/mind-maps/types';

export class MindMapEntity {
  static validateTemplate(t: Pick<MindMapTemplate, 'title' | 'nodes' | 'edges'>): string[] {
    const errors: string[] = [];
    if (!t.title?.trim() || t.title.trim().length < 3) errors.push('Título com no mínimo 3 caracteres.');
    const nodes = Object.values(t.nodes ?? {});
    if (nodes.length < 1) errors.push('Precisa de ao menos 1 nó raiz.');
    const roots = nodes.filter(n => n.is_root);
    if (roots.length === 0) errors.push('Marque um nó como raiz (is_root).');
    if (roots.length > 1) errors.push('Só pode haver UM nó raiz.');

    const nodeIds = new Set(nodes.map(n => n.id));
    Object.values(t.edges ?? {}).forEach((e, i) => {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
        errors.push(`Edge ${i + 1}: referência inválida (source/target inexistente).`);
      }
    });
    return errors;
  }

  static findRoot(nodes: Record<string, MindMapNode>): MindMapNode | null {
    return Object.values(nodes).find(n => n.is_root) ?? null;
  }

  /**
   * Clona um template para uso pelo aluno — mesmos nós/edges/posições,
   * mas IDs preservados para que edições do template possam ser aplicadas se desejado.
   */
  static cloneForStudent(template: MindMapTemplate): MindMapState {
    return {
      nodes: { ...template.nodes },
      edges: { ...template.edges },
      positions: { ...template.positions },
    };
  }
}
