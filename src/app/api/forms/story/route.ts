import { NextRequest, NextResponse } from 'next/server';
import { formSubmissionService } from '@/services/firebase/FormSubmissionService';
import { adminEmailConfigService } from '@/services/firebase/FormSubmissionService';
import { gmailService } from '@/services/gmail/GmailService';
import { StoryFormData } from '@/types/form-submissions';

/**
 * POST /api/forms/story
 * Submit story form
 */
export async function POST(request: NextRequest) {
  try {
    const formData: StoryFormData = await request.json();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.story || formData.consent === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create submission in Firestore
    const submission = await formSubmissionService.create({
      type: 'story',
      data: formData,
      submitted_at: new Date().toISOString(),
      status: 'new',
    });

    // Try to send email notification (don't fail if it doesn't work)
    try {
      const config = await adminEmailConfigService.getConfig();

      if (config && config.notify_on_story && config.email) {
        // Get Gmail access token from environment or OAuth2 flow
        const accessToken = process.env.GMAIL_ACCESS_TOKEN;

        if (accessToken) {
          gmailService.setAccessToken(accessToken);
          await gmailService.sendStoryFormNotification(config.email, formData);
        }
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue - submission was saved successfully
    }

    return NextResponse.json({
      success: true,
      message: 'História enviada com sucesso!',
      id: submission.id,
    });
  } catch (error) {
    console.error('Error submitting story form:', error);
    return NextResponse.json(
      { error: 'Failed to submit story form' },
      { status: 500 }
    );
  }
}
