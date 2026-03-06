import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { DIFFICULTIES, Difficulty } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const roundNumber = body.roundNumber as number;
    const difficulty: Difficulty = body.difficulty || 'normal';

    if (typeof roundNumber !== 'number' || roundNumber < 0) {
      return NextResponse.json({ error: 'Invalid round number' }, { status: 400 });
    }

    if (!(difficulty in DIFFICULTIES)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
    }

    const optionCount = DIFFICULTIES[difficulty].options;
    const serviceClient = await createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Get today's daily seed
    const { data: seedData, error: seedError } = await serviceClient
      .from('daily_seeds')
      .select('seed, page_pool')
      .eq('date', today)
      .single();

    if (seedError || !seedData) {
      return NextResponse.json({ error: 'Daily seed not ready' }, { status: 404 });
    }

    const dailySeed: string = seedData.seed;
    const pagePool: string[] = seedData.page_pool;

    // Compute deterministic user seed
    const userSeed = crypto
      .createHash('sha256')
      .update(`${dailySeed}-${userId}-${roundNumber}`)
      .digest('hex');

    // Select page indices deterministically
    const indices: number[] = [];
    // idx0 = current page (the one whose views we're guessing)
    // idx1..idxN = the option pages
    const totalPagesNeeded = 1 + optionCount; // currentPage + options

    for (let i = 0; i < totalPagesNeeded; i++) {
      const substringStart = i * 8;
      let idx = parseInt(userSeed.substring(substringStart, substringStart + 8), 16) % pagePool.length;

      // Ensure no duplicate indices
      while (indices.includes(idx)) {
        idx = (idx + 1) % pagePool.length;
      }
      indices.push(idx);
    }

    // Determine correct answer position among options (not the current page)
    const correctOptionIndex = parseInt(userSeed.substring(totalPagesNeeded * 8, totalPagesNeeded * 8 + 2), 16) % optionCount;
    const correctPageId = pagePool[indices[1 + correctOptionIndex]]; // offset by 1 since index 0 is currentPage

    // Fetch WikiPage data for all selected pages
    const selectedPageIds = indices.map(idx => pagePool[idx]);
    const { data: pages, error: pagesError } = await serviceClient
      .from('wiki_pages')
      .select('id, title, extract, thumbnail, description')
      .in('id', selectedPageIds);

    if (pagesError || !pages || pages.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch page data' }, { status: 500 });
    }

    // Build a lookup map
    const pageMap = new Map(pages.map(p => [p.id, p]));

    const currentPage = pageMap.get(selectedPageIds[0]);
    const options = selectedPageIds.slice(1).map(id => pageMap.get(id)).filter(Boolean);

    if (!currentPage || options.length !== optionCount) {
      return NextResponse.json({ error: 'Failed to resolve all pages' }, { status: 500 });
    }

    // Store correct answer in game_answers table (NEVER sent to client)
    const { error: answerError } = await serviceClient
      .from('game_answers')
      .upsert({
        id: `${userId}-${today}-${roundNumber}`,
        user_id: userId,
        date: today,
        round_number: roundNumber,
        correct_page_id: correctPageId,
        current_page_id: selectedPageIds[0],
        options: selectedPageIds.slice(1),
        difficulty,
        created_at: new Date().toISOString(),
      });

    if (answerError) {
      return NextResponse.json({ error: 'Failed to store round data' }, { status: 500 });
    }

    return NextResponse.json({
      currentPage,
      options,
      roundNumber,
    });
  } catch (err) {
    console.error('Error in game/round:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
