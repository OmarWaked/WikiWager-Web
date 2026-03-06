import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Generate cryptographically secure seed
    const seed = crypto.randomBytes(32).toString('hex');

    // Select 200 least-recently-used pages from wiki_pages
    const { data: pages, error: pagesError } = await serviceClient
      .from('wiki_pages')
      .select('id')
      .order('last_used', { ascending: true, nullsFirst: true })
      .limit(200);

    if (pagesError || !pages || pages.length === 0) {
      return NextResponse.json({ error: 'No pages available in pool' }, { status: 500 });
    }

    const pageIds = pages.map(p => p.id);

    // Insert daily seed
    const { error: seedError } = await serviceClient
      .from('daily_seeds')
      .upsert({
        date: today,
        seed,
        page_pool: pageIds,
        created_at: new Date().toISOString(),
      });

    if (seedError) {
      console.error('Failed to insert daily seed:', seedError);
      return NextResponse.json({ error: 'Failed to create daily seed' }, { status: 500 });
    }

    // Update last_used on selected pages
    const { error: updateError } = await serviceClient
      .from('wiki_pages')
      .update({ last_used: new Date().toISOString() })
      .in('id', pageIds);

    if (updateError) {
      console.error('Failed to update last_used:', updateError);
    }

    return NextResponse.json({
      success: true,
      date: today,
      pageCount: pageIds.length,
    });
  } catch (err) {
    console.error('Error in cron/daily-seed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
