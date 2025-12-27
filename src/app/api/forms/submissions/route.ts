import { NextResponse } from 'next/server';
import { formSubmissionService } from '@/services/firebase/FormSubmissionService';

/**
 * GET /api/forms/submissions
 * Get all form submissions (admin only)
 */
export async function GET() {
  try {
    // TODO: Add admin authentication check

    const submissions = await formSubmissionService.getRecentSubmissions(100);

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error getting submissions:', error);
    return NextResponse.json(
      { error: 'Failed to get submissions' },
      { status: 500 }
    );
  }
}
