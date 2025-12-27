/**
 * Types for Form Submissions
 * Stores contact form and story submissions from public pages
 */

export type FormType = 'contact' | 'story';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface StoryFormData {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  city?: string;
  story: string;
  consent: boolean; // Consentimento para compartilhar história
}

export interface FormSubmission {
  id: string;
  type: FormType;
  data: ContactFormData | StoryFormData;
  submitted_at: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes?: string;
  replied_at?: string;
  replied_by?: string;
}

export interface AdminEmailConfig {
  email: string;
  name: string;
  notify_on_contact: boolean;
  notify_on_story: boolean;
  updated_at: string;
  updated_by: string;
  provider?: 'gmail' | 'smtp';
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure?: boolean;
  };
}
