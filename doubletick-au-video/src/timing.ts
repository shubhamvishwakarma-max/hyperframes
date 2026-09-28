/**
 * Beat sheet (absolute seconds on the video timeline).
 * Narration starts at VO_OFFSET; beats are derived from the narration's measured phrase boundaries.
 */
export const VO_OFFSET = 0.25;

export const T = {
  // Scene 1 — hook
  hookStart: 0,
  lakhs: 2.3, // "lakhs of leads"
  whileHot: 3.45, // "while hot"
  goCold: 4.3, // "opportunities go cold?"
  hotLeadsDontWait: 3.45,
  // Transition — better way
  betterWay: 4.85,
  // Scene 2 — AU + DoubleTick
  auLogo: 5.25, // "AU Small Finance Bank"
  s2Start: 5.9,
  aiVoice: 7.0, // "DoubleTick AI Voice"
  connected: 7.75,
  whatsapp: 8.2, // "and WhatsApp"
  interest: 8.35,
  msg1: 8.9,
  msg2: 9.55,
  reply: 10.25,
  highIntent: 10.7,
  atScale: 10.75, // "at scale."
  // Scene 3 — right RM + context
  s3Start: 11.45,
  rightLead: 11.65,
  rightRM: 12.85, // "to the right RM"
  routed: 13.45,
  preservesContext: 13.75, // "preserves context"
  ownershipChanges: 14.35, // "when ownership changes"
  historyPreserved: 15.0,
  zeroContextLoss: 15.05,
  centralized: 15.75, // "centralized visibility"
  // Scene 4 — impact
  s4Start: 18.05, // "The impact?"
  threeLakh: 19.0, // "three lakh twelve thousand..."
  callsResolved: 20.55,
  thirtyPercent: 22.25, // "thirty percent"
  scaleOutreach: 24.1,
  // Scene 5 — value
  s5Start: 25.1,
  automate: 25.25, // "Automate outreach."
  preserve: 26.05, // "Preserve context."
  startClosing: 26.9,
  focus: 27.7, // "focus on conversations that convert"
  // Scene 6 — CTA
  auOut: 29.35,
  ctaStart: 29.5,
  book: 29.74, // "Book your DoubleTick demo today."
  end: 32,
};
