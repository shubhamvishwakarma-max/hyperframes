import React from "react";
import { interpolate } from "remotion";
import { C, FONT, MONO, SECTIONS, cues } from "../theme";
import {
  Bubble,
  Card,
  CustomerLogo,
  DoubleTickLogo,
  Eyebrow,
  IconBadge,
  IconChat,
  IconCheck,
  IconPhone,
  IconUser,
  LogoAvatar,
  Phone,
  StatusBar,
  StatusChip,
  progressAt,
} from "../ui";

const fmtIN = (n: number) => Math.round(n).toLocaleString("en-IN");

/** Layer that fades in at `a` and out at `b`. */
const layer = (t: number, a: number, b: number, fin = 0.35, fout = 0.3) =>
  Math.min(progressAt(t, a, fin), 1 - progressAt(t, b - fout, fout));

const Row: React.FC<{ label: string; value: React.ReactNode; p?: number; icon?: React.ReactNode }> = ({
  label,
  value,
  p = 1,
  icon,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "9px 0",
      borderTop: `1px solid ${C.border}`,
      opacity: 0.25 + 0.75 * p,
    }}
  >
    {icon}
    <div style={{ flex: 1, fontSize: 18, fontWeight: 500, color: C.charcoal }}>{label}</div>
    {value}
  </div>
);

export const CustomerStory: React.FC<{ t: number }> = ({ t }) => {
  const [auStart] = SECTIONS.au;
  const [pStart, pEnd] = SECTIONS.piramal;
  const auL = layer(t, auStart, pStart + 0.15);
  const pL = layer(t, pStart - 0.05, pEnd + 1);
  const frameIn = progressAt(t, auStart, 0.45);

  /* ---------------- AU cues ---------------- */
  const auLogo = progressAt(t, cues.au, 0.4);
  const auVoice = progressAt(t, cues.auDoubleTick, 0.35);
  const auWa = [0, 1, 2].map((i) => progressAt(t, cues.auWhatsApp + i * 0.85, 0.35));
  const auIntent = progressAt(t, cues.auWhatsApp + 2.2, 0.35);
  const auMetric = progressAt(t, cues.auMetric, 0.45);
  const auCount = interpolate(t, [cues.auMetric, cues.auMetric + 1.3], [0, 312945], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const auRm = progressAt(t, cues.auRm, 0.4);

  /* ---------------- Piramal cues ---------------- */
  const pLogo = progressAt(t, cues.piramal, 0.4);
  const pUi = progressAt(t, cues.pDoubleTick, 0.35);
  const pCh = progressAt(t, cues.pChannels, 0.35);
  const pWa = [0, 1, 2].map((i) => progressAt(t, cues.pDoubleTick + 0.2 + i * 0.85, 0.35));
  const pChips = [cues.pChip1, cues.pChip2, cues.pChip3, cues.pChip4].map((c) => progressAt(t, c, 0.35));
  const pCtx = progressAt(t, cues.pChip2, 0.35); // context label: APPLICATION FOLLOW-UP → DROP-OFF RECOVERY
  const pRoute = progressAt(t, cues.pChip4 + 0.7, 0.4);
  const pMetric = progressAt(t, cues.pMetric, 0.45);
  const pCount = interpolate(t, [cues.pMetric, cues.pMetric + 1.0], [0, 90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });

  const heading = (eyebrow: string, title: string, sub: string, o: number) => (
    <div style={{ position: "absolute", left: 64, top: 128, width: 900, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div style={{ marginTop: 16, fontSize: 44, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.08, color: C.ink }}>{title}</div>
      <div style={{ marginTop: 12, fontSize: 22, fontWeight: 400, color: C.muted }}>{sub}</div>
    </div>
  );

  const channelRow = (voice: number, wa: number) => (
    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
      {[
        { icon: <IconPhone size={18} color={voice > 0.5 ? C.green : C.muted} />, name: "AI Voice", state: "Connected", p: voice },
        { icon: <IconChat size={18} color={wa > 0.5 ? C.green : C.muted} />, name: "WhatsApp", state: "Active", p: wa },
      ].map((ch) => (
        <div
          key={ch.name}
          style={{
            flex: 1,
            borderRadius: 16,
            border: `1.5px solid ${ch.p > 0.5 ? C.accent : C.border}`,
            background: ch.p > 0.5 ? C.soft : "#FAF8F4",
            padding: "11px 12px",
            transform: `scale(${0.97 + 0.03 * ch.p})`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 600, color: C.ink }}>
            {ch.icon}
            {ch.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: 1, color: ch.p > 0.5 ? C.green : C.muted, marginTop: 5, textTransform: "uppercase" }}>
            {ch.p > 0.5 ? ch.state : "Idle"}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      {/* top-right customer logos */}
      <div style={{ position: "absolute", right: 56, top: 30, height: 44, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", right: 0, opacity: Math.min(auLogo, auL) }}>
          <CustomerLogo brand="au" height={40} maxWidth={200} />
        </div>
        <div style={{ position: "absolute", right: 0, opacity: Math.min(pLogo, pL) }}>
          <CustomerLogo brand="piramal" height={40} maxWidth={200} />
        </div>
      </div>

      {heading("Customer story 01", "Re-engaging dormant leads at scale", "AI Voice + WhatsApp + smart RM routing", Math.min(progressAt(t, auStart + 0.1, 0.4), auL))}
      {heading("Customer story 02", "AI outreach across the loan lifecycle", "From application follow-ups to collections", Math.min(progressAt(t, pStart + 0.1, 0.4), pL))}

      {/* ---------- persistent phone (left 55%) ---------- */}
      <div style={{ position: "absolute", left: 92, top: 318, opacity: frameIn, transform: `translateY(${(1 - frameIn) * 30}px)` }}>
        <Phone width={404} height={720}>
          <div style={{ background: C.waHeader }}>
            <StatusBar dark />
            <div style={{ position: "relative", height: 68 }}>
              {(["au", "piramal"] as const).map((b) => (
                <div
                  key={b}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 16px 10px",
                    opacity: b === "au" ? auL : pL,
                  }}
                >
                  <LogoAvatar brand={b} size={46} />
                  <div style={{ color: "#fff" }}>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>{b === "au" ? "AU Small Finance Bank" : "Piramal Finance"}</div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>Business account</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", top: 118, bottom: 0, left: 0, right: 0, background: C.waBg }}>
            {/* AU chat */}
            <div style={{ position: "absolute", inset: 0, padding: "18px 14px", display: "flex", flexDirection: "column", gap: 12, opacity: auL }}>
              <div style={{ alignSelf: "center", opacity: auVoice, fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: 0.8, color: C.green, background: C.soft, padding: "6px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <IconPhone size={13} /> AI VOICE CALL · CONNECTED
              </div>
              <Bubble side="in" time="11:02" p={auWa[0]}>Hi Arjun, we&apos;re following up on your loan enquiry.</Bubble>
              <Bubble side="in" time="11:02" p={auWa[1]}>Would you like to continue here on WhatsApp?</Bubble>
              <Bubble side="out" time="11:04" p={auWa[2]}>Yes, I&apos;m still interested.</Bubble>
              <div style={{ alignSelf: "flex-end", opacity: auIntent, transform: `scale(${0.97 + 0.03 * auIntent})` }}>
                <StatusChip label="High intent" tone="solid" size={13} />
              </div>
            </div>
            {/* Piramal chat */}
            <div style={{ position: "absolute", inset: 0, padding: "18px 14px", display: "flex", flexDirection: "column", gap: 12, opacity: pL }}>
              <div style={{ alignSelf: "center", position: "relative", height: 30, width: 250 }}>
                {["Application follow-up", "Drop-off recovery"].map((l, i) => (
                  <div key={l} style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", opacity: i === 0 ? 1 - pCtx : pCtx, transform: `translateY(${i === 0 ? -8 * pCtx : 8 * (1 - pCtx)}px)` }}>
                    <StatusChip label={l} tone={i === 0 ? "neutral" : "green"} size={12} />
                  </div>
                ))}
              </div>
              <Bubble side="in" time="10:15" p={pWa[0]}>Hi Rohan, your loan application is still incomplete.</Bubble>
              <Bubble side="in" time="10:15" p={pWa[1]}>Would you like help continuing?</Bubble>
              <Bubble side="out" time="10:16" p={pWa[2]}>Yes, please.</Bubble>
            </div>
          </div>
        </Phone>
      </div>

      {/* ---------- persistent DoubleTick card (right 45%) ---------- */}
      <div style={{ position: "absolute", left: 540, top: 318, width: 476, opacity: frameIn, transform: `translateY(${(1 - frameIn) * 30}px)` }}>
        <Card style={{ padding: "18px 22px 14px", position: "relative", height: 404, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <DoubleTickLogo width={112} />
            <div style={{ position: "relative", width: 150, height: 26 }}>
              <div style={{ position: "absolute", right: 0, top: 0, opacity: auL }}><CustomerLogo brand="au" height={24} maxWidth={140} /></div>
              <div style={{ position: "absolute", right: 0, top: 0, opacity: pL }}><CustomerLogo brand="piramal" height={24} maxWidth={140} /></div>
            </div>
          </div>

          {/* AU card body */}
          <div style={{ position: "absolute", left: 22, right: 22, top: 62, opacity: auL }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: 1.4, color: C.muted }}>AU SMALL FINANCE BANK</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, marginTop: 4, marginBottom: 8 }}>Dormant Lead Re-engagement</div>
            <Row label="Lead" value={<span style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>Arjun Mehta</span>} icon={<IconBadge size={32}><IconUser size={16} /></IconBadge>} />
            <Row label="AI Voice" p={auVoice} value={<StatusChip label={auVoice > 0.5 ? "Connected" : "Dialing"} tone={auVoice > 0.5 ? "green" : "neutral"} size={12} />} icon={<IconBadge size={32}><IconPhone size={16} /></IconBadge>} />
            <Row label="WhatsApp" p={auWa[0]} value={<StatusChip label={auWa[0] > 0.5 ? "Active" : "Waiting"} tone={auWa[0] > 0.5 ? "green" : "neutral"} size={12} />} icon={<IconBadge size={32}><IconChat size={16} /></IconBadge>} />
            <Row label="Intent" p={auIntent} value={<StatusChip label={auIntent > 0.5 ? "High" : "Detecting"} tone={auIntent > 0.5 ? "solid" : "neutral"} size={12} />} icon={<IconBadge size={32}><IconCheck size={16} color={C.green} /></IconBadge>} />
            <div style={{ marginTop: 8, borderRadius: 14, background: C.green, color: "#fff", padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, opacity: auRm, transform: `translateY(${(1 - auRm) * 10}px) scale(${0.97 + 0.03 * auRm})` }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: C.logoGreen, display: "flex", alignItems: "center", justifyContent: "center" }}><IconCheck size={15} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 1.2, opacity: 0.8 }}>ASSIGNED RM</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>Rahul Sharma</div>
              </div>
            </div>
          </div>

          {/* Piramal card body */}
          <div style={{ position: "absolute", left: 22, right: 22, top: 62, opacity: pL }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: 1.4, color: C.muted }}>PIRAMAL FINANCE</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, marginTop: 4 }}>AI Outreach</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {["Application follow-ups", "Drop-off recovery", "Partner engagement", "Collections"].map((c, i) => (
                <div
                  key={c}
                  style={{
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    lineHeight: 1.3,
                    background: pChips[i] > 0.5 ? C.soft : "#F6F3EC",
                    color: pChips[i] > 0.5 ? C.green : "#A9A89F",
                    border: `1.5px solid ${pChips[i] > 0.5 ? C.accent : "transparent"}`,
                    transform: `scale(${0.97 + 0.03 * pChips[i]})`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: 8, flex: "none", background: pChips[i] > 0.5 ? C.accent : "#DAD6CB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconCheck size={10} />
                  </span>
                  {c}
                </div>
              ))}
            </div>
            {channelRow(pCh, pCh)}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, opacity: pRoute, transform: `translateY(${(1 - pRoute) * 10}px)` }}>
              <StatusChip label="Customer needs RM" tone="warn" size={12} />
              <span style={{ color: C.accent, fontWeight: 700, fontSize: 18 }}>→</span>
              <StatusChip label="Route to RM" tone="solid" size={12} />
            </div>
          </div>
        </Card>

        {/* metric card */}
        <div style={{ position: "relative", marginTop: 16, height: 230 }}>
          <div style={{ position: "absolute", inset: 0, opacity: Math.min(auMetric, auL), transform: `translateY(${(1 - auMetric) * 16}px) scale(${0.97 + 0.03 * auMetric})` }}>
            <Card style={{ height: "100%", background: C.ink, border: "none", padding: "30px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, color: "#fff", lineHeight: 1 }}>
                {fmtIN(auCount)}
                <span style={{ color: C.logoGreen }}>+</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, letterSpacing: 2, color: "#C9CCC6", marginTop: 14 }}>OUTBOUND AI CALLS</div>
            </Card>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: Math.min(pMetric, pL), transform: `translateY(${(1 - pMetric) * 16}px) scale(${0.97 + 0.03 * pMetric})` }}>
            <Card style={{ height: "100%", background: C.ink, border: "none", padding: "30px 30px", display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, color: "#fff", lineHeight: 1 }}>
                {Math.round(pCount)}
                <span style={{ color: C.logoGreen }}>%</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.25, color: "#E4E6E1", opacity: progressAt(t, cues.pMetric + 0.9, 0.35) }}>
                Reduction in
                <br />
                RM Response Time
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
