import { quizRepository, IQuizRepository } from '@/infrastructure/quiz/QuizRepository';
import { attemptRepository, IAttemptRepository } from '@/infrastructure/quiz/AttemptRepository';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { QuizAttemptEntity, ScoreResult } from '@/domain/quiz/entities/QuizAttempt';
import { Quiz, QuizAttempt, QuestionAnswer, ShuffledQuiz } from '@/domain/quiz/types';

export interface SubmitAttemptInput {
  userId: string;
  quizId: string;
  answers: Record<string, QuestionAnswer>;
  questionOrder: string[];
}

export interface SubmitAttemptResult {
  attempt: QuizAttempt;
  scoreDetail: ScoreResult;
}

export class QuizService {
  constructor(
    private readonly quizRepo: IQuizRepository = quizRepository,
    private readonly attemptRepo: IAttemptRepository = attemptRepository,
  ) {}

  /**
   * Busca o quiz da aula com perguntas e opções EMBARALHADAS.
   * Perguntas randomizadas a cada chamada (nova tentativa = nova ordem).
   */
  async getShuffledForLesson(lessonId: string): Promise<ShuffledQuiz | null> {
    const quiz = await this.quizRepo.findByLesson(lessonId);
    if (!quiz) return null;
    return QuizEntity.shuffleForAttempt(quiz);
  }

  async getById(id: string): Promise<Quiz | null> {
    return this.quizRepo.findById(id);
  }

  async getShuffled(id: string): Promise<ShuffledQuiz | null> {
    const quiz = await this.quizRepo.findById(id);
    if (!quiz) return null;
    return QuizEntity.shuffleForAttempt(quiz);
  }

  /**
   * Submete tentativa. Apenas a PRIMEIRA tentativa do usuário é persistida
   * (registro histórico para o formador + entrada no caderno). Retakes são
   * recalculados runtime e retornam score sem gravar em `quiz_attempts`.
   */
  async submit(input: SubmitAttemptInput): Promise<SubmitAttemptResult & { persisted: boolean }> {
    const quiz = await this.quizRepo.findById(input.quizId);
    if (!quiz) throw new Error('Quiz não encontrado.');

    const scoreDetail = QuizAttemptEntity.score(quiz, input.answers);

    const existing = await this.attemptRepo.findByUserAndQuiz(input.userId, input.quizId);
    if (existing.length > 0) {
      // Retake — não persiste, retorna a tentativa original + score da nova rodada
      return { attempt: existing[0], scoreDetail, persisted: false };
    }

    const attemptData = QuizAttemptEntity.fromScore(
      {
        user_id: input.userId,
        quiz_id: input.quizId,
        lesson_id: quiz.lesson_id,
        answers: input.answers,
        question_order: input.questionOrder,
      },
      scoreDetail,
    );
    const attempt = await this.attemptRepo.create(attemptData);
    return { attempt, scoreDetail, persisted: true };
  }

  async hasAttempted(userId: string, quizId: string): Promise<boolean> {
    const existing = await this.attemptRepo.findByUserAndQuiz(userId, quizId);
    return existing.length > 0;
  }

  async hasPassed(userId: string, quizId: string): Promise<boolean> {
    const latest = await this.attemptRepo.findLatestPassed(userId, quizId);
    return latest !== null;
  }

  async listUserAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.attemptRepo.findByUserAndQuiz(userId, quizId);
  }

  /** Última tentativa salva + scoreDetail reconstruído. Pra mostrar resultado ao reabrir. */
  async getLatestResult(userId: string, quizId: string): Promise<{ attempt: QuizAttempt; scoreDetail: ScoreResult } | null> {
    const attempts = await this.attemptRepo.findByUserAndQuiz(userId, quizId);
    if (attempts.length === 0) return null;
    const latest = attempts.sort((a, b) => b.attempted_at.localeCompare(a.attempted_at))[0];
    const quiz = await this.quizRepo.findById(quizId);
    if (!quiz) return null;
    const scoreDetail = QuizAttemptEntity.score(quiz, latest.answers);
    return { attempt: latest, scoreDetail };
  }

  async save(quiz: Quiz | (Omit<Quiz, 'id'> & { id?: string })): Promise<Quiz> {
    const validation = QuizEntity.validate(quiz);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    if ('id' in quiz && quiz.id) {
      const { id, ...rest } = quiz as Quiz;
      const updated = await this.quizRepo.update(id, rest);
      if (!updated) throw new Error('Falha ao atualizar quiz.');
      return updated;
    }
    return this.quizRepo.create(quiz as Omit<Quiz, 'id'>);
  }

  async remove(id: string): Promise<void> {
    return this.quizRepo.remove(id);
  }
}

export const quizService = new QuizService();
