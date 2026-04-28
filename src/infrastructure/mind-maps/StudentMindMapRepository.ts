import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { StudentMindMap } from '@/domain/mind-maps/types';

export interface IStudentMindMapRepository {
  findByUserAndTemplate(userId: string, templateId: string): Promise<StudentMindMap | null>;
  upsert(data: Omit<StudentMindMap, 'id'>): Promise<StudentMindMap>;
}

function docId(userId: string, templateId: string): string {
  return `${userId}_${templateId}`;
}

export class FirebaseStudentMindMapRepository implements IStudentMindMapRepository {
  private readonly collectionName = 'student_mind_maps';

  async findByUserAndTemplate(userId: string, templateId: string): Promise<StudentMindMap | null> {
    const snap = await getDoc(doc(db, this.collectionName, docId(userId, templateId)));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as StudentMindMap;
  }

  async upsert(data: Omit<StudentMindMap, 'id'>): Promise<StudentMindMap> {
    const id = docId(data.user_id, data.template_id);
    await setDoc(doc(db, this.collectionName, id), { ...data, updated_at: new Date().toISOString() }, { merge: true });
    return { id, ...data };
  }
}

export const studentMindMapRepository = new FirebaseStudentMindMapRepository();
