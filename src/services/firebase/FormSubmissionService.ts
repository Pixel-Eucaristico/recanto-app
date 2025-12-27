import { FormSubmission, AdminEmailConfig } from '@/types/form-submissions';
import { firestore } from '@/domains/auth/services/firebaseAdmin';

/**
 * Service to handle form submissions using Firebase Admin SDK (Server-Side)
 */
class FormSubmissionService {
  private collectionName = 'form_submissions';

  /**
   * Create a new submission
   */
  async create(data: Omit<FormSubmission, 'id'>): Promise<FormSubmission> {
    const collectionRef = firestore.collection(this.collectionName);
    const docRef = collectionRef.doc();
    
    // Remove undefined values
    const cleanData = JSON.parse(JSON.stringify(data));
    
    const dataWithId = {
      ...cleanData,
      id: docRef.id,
      created_at: new Date().toISOString()
    };

    await docRef.set(dataWithId);
    return dataWithId;
  }

  /**
   * Get submissions by type
   */
  async getByType(type: 'contact' | 'story'): Promise<FormSubmission[]> {
    const snapshot = await firestore
      .collection(this.collectionName)
      .where('type', '==', type)
      .get();
      
    return snapshot.docs.map(doc => doc.data() as FormSubmission);
  }

  /**
   * Get submissions by status
   */
  async getByStatus(status: FormSubmission['status']): Promise<FormSubmission[]> {
    const snapshot = await firestore
      .collection(this.collectionName)
      .where('status', '==', status)
      .get();
      
    return snapshot.docs.map(doc => doc.data() as FormSubmission);
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
   * Helper to update document
   */
  private async update(id: string, data: Partial<FormSubmission>): Promise<void> {
    await firestore.collection(this.collectionName).doc(id).update({
      ...data,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get recent submissions (last 30 days)
   */
  async getRecentSubmissions(limit: number = 50): Promise<FormSubmission[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await firestore
      .collection(this.collectionName)
      .where('submitted_at', '>=', thirtyDaysAgo.toISOString())
      .orderBy('submitted_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as FormSubmission);
  }
}

class AdminEmailConfigService {
  private configPath = 'config/admin_email';

  /**
   * Get admin email configuration
   */
  async getConfig(): Promise<AdminEmailConfig | null> {
    // Split path into collection/doc
    const docRef = firestore.doc(this.configPath);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as AdminEmailConfig;
  }

  /**
   * Update admin email configuration
   */
  async updateConfig(config: Partial<AdminEmailConfig>, updatedBy: string): Promise<void> {
    const docRef = firestore.doc(this.configPath);
    
    await docRef.set({
      ...config,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    }, { merge: true });
  }
}

export const formSubmissionService = new FormSubmissionService();
export const adminEmailConfigService = new AdminEmailConfigService();
export default formSubmissionService;
