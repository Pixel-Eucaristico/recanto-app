import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MainPageContent } from '@/types/main-content';

const CONTENT_PATH = path.join(process.cwd(), 'repositor', 'main-content.json');

/**
 * GET /api/main-content
 * Returns the main page content from JSON file
 */
export async function GET() {
  try {
    const fileContent = await fs.readFile(CONTENT_PATH, 'utf-8');
    const content: MainPageContent = JSON.parse(fileContent);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error reading main content:', error);
    return NextResponse.json(
      { error: 'Failed to load main content' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/main-content
 * Updates the main page content in JSON file
 * Admin only - requires authentication check
 */
export async function PUT(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // Verify user is admin before allowing updates

    const body = await request.json();

    // Validate structure
    if (!body.communityFeedbacks || !body.projects || !body.evangelization) {
      return NextResponse.json(
        { error: 'Invalid content structure' },
        { status: 400 }
      );
    }

    // Write to file with pretty formatting
    await fs.writeFile(
      CONTENT_PATH,
      JSON.stringify(body, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating main content:', error);
    return NextResponse.json(
      { error: 'Failed to update main content' },
      { status: 500 }
    );
  }
}
