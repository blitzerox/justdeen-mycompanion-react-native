// app/api/admin/populate-quran-cache/route.ts
// API endpoint to populate Quran cache
// This can be called from admin panel or run as one-time setup

export const runtime = 'edge';

import { populateAllQuranData, populatePopularChapters, getCacheStatus } from '@/lib/quran-api/populate-cache';

/**
 * GET - Check cache population status
 */
export async function GET(request: Request) {
  const env = process.env as any;
  const db = env.MOSQUES_DB;

  try {
    const status = await getCacheStatus(db);

    return Response.json({
      success: true,
      status,
      message: 'Cache status retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Populate Quran cache
 * Body: { type: 'all' | 'popular', includeTafsir: boolean }
 */
export async function POST(request: Request) {
  // TODO: Add authentication check here
  // const user = await authenticateUser(request);
  // if (!user || user.role !== 'super_admin') {
  //   return Response.json({ error: 'Unauthorized' }, { status: 403 });
  // }

  const env = process.env as any;
  const db = env.MOSQUES_DB;

  try {
    const body = await request.json().catch(() => ({}));
    const { type = 'popular', includeTafsir = true } = body;

    // For streaming progress updates, we could use Server-Sent Events
    // For now, we'll just do the operation and return when complete

    if (type === 'popular') {
      console.log('🚀 Starting popular chapters cache population...');
      await populatePopularChapters(db);
      
      return Response.json({
        success: true,
        message: 'Popular chapters cached successfully',
        cached: {
          chapters: 11,
          description: 'Most frequently read chapters',
        },
      });
    } else if (type === 'all') {
      console.log('🚀 Starting full Quran cache population...');
      
      // This will take 10-20 minutes, so we might want to run it as a background job
      // For now, we'll just start it and return
      
      // In a real production environment, you might want to:
      // 1. Use Cloudflare Durable Objects for state management
      // 2. Use Cloudflare Queues for background processing
      // 3. Or run this as a CLI script: `wrangler d1 execute` via Node.js
      
      await populateAllQuranData(db, {
        includeTafsir,
        concurrentChapters: 5,
      });

      const status = await getCacheStatus(db);

      return Response.json({
        success: true,
        message: 'Full Quran cache populated successfully',
        status,
      });
    } else {
      return Response.json(
        {
          success: false,
          error: 'Invalid type. Use "popular" or "all"',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error populating cache:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear Quran cache
 * Use with caution!
 */
export async function DELETE(request: Request) {
  // TODO: Add authentication check here
  // const user = await authenticateUser(request);
  // if (!user || user.role !== 'super_admin') {
  //   return Response.json({ error: 'Unauthorized' }, { status: 403 });
  // }

  const env = process.env as any;
  const db = env.MOSQUES_DB;

  try {
    const { clearQuranCache } = await import('@/lib/quran-api/populate-cache');
    await clearQuranCache(db);

    return Response.json({
      success: true,
      message: 'Quran cache cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
