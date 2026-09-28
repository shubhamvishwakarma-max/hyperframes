import React from "react";

type IconProps = { size?: number; color?: string; stroke?: number };

export const IconVoice: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 10v4" />
  </svg>
);

export const IconWhatsApp: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 20.5 11.6z" />
    <path
      d="M9 8.6c.2-.4.5-.5.8-.5h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.6l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.1.4-.2.6-.1l1.4.6c.2.1.4.3.4.5v.4c0 .3-.2.6-.5.8-.6.3-1.4.4-2.3 0a8 8 0 0 1-4.4-4.4c-.3-.9-.2-1.6.1-2.1z"
      fill={color}
      stroke="none"
    />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.2-3.6 4.1-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
  </svg>
);

export const IconIntent: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l5.5-5.5 4 4L21 7" />
    <path d="M15 7h6v6" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const IconHistory: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3.5 4.5V9H8" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconPhoneCall: React.FC<IconProps> = ({ size = 24, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4h3.5l1.7 4.2-2.2 1.4a11 11 0 0 0 6.4 6.4l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
  </svg>
);
