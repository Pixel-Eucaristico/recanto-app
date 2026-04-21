import { quizRepository, IQuizRepository } from '@/infrastructure/quiz/QuizRepository';
import { attemptRepository, IAttemptRepository } from '@/infrastructure/quiz/AttemptRepository';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { QuizAttemptEntity, ScoreResult } from '@/domain/quiz/entities/QuizAttempt';
import { Quiz, QuizAttempt, ShuffledQuiz } from '@/domain/quiz/types';

export interface SubmitAttemptInput {
  userId: string;
  quizId: string;
  answers: Record<string, string>;
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

  async submit(input: SubmitAttemptInput): Promise<SubmitAttemptResult> {
    const quiz = await this.quizRepo.findById(input.quizId);
    if (!quiz) throw new Error('Quiz não encontrado.');

    const scoreDetail = QuizAttemptEntity.score(quiz, input.answers);
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
    return { attempt, scoreDetail };
  }

  async hasPassed(userId: string, quizId: string): Promise<boolean> {
    const latest = await this.attemptRepo.findLatestPassed(userId, quizId);
    return latest !== null;
  }

  async listUserAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.attemptRepo.findByUserAndQuiz(userId, quizId);
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
