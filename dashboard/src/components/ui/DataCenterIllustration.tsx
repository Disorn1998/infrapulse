import React from 'react';

interface DataCenterIllustrationProps {
  className?: string;
  width?: number;
  height?: number;
}

export const DataCenterIllustration: React.FC<DataCenterIllustrationProps> = ({
  className = '',
  width = 460,
  height = 280,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 520 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-lg transition-transform duration-500 hover:scale-[1.02]"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="rackGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="rackGradB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="glowFloorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <filter id="dcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Isometric Raised Floor Grid */}
        <g opacity="0.85">
          {/* Main Floor Diamond */}
          <polygon
            points="260,100 480,210 260,310 40,210"
            fill="#09101d"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Floor Grid Lines */}
          <line x1="150" y1="155" x2="370" y2="260" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="260" y1="100" x2="260" y2="310" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="370" y1="155" x2="150" y2="260" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

          {/* Glowing Cable Runway Under Floor */}
          <path
            d="M 170 215 L 260 255 L 350 215"
            fill="none"
            stroke="url(#cableGrad)"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.6))' }}
          />
        </g>

        {/* 2. Left Cabinet: RACK-01 (Compute Node Cluster) */}
        <g transform="translate(0, -10)">
          {/* Rack Base Shadow */}
          <polygon points="120,180 180,150 220,170 160,200" fill="rgba(6,182,212,0.15)" />

          {/* Rack Top Roof */}
          <polygon points="160,50 210,30 250,48 200,68" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />

          {/* Rack Right Flank */}
          <polygon points="200,68 250,48 250,178 200,198" fill="url(#rackGradB)" stroke="#334155" strokeWidth="1.2" />

          {/* Rack Front Elevation */}
          <polygon points="160,50 200,68 200,198 160,180" fill="url(#rackGradA)" stroke="#06b6d4" strokeWidth="1.5" />

          {/* Server Blades in Rack 01 */}
          {[60, 72, 84, 96, 108, 120, 132, 144, 156, 168].map((y, idx) => (
            <g key={`r1-blade-${idx}`}>
              <polygon
                points={`164,${y} 196,${y + 14} 196,${y + 22} 164,${y + 8}`}
                fill="#0b1322"
                stroke="#1e293b"
                strokeWidth="0.8"
              />
              {/* LED Lights */}
              <circle
                cx={168}
                cy={y + 5}
                r={1.5}
                fill={idx % 3 === 0 ? '#10b981' : '#06b6d4'}
                className="animate-pulse"
              />
              <circle cx={173} cy={y + 7} r={1.2} fill="#38bdf8" />
              {/* Drive Latches */}
              <line x1={180} y1={y + 10} x2={192} y2={y + 15} stroke="#334155" strokeWidth="1" />
            </g>
          ))}

          {/* Rack Label */}
          <text x="175" y="44" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            RACK-A
          </text>
        </g>

        {/* 3. Middle Unit: In-Row Precision Cooling / AC Unit */}
        <g transform="translate(0, -10)">
          {/* Top */}
          <polygon points="215,74 245,61 270,72 240,85" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* Flank */}
          <polygon points="240,85 270,72 270,186 240,199" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          {/* Front Grille */}
          <polygon points="215,74 240,85 240,199 215,188" fill="#0c172a" stroke="#0ea5e9" strokeWidth="1.2" />

          {/* Cooling Ventilation Louvers */}
          {[94, 106, 118, 130, 142, 154, 166, 178].map((y, idx) => (
            <line
              key={`cool-vent-${idx}`}
              x1={219}
              y1={y}
              x2={236}
              y2={y + 8}
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
          ))}

          {/* Cooling Fan Icon in Center */}
          <circle cx={228} cy={114} r={6} fill="#0369a1" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 228 110 L 228 118 M 224 114 L 232 114" stroke="#38bdf8" strokeWidth="1.2" />

          {/* Cold Air Flow Vector Lines */}
          <path
            d="M 235 125 Q 248 135 258 130"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        </g>

        {/* 4. Right Cabinet: RACK-02 (Storage & Core Switches) */}
        <g transform="translate(0, -10)">
          {/* Top */}
          <polygon points="260,94 310,74 350,92 300,112" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          {/* Flank */}
          <polygon points="300,112 350,92 350,222 300,242" fill="url(#rackGradB)" stroke="#334155" strokeWidth="1.2" />
          {/* Front */}
          <polygon points="260,94 300,112 300,242 260,224" fill="url(#rackGradA)" stroke="#10b981" strokeWidth="1.5" />

          {/* High Density SAN Storage Bays in Rack 02 */}
          {[104, 116, 128, 140, 152, 164, 176, 188, 200, 212].map((y, idx) => (
            <g key={`r2-bay-${idx}`}>
              <polygon
                points={`264,${y} 296,${y + 14} 296,${y + 22} 264,${y + 8}`}
                fill="#0b1322"
                stroke="#1e293b"
                strokeWidth="0.8"
              />
              {/* Activity LED */}
              <circle
                cx={268}
                cy={y + 5}
                r={1.4}
                fill={idx % 2 === 0 ? '#10b981' : '#f59e0b'}
                className="animate-pulse"
              />
              <circle cx={273} cy={y + 7} r={1.2} fill="#10b981" />
              <line x1={280} y1={y + 10} x2={292} y2={y + 15} stroke="#334155" strokeWidth="1" />
            </g>
          ))}

          {/* Rack Label */}
          <text x="275" y="88" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">
            RACK-B
          </text>
        </g>

        {/* 5. Foreground Equipment: Modular UPS & Battery Bank */}
        <g transform="translate(110, 45)">
          {/* Top */}
          <polygon points="220,140 260,123 290,136 250,153" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* Flank */}
          <polygon points="250,153 290,136 290,195 250,212" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          {/* Front */}
          <polygon points="220,140 250,153 250,212 220,199" fill="#091120" stroke="#f59e0b" strokeWidth="1.2" />

          {/* Battery Status LED Meter */}
          <rect x="225" y="150" width="18" height="3" fill="#10b981" rx="0.5" />
          <rect x="225" y="156" width="18" height="3" fill="#10b981" rx="0.5" />
          <rect x="225" y="162" width="18" height="3" fill="#10b981" rx="0.5" />
          <rect x="225" y="168" width="12" height="3" fill="#06b6d4" rx="0.5" />

          {/* Sine Wave Power Icon */}
          <path
            d="M 227 185 Q 232 178 236 185 T 245 185"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />

          <text x="224" y="206" fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold">
            UPS 2N
          </text>
        </g>

        {/* Floating Ambient Data Particles */}
        <circle cx="140" cy="90" r="1.5" fill="#06b6d4" opacity="0.6" className="animate-ping" />
        <circle cx="360" cy="110" r="1.5" fill="#10b981" opacity="0.7" className="animate-ping" />
        <circle cx="250" cy="40" r="2" fill="#38bdf8" opacity="0.8" className="animate-pulse" />
        <circle cx="390" cy="180" r="1.5" fill="#a855f7" opacity="0.6" className="animate-pulse" />
      </svg>
    </div>
  );
};
