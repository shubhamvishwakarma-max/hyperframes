import React from "react";
import { interpolate } from "remotion";
import { C, FONT, MONO, SECTIONS } from "../theme";
import {
  Card,
  Eyebrow,
  IconBadge,
  IconChat,
  IconPhone,
  IconUser,
  Phone,
  Reveal,
  StatusBar,
  StatusChip,
  progressAt,
} from "../ui";

const LEADS = [
  { name: "Arjun Mehta", product: "Business Loan", initials: "AM" },
  { name: "Neha Shah", product: "Personal Loan", initials: "NS" },
  { name: "Rohan Verma", product: "Loan Application", initials: "RV" },
];

export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const end = SECTIONS.hook[1];
  const shift = progressAt(t, end - 0.75, 0.45); // queue shifts back before the customer story
  // Arjun's status: HOT LEAD → WAITING → GOING COLD
  const s1 = progressAt(t, 2.4, 0.3);
  const s2 = progressAt(t, 3.7, 0.3);
  const arjun =
    s2 > 0.5
      ? { label: "Going cold", tone: "cold" as const }
      : s1 > 0.5
        ? { label: "Waiting", tone: "warn" as const }
        : { label: "Hot lead", tone: "green" as const };
  const chipPulse = s1 > 0 && s1 < 1 ? 0.96 + 0.04 * s1 : s2 > 0 && s2 < 1 ? 0.96 + 0.04 * s2 : 1;
  const statuses = [
    arjun,
    { label: "Follow-up pending", tone: "warn" as const },
    { label: "No response", tone: "neutral" as const },
  ];
  const lineP = progressAt(t, end - 0.6, 0.5);

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      {/* left copy */}
      <div style={{ position: "absolute", left: 64, top: 214, width: 540 }}>
        <Reveal at={0.15}>
          <Eyebrow>The follow-up gap</Eyebrow>
        </Reveal>
        <Reveal at={0.3} style={{ marginTop: 22 }}>
          <div style={{ fontSize: 58, lineHeight: 1.06, fontWeight: 700, letterSpacing: -1.8, color: C.ink }}>
            Still chasing lakhs
            <br />
            of leads manually?
          </div>
        </Reveal>
        <Reveal at={1.4} style={{ marginTop: 24 }}>
          <div style={{ fontSize: 24, lineHeight: 1.4, fontWeight: 400, color: C.muted, maxWidth: 470 }}>
            While hot opportunities go cold before your RMs can follow up?
          </div>
        </Reveal>
        <Reveal at={2.2} style={{ marginTop: 40 }}>
          <Card style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 20px", borderRadius: 18 }}>
            <IconBadge size={40} bg={C.warnSoft}>
              <IconUser size={20} color={C.warn} />
            </IconBadge>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: 1.5, color: C.muted }}>RM QUEUE</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.ink }}>176 Pending</div>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* phone with lead queue */}
      <Reveal at={0.45} y={40} scale style={{ position: "absolute", left: 632, top: 214 }}>
        <div
          style={{
            transform: `scale(${1 - 0.06 * shift})`,
            opacity: 1 - 0.45 * shift,
            transformOrigin: "50% 40%",
          }}
        >
          <Phone width={384} height={660}>
            <StatusBar />
            <div style={{ padding: "12px 22px 0" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>Lead queue</div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.muted, letterSpacing: 1, marginTop: 2 }}>TODAY · MANUAL CALLING</div>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "18px 16px 8px" }}>
              {[
                ["248", "New leads", C.ink],
                ["176", "Follow-ups pending", C.warn],
                ["42", "Missed", "#A2432F"],
              ].map(([n, l, c], i) => (
                <Reveal key={l} at={0.8 + i * 0.12} style={{ flex: 1 }}>
                  <div style={{ background: "#F6F3EC", borderRadius: 16, padding: "12px 10px", height: 96 }}>
                    <div style={{ fontSize: 30, fontWeight: 700, color: c, letterSpacing: -0.5 }}>{n}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.6, color: C.muted, textTransform: "uppercase", marginTop: 4, lineHeight: 1.25 }}>{l}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 16px" }}>
              {LEADS.map((lead, i) => (
                <Reveal key={lead.name} at={1.1 + i * 0.18}>
                  <div
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 18,
                      padding: "14px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: i === 0 && s2 > 0.5 ? "#F7F9FB" : "#fff",
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: "#EFEBE2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: C.charcoal }}>
                      {lead.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>{lead.name}</div>
                      <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{lead.product}</div>
                      <div style={{ marginTop: 8, transformOrigin: "left center", transform: i === 0 ? `scale(${chipPulse})` : undefined }}>
                        <StatusChip label={statuses[i].label} tone={statuses[i].tone} size={12} />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Phone>
        </div>
      </Reveal>

      {/* green DoubleTick connection line + channels (prepares the customer proof) */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 900,
          width: 540,
          opacity: lineP,
          transform: `translateY(${(1 - lineP) * 12}px)`,
        }}
      >
        <div style={{ height: 3, borderRadius: 2, background: C.border, position: "relative", marginBottom: 18 }}>
          <div style={{ position: "absolute", inset: 0, background: C.accent, borderRadius: 2, transformOrigin: "left", transform: `scaleX(${lineP})` }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[
            [<IconPhone key="p" size={18} />, "AI Voice"],
            [<IconChat key="c" size={18} />, "WhatsApp"],
            [<IconUser key="u" size={18} />, "RM"],
          ].map(([icon, label], i) => (
            <React.Fragment key={label as string}>
              {i > 0 ? <span style={{ color: C.accent, fontWeight: 600, fontSize: 20 }}>+</span> : null}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 999, padding: "8px 14px 8px 10px", fontSize: 17, fontWeight: 600, color: C.ink, opacity: interpolate(lineP, [i * 0.2, i * 0.2 + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                {icon}
                {label}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
