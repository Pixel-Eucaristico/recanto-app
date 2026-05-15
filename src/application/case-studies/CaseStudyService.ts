import { caseStudyRepository, ICaseStudyRepository } from '@/infrastructure/case-studies/CaseStudyRepository';
import { caseRunRepository, ICaseRunRepository } from '@/infrastructure/case-studies/CaseRunRepository';
import { CaseStudyEntity } from '@/domain/case-studies/entities/CaseStudy';
import { CaseStudy, CaseRun, CaseStep } from '@/domain/case-studies/types';

export interface SubmitRunInput {
  userId: string;
  caseId: string;
  path: CaseStep[];
  endedAtNodeId: string;
}

export interface SubmitRunResult {
  run: CaseRun;
  persisted: boolean;
}

export class CaseStudyService {
  constructor(
    private readonly caseRepo: ICaseStudyRepository = caseStudyRepository,
    private readonly runRepo: ICaseRunRepository = caseRunRepository,
  ) {}

  async getByLesson(lessonId: string): Promise<CaseStudy | null> {
    return this.caseRepo.findByLesson(lessonId);
  }

  async getById(id: string): Promise<CaseStudy | null> {
    return this.caseRepo.findById(id);
  }

  /**
   * 1ª travessia persiste pro formador/caderno; retakes só retornam o primeiro run.
   */
  async submitRun(input: SubmitRunInput): Promise<SubmitRunResult> {
    const cs = await this.caseRepo.findById(input.caseId);
    if (!cs) throw new Error('Caso não encontrado.');

    const existing = await this.runRepo.findByUserAndCase(input.userId, input.caseId);
    if (existing.length > 0) {
      return { run: existing[0], persisted: false };
    }

    const run = await this.runRepo.create({
      user_id: input.userId,
      case_id: input.caseId,
      lesson_id: cs.lesson_id,
      path: input.path,
      ended_at_node_id: input.endedAtNodeId,
      run_at: new Date().toISOString(),
    });
    return { run, persisted: true };
  }

  async hasRun(userId: string, caseId: string): Promise<boolean> {
    const existing = await this.runRepo.findByUserAndCase(userId, caseId);
    return existing.length > 0;
  }

  async save(cs: CaseStudy | (Omit<CaseStudy, 'id'> & { id?: string })): Promise<CaseStudy> {
    const errors = CaseStudyEntity.validate(cs);
    if (errors.length > 0) throw new Error(errors.join(' '));
    if ('id' in cs && cs.id) {
      const { id, ...rest } = cs as CaseStudy;
      const updated = await this.caseRepo.update(id, rest);
      if (!updated) throw new Error('Falha ao atualizar caso.');
      return updated;
    }
    return this.caseRepo.create(cs as Omit<CaseStudy, 'id'>);
  }

  async remove(id: string): Promise<void> {
    return this.caseRepo.remove(id);
  }
}

export const caseStudyService = new CaseStudyService();
