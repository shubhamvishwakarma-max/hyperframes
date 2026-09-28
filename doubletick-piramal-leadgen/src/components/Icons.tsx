import React from "react";

type P = { size?: number; color?: string; stroke?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  style: { flexShrink: 0, display: "block" } as React.CSSProperties,
});

export const IconWave: React.FC<P> = ({ size = 20, color = "currentColor", stroke = 2 }) => (
  <svg {...base(size)}>
    <path
      d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </svg>
);

export const IconPhone: React.FC<P> = ({ size = 20, color = "currentColor", stroke = 1.9 }) => (
  <svg {...base(size)}>
    <path
      d="M6.6 3.5h2.6l1.4 4-2 1.5a11 11 0 0 0 6.4 6.4l1.5-2 4 1.4v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </svg>
);

export const IconChat: React.FC<P> = ({ size = 20, color = "currentColor", stroke = 1.9 }) => (
  <svg {...base(size)}>
    <path
      d="M4 12a8 8 0 1 1 3.3 6.5L4 19.5l1.1-3.1A7.9 7.9 0 0 1 4 12z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path d="M9 10.5h6M9 13.5h4" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);

export const IconSpark: React.FC<P> = ({ size = 20, color = "currentColor", stroke = 1.9 }) => (
  <svg {...base(size)}>
    <path
      d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <circle cx="18.5" cy="18.5" r="1.4" fill={color} />
  </svg>
);

export const IconUser: React.FC<P> = ({ size = 20, color = "currentColor", stroke = 1.9 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8.5" r="3.8" stroke={color} strokeWidth={stroke} />
    <path
      d="M4.5 20c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </svg>
);

export const IconCheck: React.FC<P> = ({ size = 16, color = "currentColor", stroke = 2.4 }) => (
  <svg {...base(size)}>
    <path
      d="M5 12.5l4.2 4.2L19 7"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconArrow: React.FC<P> = ({ size = 18, color = "currentColor", stroke = 2.2 }) => (
  <svg {...base(size)}>
    <path
      d="M4 12h15M13 6l6 6-6 6"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconRoute: React.FC<P> = ({ size = 18, color = "currentColor", stroke = 2 }) => (
  <svg {...base(size)}>
    <circle cx="6" cy="6" r="2.4" stroke={color} strokeWidth={stroke} />
    <circle cx="18" cy="18" r="2.4" stroke={color} strokeWidth={stroke} />
    <path
      d="M8.4 6H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h5.6"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </svg>
);

export const IconClock: React.FC<P> = ({ size = 16, color = "currentColor", stroke = 2 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={stroke} />
    <path d="M12 7.5V12l3 2" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);
