// CONTENT LOCK
// Every string below is copied verbatim from the source document
// "customers_carousels" (Google Drive, BFSI section). Do not paraphrase,
// shorten, re-punctuate or recalculate. Presentation (case, line wrapping)
// is handled in CSS, never by editing these strings.
//
// Source quirks kept on purpose: the space before "!" in the Piramal and
// Wint Wealth problems, "Samar capital" casing, curly apostrophe in "couldn’t".
// A non-breaking space ( ) is used before those "!" so the mark never
// wraps onto its own line; the characters shown are unchanged.

window.customerData = {
  opening: {
    eyebrow: "CUSTOMER STORIES · BFSI", // design label, not source copy
    main: "How many opportunities are hiding inside unworked leads and unmanaged conversations?",
    supporting: "See how BFSI leaders are turning conversations into measurable outcomes.",
  },

  customers: [
    {
      id: "au",
      name: "AU SMALL FINANCE BANK",
      label: "CUSTOMER STORY",
      problem: "Manual calling couldn’t scale across lakhs of leads—creating missed revenue opportunities.",
      solution:
        "DoubleTick combined AI Voice with RM mapping to re-engage leads and route conversations to the right RM.",
      bulletsLabel: "SOLUTIONS",
      bullets: [
        "Re-engaged dormant and rejected leads at scale using AI Voice.",
        "Auto-routed chats to the assigned RM.",
        "Preserved context during RM ownership changes.",
        "Centralized visibility across RM conversations.",
      ],
      impact: [
        { value: "3,12,945+", count: 312945, suffix: "+", label: "Outbound AI Calls Placed", hero: true },
        { value: "30%", count: 30, suffix: "%", label: "RM Broadcast → CC Closure" },
      ],
    },
    {
      id: "pf",
      name: "PIRAMAL FINANCE",
      label: "CUSTOMER STORY",
      problem: "Manual outreach was slowing conversations across the loan lifecycle !",
      solution:
        "DoubleTick AI Voice automates outreach across follow-ups, partners and collections - escalating only the conversations that need an RM.",
      bulletsLabel: "SOLUTIONS",
      bullets: [
        "Automated first-level loan follow-ups.",
        "Scaled partner & collections outreach.",
        "Routed exceptions directly to RMs.",
      ],
      impact: [
        { value: "30%", count: 30, suffix: "%", label: "RM Broadcast → CC Closure" },
        { value: "90%", count: 90, suffix: "%", label: "Reduction in RM Response Time", hero: true },
      ],
    },
    {
      id: "ww",
      name: "WINT WEALTH",
      label: "CUSTOMER STORY",
      problem: "Personalized wealth conversations were becoming harder to govern !",
      solution:
        "DoubleTick gives Wint Wealth centralized oversight across RM-led WhatsApp conversations—without managers manually reading every chat.",
      bulletsLabel: "SOLUTIONS",
      bullets: [
        "AI-led oversight across RM conversations.",
        "Role-based access for controlled visibility.",
        "Automated journeys and WhatsApp calling.",
      ],
      impact: [
        { value: "5.5×", count: 5.5, decimals: 1, suffix: "×", label: "Increase in WhatsApp Usage", hero: true },
        { value: "476", count: 476, suffix: "", label: "WhatsApp Calls in 2 Months" },
      ],
    },
    {
      id: "cd",
      name: "COINDCX",
      label: "CUSTOMER STORY",
      problem: "More WhatsApp journeys created more blind spots across teams.",
      solution:
        "DoubleTick brings Sales, VIP and Sub-Broker conversations onto one governed WhatsApp layer with centralized visibility and analytics.",
      bulletsLabel: "SOLUTIONS",
      bullets: [
        "Unified Sales, VIP & Broker journeys",
        "Centralized conversation visibility",
        "Analytics, CSAT & AI-ready workflows",
      ],
      impact: [{ value: "3", count: 3, suffix: "", label: "Distinct Journeys Unified", hero: true }],
    },
    {
      id: "sc",
      name: "Samar capital",
      label: "CUSTOMER STORY",
      problem: "RM conversations needed independence without losing enterprise control.",
      solution:
        "DoubleTick gives every RM a governed business number with role-based access, while keeping supervisors in control.",
      bulletsLabel: "SOLUTIONS",
      bullets: ["1:1 governed RM numbers", "Role-based client access", "Centralized supervisor visibility"],
      impact: [
        { value: "1:1", label: "Governed Number per RM", hero: true },
        { value: "0", count: 0, suffix: "", label: "Cross-RM Client Visibility" },
      ],
    },
  ],

  // Recap = the same metrics already shown above (no new claims).
  recap: [
    { id: "au", metric: 0 },
    { id: "pf", metric: 1 },
    { id: "ww", metric: 0 },
    { id: "cd", metric: 0 },
    { id: "sc", metric: 0 },
  ],

  cta: {
    question: "Still managing customer conversations manually?",
    secondary: "Let DoubleTick show you what can be automated.",
    button: "Book a DoubleTick Demo",
  },
};
