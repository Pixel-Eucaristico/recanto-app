import { NextRequest, NextResponse } from 'next/server';
import { adminEmailConfigService } from '@/services/firebase/FormSubmissionService';

export const dynamic = 'force-dynamic';


/**
 * GET /api/admin/email-config
 * Get admin email configuration
 */
export async function GET() {
  try {
    // TODO: Add admin authentication check

    const config = await adminEmailConfigService.getConfig();

    if (!config) {
      return NextResponse.json({
        email: '',
        name: '',
        notify_on_contact: true,
        notify_on_story: true,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting email config:', error);
    return NextResponse.json(
      { error: 'Failed to get email config' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/email-config
 * Update admin email configuration
 */
export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const updatedBy = 'admin'; // Get from auth session

    const config = await request.json();

    await adminEmailConfigService.updateConfig(config, updatedBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email config:', error);
    return NextResponse.json(
      { error: 'Failed to update email config' },
      { status: 500 }
    );
  }
}
