import React from 'react';

interface CircularGaugeProps {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  colorScheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'auto';
  showPercentage?: boolean;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  max = 100,
  label,
  unit = '%',
  size = 64,
  strokeWidth = 5,
  colorScheme = 'auto',
  showPercentage = true,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = (clampedValue / max) * 100;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color scheme based on thresholds if 'auto'
  let strokeColor = '#06b6d4'; // cyan
  let glowColor = 'rgba(6, 182, 212, 0.4)';
  
  if (colorScheme === 'auto') {
    if (percentage >= 85) {
      strokeColor = '#f43f5e'; // rose
      glowColor = 'rgba(244, 63, 94, 0.5)';
    } else if (percentage >= 70) {
      strokeColor = '#f59e0b'; // amber
      glowColor = 'rgba(245, 158, 11, 0.4)';
    } else {
      strokeColor = '#06b6d4'; // cyan
      glowColor = 'rgba(6, 182, 212, 0.4)';
    }
  } else if (colorScheme === 'emerald') {
    strokeColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (colorScheme === 'amber') {
    strokeColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else if (colorScheme === 'rose') {
    strokeColor = '#f43f5e';
    glowColor = 'rgba(244, 63, 94, 0.5)';
  }

  const gradientId = `gauge-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 4px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono font-bold text-white text-xs leading-none tracking-tight">
            {Math.round(clampedValue)}
            {showPercentage && <span className="text-[10px] text-slate-400">{unit}</span>}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1 font-medium">
          {label}
        </span>
      )}
    </div>
  );
};
