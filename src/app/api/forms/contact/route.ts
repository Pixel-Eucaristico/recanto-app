import { NextRequest, NextResponse } from 'next/server';
import { formSubmissionService } from '@/services/firebase/FormSubmissionService';
import { adminEmailConfigService } from '@/services/firebase/FormSubmissionService';
import { gmailService } from '@/services/gmail/GmailService';
import { ContactFormData } from '@/types/form-submissions';

/**
 * POST /api/forms/contact
 * Submit contact form
 */
export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create submission in Firestore
    const submission = await formSubmissionService.create({
      type: 'contact',
      data: formData,
      submitted_at: new Date().toISOString(),
      status: 'new',
    });

    // Try to send email notification (don't fail if it doesn't work)
    try {
      const config = await adminEmailConfigService.getConfig();

      if (config && config.notify_on_contact && config.email) {
        // Get Gmail access token from environment or OAuth2 flow
        const accessToken = process.env.GMAIL_ACCESS_TOKEN;

        if (accessToken) {
          gmailService.setAccessToken(accessToken);
          await gmailService.sendContactFormNotification(config.email, formData);
        }
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue - submission was saved successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      id: submission.id,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
