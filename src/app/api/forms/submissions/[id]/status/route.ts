import { NextRequest, NextResponse } from 'next/server';
import { formSubmissionService } from '@/services/firebase/FormSubmissionService';

/**
 * PUT /api/forms/submissions/[id]/status
 * Update submission status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check

    const { status } = await request.json();
    const submissionId = params.id;

    if (status === 'read') {
      await formSubmissionService.markAsRead(submissionId);
    } else if (status === 'replied') {
      await formSubmissionService.markAsReplied(submissionId, 'admin');
    } else if (status === 'archived') {
      await formSubmissionService.archive(submissionId);
    } else {
      await formSubmissionService.update(submissionId, { status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { error: 'Failed to update submission status' },
      { status: 500 }
    );
  }
}
