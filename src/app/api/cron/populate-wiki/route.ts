import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Fetch 50 random pages from Wikipedia API
    const randomUrl = new URL('https://en.wikipedia.org/w/api.php');
    randomUrl.searchParams.set('action', 'query');
    randomUrl.searchParams.set('list', 'random');
    randomUrl.searchParams.set('rnnamespace', '0');
    randomUrl.searchParams.set('rnlimit', '50');
    randomUrl.searchParams.set('format', 'json');

    const randomRes = await fetch(randomUrl.toString());
    if (!randomRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch random pages from Wikipedia' }, { status: 502 });
    }

    const randomData = await randomRes.json() as any;
    const pages = randomData.query?.random;

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'No pages returned from Wikipedia' }, { status: 502 });
    }

    let addedCount = 0;

    // For each page, fetch summary and upsert into wiki_pages
    for (const page of pages) {
      try {
        const summaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`,
          { headers: { 'User-Agent': 'WikiWager/1.0 (https://wikiwager.vercel.app)' } }
        );

        if (!summaryRes.ok) continue;

        const summary = await summaryRes.json() as any;

        // Only include standard articles with an extract
        if (summary.type !== 'standard' || !summary.extract) continue;

        const { error: upsertError } = await serviceClient
          .from('wiki_pages')
          .upsert({
            id: String(page.id),
            title: page.title,
            extract: summary.extract.substring(0, 300),
            thumbnail: summary.thumbnail?.source || null,
            description: summary.description || null,
            last_used: null,
            added_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (!upsertError) {
          addedCount++;
        } else {
          console.error(`Failed to upsert page ${page.id}:`, upsertError);
        }
      } catch (pageErr) {
        console.error(`Failed to process page "${page.title}":`, pageErr);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      pagesAdded: addedCount,
      pagesAttempted: pages.length,
    });
  } catch (err) {
    console.error('Error in cron/populate-wiki:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
