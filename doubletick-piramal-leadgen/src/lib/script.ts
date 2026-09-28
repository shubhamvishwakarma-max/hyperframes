/** The exact voiceover. Shared by the narration generator and the subtitle builder. */
export const VOICEOVER = [
  "Still relying on manual calling across the loan lifecycle — while follow-ups, drop-offs and collections keep piling up?",
  "Piramal Finance uses DoubleTick AI Voice to automate first-level outreach across loan follow-ups, application drop-offs, channel partners and collections — bringing RMs in only when human intervention is needed.",
  "That means more consistent outreach, fewer repetitive calls for RMs, and faster movement across customer conversations.",
  "Automate the repetitive. Escalate what matters. Let your RMs focus on high-value conversations.",
  "Book your DoubleTick demo today.",
].join(" ");

/**
 * Phrase-level subtitle segments. Their words, concatenated, must equal VOICEOVER's words;
 * timing comes from the narration alignment.
 */
export const SUBTITLE_SEGMENTS = [
  "Still relying on manual calling across the loan lifecycle —",
  "while follow-ups, drop-offs and collections keep piling up?",
  "Piramal Finance uses DoubleTick AI Voice",
  "to automate first-level outreach across loan follow-ups,",
  "application drop-offs, channel partners and collections —",
  "bringing RMs in only when human intervention is needed.",
  "That means more consistent outreach,",
  "fewer repetitive calls for RMs,",
  "and faster movement across customer conversations.",
  "Automate the repetitive. Escalate what matters.",
  "Let your RMs focus on high-value conversations.",
  "Book your DoubleTick demo today.",
];

/** Words/phrases rendered in DoubleTick green inside subtitles. */
export const SUBTITLE_HIGHLIGHTS = ["AI Voice", "WhatsApp", "RMs", "high-value"];

/** Normalise a token for matching: lowercase alphanumerics only. */
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Split text into spoken word tokens (dashes standing alone are not words). */
export const tokenize = (s: string) =>
  s
    .split(/[\s—]+/)
    .map((w) => w.trim())
    .filter((w) => norm(w).length > 0);
