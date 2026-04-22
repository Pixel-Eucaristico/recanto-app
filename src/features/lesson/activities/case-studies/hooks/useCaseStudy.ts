'use client';

import { useCallback, useEffect, useState } from 'react';
import { caseStudyService } from '@/application/case-studies/CaseStudyService';
import { CaseStudy, CaseStep } from '@/domain/case-studies/types';
import { CaseStudyEntity } from '@/domain/case-studies/entities/CaseStudy';
import { CaseRunEntity } from '@/domain/case-studies/entities/CaseRun';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface UseCaseStudyInput {
  lessonId?: string | null;
  caseId?: string | null;
}

export function useCaseStudy({ lessonId, caseId }: UseCaseStudyInput) {
  const user = useCurrentUser();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [path, setPath] = useState<CaseStep[]>([]);
  const [loading, setLoading] = useState<boolean>(!!(lessonId || caseId));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ persisted: boolean } | null>(null);
  const [alreadyRun, setAlreadyRun] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId && !caseId) return;
    try {
      setLoading(true);
      setError(null);
      const cs = lessonId
        ? await caseStudyService.getByLesson(lessonId)
        : caseId
        ? await caseStudyService.getById(caseId)
        : null;
      setCaseStudy(cs);
      if (cs) {
        setCurrentNodeId(cs.start_node_id);
        setPath([{ node_id: cs.start_node_id }]);
        if (user) setAlreadyRun(await caseStudyService.hasRun(user.id, cs.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, caseId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const choose = useCallback((choiceId: string) => {
    if (!caseStudy || !currentNodeId) return;
    const node = caseStudy.nodes[currentNodeId];
    const choice = CaseStudyEntity.getChoice(node, choiceId);
    if (!choice) return;
    const nextPath = CaseRunEntity.withChoice(path, currentNodeId, choiceId, choice.next_node_id);
    setPath(nextPath);
    setCurrentNodeId(choice.next_node_id);
  }, [caseStudy, currentNodeId, path]);

  const finish = useCallback(async () => {
    if (!caseStudy || !user || !currentNodeId) return null;
    setSubmitting(true);
    setError(null);
    try {
      const res = await caseStudyService.submitRun({
        userId: user.id,
        caseId: caseStudy.id,
        path,
        endedAtNodeId: currentNodeId,
      });
      setResult({ persisted: res.persisted });
      if (res.persisted) setAlreadyRun(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [caseStudy, user, currentNodeId, path]);

  const restart = useCallback(() => {
    if (!caseStudy) return;
    setCurrentNodeId(caseStudy.start_node_id);
    setPath([{ node_id: caseStudy.start_node_id }]);
    setResult(null);
  }, [caseStudy]);

  const currentNode = caseStudy && currentNodeId ? caseStudy.nodes[currentNodeId] : null;
  const isEnd = CaseStudyEntity.isEnd(currentNode ?? undefined);

  return {
    caseStudy,
    currentNode,
    currentNodeId,
    path,
    isEnd,
    alreadyRun,
    loading,
    error,
    submitting,
    result,
    choose,
    finish,
    restart,
  };
}
