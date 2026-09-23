// Root timeline: one paused GSAP timeline for the whole film. index.html
// registers it on window.__timelines under the root data-composition-id. Scene scripts add
// tweens at absolute composition times; nothing here is async.
window.buildRootTimeline = function () {
  const VO = window.VO;
  const TOTAL = VO.total;
  const tl = gsap.timeline({ paused: true });

  // ---- background ambience (slow breathing glows, finite repeats) ----
  const cycle = 8;
  const reps = Math.max(0, Math.floor(TOTAL / cycle) - 1);
  tl.fromTo("#bg .glow-a", { x: 0, y: 0, scale: 1 }, { x: -60, y: -40, scale: 1.12, duration: cycle, ease: "sine.inOut", yoyo: true, repeat: reps }, 0);
  tl.fromTo("#bg .glow-b", { x: 0, y: 0 }, { x: 50, y: 30, duration: cycle * 1.25, ease: "sine.inOut", yoyo: true, repeat: Math.max(0, Math.floor(TOTAL / (cycle * 1.25)) - 1) }, 0);
  tl.fromTo("#bg .bg-dots", { x: 0, y: 0 }, { x: -30, y: -30, duration: TOTAL, ease: "none" }, 0);

  // ---- persistent header ----
  const brand = document.querySelector("#hdr .brand");
  const counter = document.querySelector("#hdr .story-counter");
  const nums = Array.from(document.querySelectorAll("#hdr .counter-num span"));
  const ticks = Array.from(document.querySelectorAll("#hdr .tick i"));
  tl.fromTo(brand, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0.1);
  tl.fromTo(counter, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
  tl.fromTo(ticks, { scaleX: 0 }, { scaleX: 0, duration: 0.01 }, 0);
  tl.fromTo(nums, { yPercent: 110 }, { yPercent: 110, duration: 0.01 }, 0);
  const STORIES = ["s02", "s03", "s04", "s05", "s06"];
  STORIES.forEach((sid, i) => {
    const at = VO.scenes[sid].start;
    if (i === 0) tl.to(counter, { opacity: 1, duration: 0.4 }, at + 0.1);
    if (i > 0) tl.to(nums[i - 1], { yPercent: -110, duration: 0.45, ease: "power3.inOut" }, at - 0.1);
    tl.fromTo(nums[i], { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: "power3.inOut", immediateRender: false }, at - 0.1);
    tl.to(ticks[i], { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, at + 0.1);
  });
  tl.to(counter, { opacity: 0, duration: 0.4 }, VO.scenes.s07.start - 0.3);
  tl.to(brand, { opacity: 0, duration: 0.3 }, VO.scenes.s08.start - 0.1);

  // ---- scenes ----
  ["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08"].forEach((id) => {
    window.Scenes[id](tl, document.getElementById(id));
  });

  return tl;
};
