import { BaseFirebaseService } from './BaseFirebaseService';
import { ForumTopic, ForumPost } from '@/types/firebase-entities';

class ForumTopicService extends BaseFirebaseService<ForumTopic> {
  constructor() {
    super('forum_topics');
  }

  /**
   * Busca tópicos fixados
   */
  async getPinnedTopics(): Promise<ForumTopic[]> {
    return this.queryByField('is_pinned', true);
  }

  /**
   * Busca tópicos por categoria
   */
  async getTopicsByCategory(category: string): Promise<ForumTopic[]> {
    return this.queryByField('category', category);
  }

  /**
   * Busca tópicos criados por usuário
   */
  async getTopicsByUser(userId: string): Promise<ForumTopic[]> {
    return this.queryByField('created_by', userId);
  }

  /**
   * Fixa/desfixa um tópico
   */
  async togglePin(topicId: string, isPinned: boolean): Promise<ForumTopic | null> {
    return this.update(topicId, { is_pinned: isPinned } as Partial<ForumTopic>);
  }

  /**
   * Bloqueia/desbloqueia um tópico
   */
  async toggleLock(topicId: string, isLocked: boolean): Promise<ForumTopic | null> {
    return this.update(topicId, { is_locked: isLocked } as Partial<ForumTopic>);
  }
}

class ForumPostService extends BaseFirebaseService<ForumPost> {
  constructor() {
    super('forum_posts');
  }

  /**
   * Busca posts de um tópico
   */
  async getPostsByTopic(topicId: string): Promise<ForumPost[]> {
    return this.queryByField('topic_id', topicId);
  }

  /**
   * Busca posts criados por usuário
   */
  async getPostsByUser(userId: string): Promise<ForumPost[]> {
    return this.queryByField('created_by', userId);
  }

  /**
   * Busca posts pendentes de aprovação
   */
  async getPendingPosts(): Promise<ForumPost[]> {
    return this.queryByField('is_approved', false);
  }

  /**
   * Aprova um post
   */
  async approvePost(postId: string): Promise<ForumPost | null> {
    return this.update(postId, { is_approved: true } as Partial<ForumPost>);
  }

  /**
   * Reprova um post
   */
  async rejectPost(postId: string): Promise<void> {
    await this.delete(postId);
  }
}

export const forumTopicService = new ForumTopicService();
export const forumPostService = new ForumPostService();
