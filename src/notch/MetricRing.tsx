interface MetricRingProps {
  label: string;
  value: number; // 0 - 100
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function MetricRing({
  label,
  value,
  color,
  size = 40,
  strokeWidth = 3.5,
}: MetricRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-white font-mono">
          {Math.round(value)}%
        </span>
      </div>
      <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
