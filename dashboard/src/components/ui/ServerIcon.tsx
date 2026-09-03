import React from 'react';

interface ServerIconProps {
  isOnline?: boolean;
  variant?: 'isometric' | 'front';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ServerIcon: React.FC<ServerIconProps> = ({
  isOnline = true,
  variant = 'isometric',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { w: 42, h: 28 },
    md: { w: 58, h: 38 },
    lg: { w: 84, h: 54 },
  };

  const { w, h } = sizeMap[size];

  if (variant === 'isometric') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          width={w}
          height={h}
          viewBox="0 0 76 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-300"
        >
          {/* Top Chassis Face */}
          <polygon
            points="38,2 74,18 38,32 2,18"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.2"
          />
          {/* Top Ventilation Lines */}
          <line x1="22" y1="14" x2="38" y2="20" stroke="#0f172a" strokeWidth="1" />
          <line x1="26" y1="12" x2="42" y2="18" stroke="#0f172a" strokeWidth="1" />
          <line x1="30" y1="10" x2="46" y2="16" stroke="#0f172a" strokeWidth="1" />
          <line x1="34" y1="8" x2="50" y2="14" stroke="#0f172a" strokeWidth="1" />

          {/* Right Chassis Flank */}
          <polygon
            points="38,32 74,18 74,32 38,46"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* Front Bezel Face (Where Drives and LEDs live) */}
          <polygon
            points="2,18 38,32 38,46 2,32"
            fill={isOnline ? '#091120' : '#0b0f19'}
            stroke={isOnline ? '#06b6d4' : '#334155'}
            strokeWidth="1.2"
          />

          {/* Drive Bay 1 */}
          <polygon points="6,21 14,24 14,28 6,25" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
          {/* Drive Bay 2 */}
          <polygon points="16,25 24,28 24,32 16,29" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
          {/* Drive Bay 3 */}
          <polygon points="26,29 34,32 34,36 26,33" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

          {/* Server LED Status Lights */}
          <circle
            cx="8"
            cy="30"
            r="1.5"
            fill={isOnline ? '#10b981' : '#64748b'}
            className={isOnline ? 'animate-pulse' : ''}
            style={{
              filter: isOnline ? 'drop-shadow(0 0 3px #10b981)' : 'none',
            }}
          />
          <circle
            cx="12"
            cy="31.5"
            r="1.2"
            fill={isOnline ? '#06b6d4' : '#475569'}
            style={{
              filter: isOnline ? 'drop-shadow(0 0 2px #06b6d4)' : 'none',
            }}
          />
          <circle
            cx="16"
            cy="33"
            r="1.2"
            fill={isOnline ? '#38bdf8' : '#334155'}
          />

          {/* Subtle Ambient Glow underneath when Online */}
          {isOnline && (
            <ellipse
              cx="38"
              cy="45"
              rx="24"
              ry="4"
              fill="rgba(6, 182, 212, 0.15)"
              style={{ filter: 'blur(3px)' }}
            />
          )}
        </svg>
      </div>
    );
  }

  // Front Elevation View (1U Rack Chassis)
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 120 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chassis Body */}
        <rect
          x="1"
          y="2"
          width="118"
          height="24"
          rx="3"
          fill="#0f172a"
          stroke={isOnline ? '#06b6d4' : '#334155'}
          strokeWidth="1.2"
        />

        {/* Rack Mount Ears (Left & Right) */}
        <rect x="1" y="2" width="6" height="24" fill="#1e293b" />
        <circle cx="4" cy="8" r="1.5" fill="#090d16" stroke="#475569" strokeWidth="0.5" />
        <circle cx="4" cy="20" r="1.5" fill="#090d16" stroke="#475569" strokeWidth="0.5" />

        <rect x="113" y="2" width="6" height="24" fill="#1e293b" />
        <circle cx="116" cy="8" r="1.5" fill="#090d16" stroke="#475569" strokeWidth="0.5" />
        <circle cx="116" cy="20" r="1.5" fill="#090d16" stroke="#475569" strokeWidth="0.5" />

        {/* Drive Bays (4 Hot-swap bays) */}
        <rect x="12" y="6" width="18" height="16" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
        <rect x="33" y="6" width="18" height="16" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
        <rect x="54" y="6" width="18" height="16" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
        <rect x="75" y="6" width="18" height="16" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

        {/* Drive release latches */}
        <line x1="14" y1="8" x2="14" y2="20" stroke="#475569" strokeWidth="1" />
        <line x1="35" y1="8" x2="35" y2="20" stroke="#475569" strokeWidth="1" />
        <line x1="56" y1="8" x2="56" y2="20" stroke="#475569" strokeWidth="1" />
        <line x1="77" y1="8" x2="77" y2="20" stroke="#475569" strokeWidth="1" />

        {/* LED Activity on Drives */}
        {isOnline && (
          <>
            <circle cx="26" cy="9" r="1" fill="#10b981" />
            <circle cx="47" cy="9" r="1" fill="#10b981" />
            <circle cx="68" cy="9" r="1" fill="#06b6d4" />
            <circle cx="89" cy="9" r="1" fill="#10b981" />
          </>
        )}

        {/* Control Panel / Bezel Right Area */}
        <rect x="97" y="6" width="13" height="16" rx="1" fill="#0b0f19" stroke="#1e293b" strokeWidth="0.8" />
        {/* Power Button */}
        <circle
          cx="103.5"
          cy="10"
          r="2"
          fill={isOnline ? '#10b981' : '#ef4444'}
          className={isOnline ? 'animate-pulse' : ''}
          style={{ filter: isOnline ? 'drop-shadow(0 0 3px #10b981)' : 'none' }}
        />
        {/* NIC & Activity LEDs */}
        <circle cx="101" cy="17" r="1" fill={isOnline ? '#06b6d4' : '#475569'} />
        <circle cx="106" cy="17" r="1" fill={isOnline ? '#f59e0b' : '#334155'} />
      </svg>
    </div>
  );
};
