import React from "react";
import { C, FONT, MONO, SECTIONS } from "../theme";
import {
  Card,
  DoubleTickLogo,
  Eyebrow,
  IconBadge,
  IconChat,
  IconCheck,
  IconPhone,
  IconUser,
  Phone,
  Reveal,
  StatusBar,
  progressAt,
} from "../ui";

const STEPS = [
  { name: "AI Voice", state: "Connected", icon: IconPhone },
  { name: "WhatsApp", state: "Engaged", icon: IconChat },
  { name: "RM", state: "Assigned", icon: IconUser },
];

export const Cta: React.FC<{ t: number }> = ({ t }) => {
  const [s] = SECTIONS.cta;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 64, top: 238, width: 540 }}>
        <Reveal at={s + 0.05}>
          <Eyebrow>AI-powered customer engagement</Eyebrow>
        </Reveal>
        <Reveal at={s + 0.2} style={{ marginTop: 22 }}>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1.6, lineHeight: 1.06, color: C.ink }}>
            Turn more leads
            <br />
            into <span style={{ color: C.accent }}>real conversations.</span>
          </div>
        </Reveal>
        <Reveal at={s + 0.45} style={{ marginTop: 22 }}>
          <div style={{ fontSize: 23, color: C.muted, fontWeight: 400 }}>AI Voice + WhatsApp + RM workflows</div>
        </Reveal>
        <Reveal at={s + 0.75} scale style={{ marginTop: 42 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.green, color: "#fff", fontSize: 26, fontWeight: 600, padding: "22px 36px", borderRadius: 999, boxShadow: "0 22px 36px -18px rgba(23,77,59,0.75)" }}>
            Book a Demo
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>
        </Reveal>
        <Reveal at={s + 1.0} style={{ marginTop: 24 }}>
          <div style={{ fontSize: 21, fontWeight: 500, color: C.charcoal }}>Book your DoubleTick demo today.</div>
        </Reveal>
      </div>

      {/* phone / workflow hybrid */}
      <Reveal at={s + 0.3} y={34} scale style={{ position: "absolute", left: 648, top: 250 }}>
        <Phone width={368} height={590}>
          <StatusBar />
          <div style={{ padding: "18px 22px 0" }}>
            <DoubleTickLogo width={128} />
            <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, marginTop: 20 }}>Lead · Neha Shah</div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.muted, letterSpacing: 1, marginTop: 4 }}>PERSONAL LOAN · ROUTING</div>
          </div>
          <div style={{ padding: "22px 18px", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
            {STEPS.map((st, i) => {
              const p = progressAt(t, s + 0.8 + i * 0.4, 0.35);
              const Icon = st.icon;
              return (
                <React.Fragment key={st.name}>
                  {i > 0 ? (
                    <div style={{ alignSelf: "center", width: 2, height: 26, background: p > 0.5 ? C.accent : C.border, margin: "2px 0" }} />
                  ) : null}
                  <Card style={{ borderRadius: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: 0.35 + 0.65 * p, transform: `scale(${0.97 + 0.03 * p})`, boxShadow: "none", background: i === 2 && p > 0.5 ? C.soft : "#fff", borderColor: p > 0.5 ? C.accent : C.border }}>
                    <IconBadge size={44} bg={i === 2 ? C.green : C.soft}>
                      <Icon size={22} color={i === 2 ? "#fff" : C.green} />
                    </IconBadge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: C.ink }}>{st.name}</div>
                      <div style={{ fontSize: 17, color: C.accent, fontWeight: 500, marginTop: 2 }}>{st.state}</div>
                    </div>
                    <div style={{ width: 26, height: 26, borderRadius: 13, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", opacity: p }}>
                      <IconCheck size={14} />
                    </div>
                  </Card>
                </React.Fragment>
              );
            })}
          </div>
        </Phone>
      </Reveal>

      {/* capability tags */}
      {[
        { l: "AI Voice", x: 64, y: 790 },
        { l: "WhatsApp", x: 208, y: 790 },
        { l: "RM Routing", x: 366, y: 790 },
      ].map((tag, i) => {
        const p = progressAt(t, s + 1.5 + i * 0.15, 0.4);
        return (
          <div key={tag.l} style={{ position: "absolute", left: tag.x, top: tag.y, opacity: p, transform: `translateY(${(1 - p) * 10}px) scale(${0.97 + 0.03 * p})`, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 999, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 600, color: C.ink, boxShadow: "0 14px 28px -16px rgba(60,50,30,0.45)" }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: C.accent }} />
            {tag.l}
          </div>
        );
      })}
    </div>
  );
};
