interface FraudScoreGaugeProps {
  score: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score < 25) return 'text-green-500';
  if (score < 50) return 'text-yellow-500';
  if (score < 75) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score < 25) return 'bg-green-500';
  if (score < 50) return 'bg-yellow-500';
  if (score < 75) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score < 25) return 'Low Risk';
  if (score < 50) return 'Medium Risk';
  if (score < 75) return 'High Risk';
  return 'Critical Risk';
}

export default function FraudScoreGauge({ score, label }: FraudScoreGaugeProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${score * 2.51} 251`}
            className={getScoreColor(score)}
          />
        </svg>
        <span className={`absolute text-xl font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${getScoreBg(score)}`}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
