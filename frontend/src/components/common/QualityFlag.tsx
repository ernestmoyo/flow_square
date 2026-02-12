import { QUALITY_FLAGS } from '../../utils/constants';

interface QualityFlagProps {
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
  showLabel?: boolean;
}

export default function QualityFlag({ quality, showLabel = true }: QualityFlagProps) {
  const config = QUALITY_FLAGS[quality];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {showLabel && <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>}
    </span>
  );
}
