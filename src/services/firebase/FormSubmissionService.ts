import { BaseFirebaseService } from './BaseFirebaseService';
import { FormSubmission, AdminEmailConfig } from '@/types/form-submissions';

class FormSubmissionService extends BaseFirebaseService<FormSubmission> {
  constructor() {
    super('form_submissions');
  }

  /**
   * Get submissions by type
   */
  async getByType(type: 'contact' | 'story'): Promise<FormSubmission[]> {
    return this.queryWithFilters([
      { field: 'type', operator: '==', value: type }
    ]);
  }

  /**
   * Get submissions by status
   */
  async getByStatus(status: FormSubmission['status']): Promise<FormSubmission[]> {
    return this.queryWithFilters([
      { field: 'status', operator: '==', value: status }
    ]);
  }

  /**
   * Get new (unread) submissions
   */
  async getNewSubmissions(): Promise<FormSubmission[]> {
    return this.getByStatus('new');
  }

  /**
   * Mark submission as read
   */
  async markAsRead(submissionId: string): Promise<void> {
    await this.update(submissionId, { status: 'read' });
  }

  /**
   * Mark submission as replied
   */
  async markAsReplied(submissionId: string, repliedBy: string): Promise<void> {
    await this.update(submissionId, {
      status: 'replied',
      replied_at: new Date().toISOString(),
      replied_by: repliedBy,
    });
  }

  /**
   * Add admin notes to submission
   */
  async addNotes(submissionId: string, notes: string): Promise<void> {
    await this.update(submissionId, { admin_notes: notes });
  }

  /**
   * Archive submission
   */
  async archive(submissionId: string): Promise<void> {
    await this.update(submissionId, { status: 'archived' });
  }

  /**
   * Get recent submissions (last 30 days)
   */
  async getRecentSubmissions(limit: number = 50): Promise<FormSubmission[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { collection, query, where, orderBy: firestoreOrderBy, limit: firestoreLimit, getDocs } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const collectionRef = collection(firestore, 'form_submissions');
    const q = query(
      collectionRef,
      where('submitted_at', '>=', thirtyDaysAgo.toISOString()),
      firestoreOrderBy('submitted_at', 'desc'),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FormSubmission);
  }
}

class AdminEmailConfigService {
  private configPath = 'config/admin_email';

  /**
   * Get admin email configuration
   */
  async getConfig(): Promise<AdminEmailConfig | null> {
    const { doc, getDoc } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const docRef = doc(firestore, this.configPath);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as AdminEmailConfig;
  }

  /**
   * Update admin email configuration
   */
  async updateConfig(config: Partial<AdminEmailConfig>, updatedBy: string): Promise<void> {
    const { doc, setDoc } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const docRef = doc(firestore, this.configPath);
    await setDoc(docRef, {
      ...config,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    }, { merge: true });
  }
}

export const formSubmissionService = new FormSubmissionService();
export const adminEmailConfigService = new AdminEmailConfigService();
export default formSubmissionService;
