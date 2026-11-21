interface CircularScoreProps {
  score: number;
  maxScore?: 10 | 100;
  size?: number;
  label?: string;
}

export function getScoreTone(score: number, maxScore: 10 | 100 = 10) {
  const pct = (score / maxScore) * 100;
  if (pct >= 85) {
    return {
      stroke: '#34D399',
      track: 'rgba(52, 211, 153, 0.14)',
      text: 'text-emerald-300',
      rating: 'Excellent',
    };
  }
  if (pct >= 70) {
    return {
      stroke: '#38BDF8',
      track: 'rgba(56, 189, 248, 0.14)',
      text: 'text-sky-300',
      rating: 'Good',
    };
  }
  if (pct >= 50) {
    return {
      stroke: '#FBBF24',
      track: 'rgba(251, 191, 36, 0.14)',
      text: 'text-amber-300',
      rating: 'Average',
    };
  }
  if (pct >= 30) {
    return {
      stroke: '#FB923C',
      track: 'rgba(251, 146, 60, 0.14)',
      text: 'text-orange-300',
      rating: 'Needs Improvement',
    };
  }
  return {
    stroke: '#F87171',
    track: 'rgba(248, 113, 113, 0.14)',
    text: 'text-rose-300',
    rating: 'Poor',
  };
}

export function CircularScore({
  score,
  maxScore = 10,
  size = 112,
  label,
}: CircularScoreProps) {
  const clamped = Math.max(0, Math.min(maxScore, score));
  const strokeWidth = size >= 120 ? 10 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clamped / maxScore;
  const dashOffset = circumference * (1 - progress);
  const tone = getScoreTone(clamped, maxScore);

  return (
    <div className="flex flex-col items-center justify-center gap-2 shrink-0">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.track}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold tabular-nums leading-none ${
              size >= 120 ? 'text-3xl' : 'text-2xl'
            } text-white`}
          >
            {maxScore === 100 ? Math.round(clamped) : clamped}
          </span>
          <span className="text-xs font-mono tabular-nums text-slate-400 mt-1">
            /{maxScore}
          </span>
        </div>
      </div>
      <span className={`text-xs font-semibold tracking-wide ${tone.text}`}>
        {label || tone.rating}
      </span>
    </div>
  );
}
