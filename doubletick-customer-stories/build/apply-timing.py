"""Stamp narration-driven timings into index.html.

- scene clip data-start / data-duration (with ~0.6 s overlap for seams)
- root / bg / vo / music durations
- music volume automation lane: ~4 dB duck under narration, lift in the recap
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, "build/vo-timing.json")))
html_path = os.path.join(ROOT, "index.html")
html = open(html_path).read()
total = T["total"]
S = T["scenes"]

def set_attr(elem_id, attr, value):
    global html
    pat = re.compile(r'(<[^>]*\bid="%s"[^>]*?\b%s=")[^"]*(")' % (re.escape(elem_id), attr))
    html, n = pat.subn(lambda m: m.group(1) + value + m.group(2), html, count=1)
    assert n == 1, (elem_id, attr)

OVERLAP = {"s07": 0.8}
for sid, sc in S.items():
    start = 0.0 if sid == "s01" else sc["start"]
    if sid == "s08":
        start = sc["start"] - 0.3  # CTA wipe begins over the recap
    end = sc["end"] + (0 if sid == "s08" else OVERLAP.get(sid, 0.6))
    set_attr(sid, "data-start", f"{start:.3f}")
    set_attr(sid, "data-duration", f"{end - start:.3f}")
for eid in ("root", "bg", "vo", "music"):
    set_attr(eid, "data-duration", f"{total:.3f}")
set_attr("hdr", "data-duration", f"{S['s08']['start'] + 0.3:.3f}")

# ---- music duck lane ----
BASE, DUCK, LIFT = 0.42, 0.26, 0.52   # DUCK/BASE = -4.2 dB
ATT, REL, BRIDGE = 0.25, 0.45, 1.2
spans = sorted((l["start"], l["end"]) for l in T["lines"].values())
merged = []
for s, e in spans:
    if merged and s - merged[-1][1] < BRIDGE:
        merged[-1][1] = e
    else:
        merged.append([s, e])
pts = [(0.0, 0.0), (0.5, BASE)]
recap_s, recap_e = S["s07"]["start"], S["s08"]["start"]
for s, e in merged:
    pts += [(s - ATT, BASE), (s, DUCK), (e, DUCK), (e + REL, BASE)]
    if e < recap_s <= e + 4 and not any(p[0] >= recap_s for p in pts):
        pass
pts += [(recap_s - 0.3, BASE), (recap_s + 0.4, LIFT), (recap_e + 0.2, LIFT)]
pts = sorted(pts)
# keep the recap lift clean: drop BASE points that fall inside it
pts = [p for p in pts if not (recap_s + 0.4 < p[0] < recap_e + 0.2 and p[1] == BASE)]
# CTA narration duck after the lift
cta = [m for m in merged if m[0] >= recap_e]
pts = [p for p in pts if p[0] <= recap_e + 0.2] + [(recap_e + 0.6, BASE)]
for s, e in cta:
    pts += [(s - ATT, BASE), (s, DUCK), (e, DUCK), (e + REL, BASE)]
pts += [(total - 0.05, BASE)]
pts = sorted({round(t, 3): v for t, v in pts if 0 <= t <= total}.items())
lane = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": t, "v": v} for t, v in pts]}]}
set_attr("music", "data-automation", json.dumps(lane, separators=(",", ":")).replace('"', "&quot;"))
open(html_path, "w").write(html)
print("stamped", len(pts), "automation points; total", total)
