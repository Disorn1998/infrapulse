import React from 'react';

interface PueGaugeProps {
  currentPue: number;
  targetPue?: number;
  isStandby?: boolean;
  size?: number;
  showDetails?: boolean;
}

export const PueGauge: React.FC<PueGaugeProps> = ({
  currentPue,
  targetPue = 1.30,
  isStandby = false,
  size = 180,
  showDetails = true,
}) => {
  // PUE scale ranges from 1.0 (minimum theoretical) to 3.0 (inefficient)
  // Arc spans 180 degrees from -180 to 0 (or 180 to 360)
  const minPue = 1.0;
  const maxPue = 3.0;
  
  // Calculate percentage along arc: 1.0 = 0%, 3.0 = 100%
  const effectivePue = isStandby ? 1.0 : Math.min(Math.max(currentPue, minPue), maxPue);
  const ratio = (effectivePue - minPue) / (maxPue - minPue);
  
  // Angle: from -180 deg (left, 1.0) to 0 deg (right, 3.0)
  const angleDeg = -180 + ratio * 180;
  const targetRatio = (targetPue - minPue) / (maxPue - minPue);
  const targetAngleDeg = -180 + targetRatio * 180;

  // Arc dimensions
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + size * 0.15;

  // Determine status
  let statusText = 'Optimal Efficiency';
  let statusColor = 'text-emerald-400';
  let statusBg = 'bg-emerald-950/60 border-emerald-500/30';

  if (isStandby) {
    statusText = 'Standby (0W IT Load)';
    statusColor = 'text-amber-400';
    statusBg = 'bg-amber-950/60 border-amber-500/30';
  } else if (currentPue <= targetPue) {
    statusText = `Optimal (≤ ${targetPue.toFixed(2)})`;
    statusColor = 'text-emerald-400';
    statusBg = 'bg-emerald-950/60 border-emerald-500/30';
  } else if (currentPue <= 1.6) {
    statusText = 'Acceptable Performance';
    statusColor = 'text-cyan-400';
    statusBg = 'bg-cyan-950/60 border-cyan-500/30';
  } else {
    statusText = 'Light-Load PUE Overhead';
    statusColor = 'text-amber-400';
    statusBg = 'bg-amber-950/60 border-amber-500/30';
  }

  // Helper function for polar to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const needleLen = radius - 8;
  const needleTip = polarToCartesian(centerX, centerY, needleLen, angleDeg);
  const targetMarker = polarToCartesian(centerX, centerY, radius + strokeWidth * 0.7, targetAngleDeg);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg
          width={size}
          height={size * 0.65}
          viewBox={`0 0 ${size} ${size * 0.7}`}
          className="overflow-visible"
        >
          <defs>
            {/* Arc gradient: Green -> Cyan -> Amber -> Rose */}
            <linearGradient id="pueArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            <filter id="pueGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Arc Segment (Gradient) */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="url(#pueArcGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.9"
            style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.3))' }}
          />

          {/* BOI Target Marker */}
          <circle
            cx={targetMarker.x}
            cy={targetMarker.y}
            r={3}
            fill="#38bdf8"
            stroke="#090d16"
            strokeWidth={1}
          >
            <title>{`BOI Target: ${targetPue}`}</title>
          </circle>

          {/* Scale Labels */}
          <text x={centerX - radius} y={centerY + 14} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            1.0
          </text>
          <text x={centerX} y={centerY - radius - 6} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            2.0
          </text>
          <text x={centerX + radius} y={centerY + 14} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            3.0
          </text>

          {/* Needle Pointer */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={isStandby ? '#94a3b8' : '#38bdf8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.6))',
            }}
          />

          {/* Needle Center Hub */}
          <circle cx={centerX} cy={centerY} r={5} fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <circle cx={centerX} cy={centerY} r={2} fill="#38bdf8" />
        </svg>

        {/* Numeric Readout in center below needle */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {isStandby ? 'Standby' : currentPue.toFixed(2)}
            </span>
            {!isStandby && <span className="text-xs font-mono text-slate-400">PUE</span>}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${statusBg} ${statusColor} transition-all`}>
          {statusText}
        </div>
      )}
    </div>
  );
};
