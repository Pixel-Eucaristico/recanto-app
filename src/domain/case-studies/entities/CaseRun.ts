import { CaseStep } from '@/domain/case-studies/types';

export class CaseRunEntity {
  static initial(caseId: string, userId: string, lessonId: string, startNodeId: string) {
    return {
      user_id: userId,
      case_id: caseId,
      lesson_id: lessonId,
      path: [{ node_id: startNodeId }] as CaseStep[],
      ended_at_node_id: startNodeId,
      run_at: new Date().toISOString(),
    };
  }

  static withChoice(path: CaseStep[], nodeId: string, choiceId: string, nextNodeId: string): CaseStep[] {
    const updated = [...path];
    const last = updated[updated.length - 1];
    if (last && last.node_id === nodeId) {
      updated[updated.length - 1] = { node_id: nodeId, choice_id: choiceId };
    }
    updated.push({ node_id: nextNodeId });
    return updated;
  }
}
