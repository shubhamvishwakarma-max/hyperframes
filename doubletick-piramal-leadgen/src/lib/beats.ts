import { T } from "./timing";

/** Follow-up task cards for the hook. Chaos layout = card centre (x, y) + rotation. */
export type TaskCard = {
  type: string;
  name: string;
  status: string;
  x: number;
  y: number;
  rot: number;
};

export const TASK_CARDS: TaskCard[] = [
  {
    type: "Application follow-up",
    name: "Rohan Mehta",
    status: "No response",
    x: 262,
    y: 452,
    rot: -3,
  },
  { type: "Drop-off", name: "Ananya Iyer", status: "Incomplete", x: 818, y: 468, rot: 2.5 },
  {
    type: "Partner callback",
    name: "Shree Motors",
    status: "Callback due",
    x: 250,
    y: 826,
    rot: 2,
  },
  { type: "Collection reminder", name: "Vikram Rao", status: "Due today", x: 832, y: 806, rot: -2 },
  {
    type: "Application follow-up",
    name: "Sneha Kulkarni",
    status: "No response",
    x: 392,
    y: 392,
    rot: 1.5,
  },
  { type: "Drop-off", name: "Arjun Nair", status: "KYC pending", x: 700, y: 392, rot: -1.5 },
  { type: "Collection reminder", name: "Kavya Reddy", status: "Overdue", x: 214, y: 640, rot: -1 },
  {
    type: "Partner callback",
    name: "Om Finserv DSA",
    status: "Callback due",
    x: 866,
    y: 640,
    rot: 1.5,
  },
  {
    type: "Application follow-up",
    name: "Farhan Sheikh",
    status: "No response",
    x: 420,
    y: 880,
    rot: -2.5,
  },
  { type: "Drop-off", name: "Meera Joshi", status: "Docs pending", x: 672, y: 884, rot: 2 },
  { type: "Collection reminder", name: "Rahul Verma", status: "Due today", x: 300, y: 530, rot: 4 },
  {
    type: "Application follow-up",
    name: "Isha Kapoor",
    status: "No response",
    x: 784,
    y: 548,
    rot: -3.5,
  },
  { type: "Partner callback", name: "Metro Auto", status: "Callback due", x: 318, y: 738, rot: -3 },
  { type: "Drop-off", name: "Aditya Menon", status: "Incomplete", x: 770, y: 734, rot: 3 },
  { type: "Collection reminder", name: "Pooja Das", status: "Overdue", x: 540, y: 424, rot: -2 },
  {
    type: "Application follow-up",
    name: "Nikhil Jain",
    status: "No response",
    x: 540,
    y: 860,
    rot: 1,
  },
];

/** Card arrival frames: intervals shrink, so the pile visibly accelerates. */
export const CARD_TIMES: number[] = (() => {
  const start = 10;
  const end = T.bandwidth - 3;
  const n = TASK_CARDS.length;
  return TASK_CARDS.map((_, i) => Math.round(start + (end - start) * Math.pow(i / (n - 1), 0.62)));
})();

/** The RM counter steps 18 → 27 → 42 → 58 as the pile grows. */
export const COUNTER_STEPS: { at: number; value: number }[] = [
  { at: 0, value: 18 },
  { at: CARD_TIMES[4], value: 27 },
  { at: CARD_TIMES[9], value: 42 },
  { at: CARD_TIMES[14], value: 58 },
];

/** Hook → queue organisation. */
export const ORGANIZE = {
  pulse: T.pulse,
  sweepDur: 18,
  morphDur: 16,
  queueTop: 426,
  rowH: 50,
  rowGap: 10,
  queueW: 540,
  visibleRows: 6,
};

/** WhatsApp conversation + handoff beats. */
export const CHAT = (() => {
  const w = T.whatsapp;
  const typing1 = w + 4;
  const msg1 = w + 14;
  const typing2 = msg1 + 5;
  const msg2 = msg1 + 16;
  const reply = msg2 + 14;
  const pulse = Math.max(reply + 6, T.intervention - 2);
  const intent = pulse + 15;
  const handoff = Math.max(intent + 10, T.needed);
  const assigned = handoff + 12;
  return { typing1, msg1, typing2, msg2, reply, pulse, intent, handoff, assigned };
})();

/** Value-scene statement windows. */
export const VALUE = {
  s1: T.value + 4,
  s2: T.fewer - 3,
  s3: T.faster - 3,
  out: T.automateRep - 4,
};
