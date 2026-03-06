import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'result';

  if (type === 'invite') {
    return generateInviteOG(searchParams);
  }

  return generateResultOG(searchParams);
}

function generateResultOG(params: URLSearchParams) {
  const score = params.get('score') ?? '0';
  const streak = params.get('streak') ?? '0';
  const name = params.get('name') ?? 'Player';
  const avatar = params.get('avatar') ?? '\u{1F9E0}';
  const difficulty = params.get('difficulty') ?? 'normal';
  const day = params.get('day') ?? '0';

  const diffLabel =
    difficulty === 'expert' ? 'Expert' : difficulty === 'hard' ? 'Hard' : 'Normal';
  const diffColor =
    difficulty === 'expert' ? '#FF6B6B' : difficulty === 'hard' ? '#FFD700' : '#06D6A0';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0E1A 0%, #0F1629 50%, #1A1F35 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '40px' }}>{'\u{1F9E0}'}</span>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            WikiWager
          </span>
          <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '8px' }}>
            Day #{day}
          </span>
        </div>

        {/* User info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1A1F35, #252B45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(124, 58, 237, 0.4)',
            }}
          >
            <span style={{ fontSize: '32px' }}>{avatar}</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 600, color: '#F0F0F5' }}>
            {name}
          </span>
        </div>

        {/* Score */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: '72px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FFD700, #FBBF24)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.1,
            }}
          >
            {Number(score).toLocaleString()}
          </span>
          <span
            style={{
              fontSize: '14px',
              color: '#6B7280',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}
          >
            points
          </span>
        </div>

        {/* Streak + Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'rgba(6, 214, 160, 0.1)',
            }}
          >
            <span style={{ fontSize: '20px' }}>{'\u{1F525}'}</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#06D6A0' }}>
              {streak} streak
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: `${diffColor}15`,
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: diffColor }}>
              {diffLabel}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

function generateInviteOG(params: URLSearchParams) {
  const name = params.get('name') ?? 'A friend';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0E1A 0%, #0F1629 50%, #1A1F35 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <span style={{ fontSize: '48px' }}>{'\u{1F9E0}'}</span>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            WikiWager
          </span>
        </div>

        {/* Invite text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#F0F0F5',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {name} invited you!
          </span>
          <span style={{ fontSize: '24px', color: '#6B7280', textAlign: 'center' }}>
            The Daily Wikipedia Trivia Game
          </span>
        </div>

        {/* Free guesses badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(52, 211, 153, 0.15))',
            border: '1px solid rgba(6, 214, 160, 0.3)',
          }}
        >
          <span style={{ fontSize: '24px' }}>{'\u{1F381}'}</span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#06D6A0' }}>
            Get 2 free guesses
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
