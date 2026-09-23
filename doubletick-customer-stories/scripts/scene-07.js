// SCENE 07 — Customer proof recap (no narration: strict PDF-only VO).
// Five customer cards, each showing one metric already shown in its story.
// Carousel: smooth horizontal steps, focused card 0.96 -> 1 with green accent,
// neighbours partially visible. Music carries the lift.
window.Scenes.s07 = function (tl, section) {
  const H = window.HF;
  const { el, place, scene } = H;
  const D = window.customerData;
  const S = scene("s07");

  const label = el("span", "eyebrow", D.opening.eyebrow);
  place(label, 80, 176);
  label.style.position = "absolute";

  const CARD_W = 540;
  const GAP = 36;
  const STEP = CARD_W + GAP;
  const track = el("div", "rc-track");
  place(track, 0, 300, STEP * 5, 420);
  const cards = D.recap.map((rc, i) => {
    const c = D.customers.find((x) => x.id === rc.id);
    const m = c.impact[rc.metric];
    const card = el("div", "rc-card");
    place(card, i * STEP, 0, CARD_W, 420);
    card.append(
      el("span", "accent"),
      el("span", "eyebrow", c.label),
      el("span", "cust-name", c.name),
      el("span", "rc-value", m.value),
      el("span", "rc-label", m.label),
    );
    track.append(card);
    return card;
  });
  section.append(label, track);

  // track x so that card k is centred on the frame
  const xFor = (k) => 540 - (k * STEP + CARD_W / 2);
  const t0 = S.start;
  const stops = [t0 + 0.2, t0 + 1.35, t0 + 2.45, t0 + 3.55, t0 + 4.65];

  tl.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, t0 + 0.1);
  tl.fromTo(track, { x: xFor(0) + 220, opacity: 0 }, { x: xFor(0), opacity: 1, duration: 0.7, ease: "expo.out" }, t0 - 0.05);
  tl.fromTo(cards, { scale: 0.96, opacity: 0.5 }, { scale: 0.96, opacity: 0.5, duration: 0.01 }, t0 - 0.05);

  // hand-off: the recap clears as the CTA's dark-green wipe covers the frame
  tl.to([label, track], { opacity: 0, duration: 0.35, ease: "power2.in" }, S.end - 0.1);

  stops.forEach((at, k) => {
    if (k > 0) {
      tl.to(track, { x: xFor(k), duration: 0.6, ease: "power2.inOut" }, at - 0.45);
      tl.to(cards[k - 1], { scale: 0.96, opacity: 0.5, borderColor: "#DFE6E1", duration: 0.45, ease: "power2.inOut" }, at - 0.45);
      tl.to(cards[k - 1].querySelector(".accent"), { scaleX: 0, duration: 0.3 }, at - 0.45);
    }
    tl.to(cards[k], { scale: 1, opacity: 1, borderColor: "#28B379", duration: 0.5, ease: "power3.out" }, at - 0.2);
    tl.fromTo(cards[k].querySelector(".accent"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, at - 0.1);
  });
};
