"""Generate the 16:9 (1920x1080) composition from the square index.html.

Usage: python3 scripts/make_16x9.py   (run from the project root)
Writes index-16x9.html. Timing, audio and copy are shared with the square cut;
only layout coordinates change, so re-run this after editing index.html.
"""

s = open("index.html").read()


def sub(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f"expected {count}x, found {n}: {old[:70]!r}"
    s = s.replace(old, new)


# ---------- canvas ----------
sub('data-resolution="square"', 'data-resolution="landscape"')
sub('content="width=1080, height=1080"', 'content="width=1920, height=1080"')
sub('data-width="1080"', 'data-width="1920"')
sub(
    """      html,
      body {
        width: 1080px;""",
    """      html,
      body {
        width: 1920px;""",
)

# ---------- layout overrides (later rules win) ----------
OVERRIDES = """
      /* ===== 16:9 layout ===== */
      .headline { left: 120px; width: 1680px; }
      .sub span { max-width: 1400px; }
      #s1-rows { width: 1920px; }
      #s1-card { left: 680px; }
      #s1-big, #s1-sub { width: 1920px; }
      #s1-big { font-size: 160px; }
      .col { width: 520px; }
      #s2-focus-bg { width: 520px; }
      #s2-manual { left: 120px; width: 1680px; }
      #s2-bar, #s2-bar i { width: 560px; }
      #s3-h { left: 120px; top: 360px; width: 580px; font-size: 80px; }
      #s3-sub { left: 120px; top: 560px; font-size: 28px; }
      #dash { left: 760px; top: 256px; width: 1040px; }
      .c1 { width: 330px; }
      .c2 { width: 214px; }
      #s4-call { left: 120px; width: 820px; }
      #s4-intel { left: 980px; width: 820px; }
      #wave, #bubble { width: 764px; }
      .flow { left: 120px; width: 1680px; }
      .node { width: 300px; }
      .link { width: 140px; }
      .qcard, #tray { left: 120px; width: 560px; }
      #rm { left: 1100px; width: 600px; }
      #toast { left: 1150px; width: 440px; }
      #k-eyebrow, .knum, .klabel, #pipe-l { width: 1920px; }
      .knum { font-size: 186px; }
      #rings { left: 710px; }
      #goldframe { left: 570px; }
      #pipe { left: 720px; }
      #recov { left: 770px; }
      #s9-h { width: 1920px; }
      #hub { left: 880px; }
      #paths { width: 1920px; }
      .lockup { width: 1920px; }
"""
sub("    </style>\n  </head>", OVERRIDES + "    </style>\n  </head>")

# ---------- inline positions ----------
sub('id="col-a" style="left: 72px"', 'id="col-a" style="left: 120px"')
sub('id="col-b" style="left: 392px"', 'id="col-b" style="left: 700px"')
sub('id="col-c" style="left: 712px"', 'id="col-c" style="left: 1280px"')
sub('<div class="link" style="left: 200px; width: 50px">', '<div class="link" style="left: 310px">')
sub('<div class="node" style="left: 247px">', '<div class="node" style="left: 460px">')
sub('<div class="link" style="left: 447px; width: 50px">', '<div class="link" style="left: 770px">')
sub('<div class="node" style="left: 493px">', '<div class="node" style="left: 920px">')
sub('<div class="link" style="left: 693px; width: 50px">', '<div class="link" style="left: 1230px">')
sub('<div class="node" style="left: 740px">', '<div class="node" style="left: 1380px">')
sub('viewBox="0 0 1080 1080"', 'viewBox="0 0 1920 1080"')
sub('d="M330 540 H455"', 'd="M590 540 H875"')
sub('d="M625 540 H750"', 'd="M1045 540 H1330"')
sub('id="left-stack" style="left: 100px"', 'id="left-stack" style="left: 360px"')
sub('<div class="slabel" style="left: 80px">', '<div class="slabel" style="left: 340px">')
sub('<div class="slabel" style="left: 410px;', '<div class="slabel" style="left: 830px;')
sub('id="right-stack" style="left: 760px"', 'id="right-stack" style="left: 1340px"')
sub('<div class="slabel" style="left: 740px;', '<div class="slabel" style="left: 1320px;')

# ---------- choreography coordinates ----------
sub("[70, 390, 710].forEach((x) => {", "[60, 380, 700, 1020, 1340, 1660].forEach((x) => {")
sub("for (let i = 0; i < 30; i++) wave.appendChild", "for (let i = 0; i < 52; i++) wave.appendChild")
sub("const x = 540 - 66 + side * (220 + rand() * 230);", "const x = 960 - 66 + side * (300 + rand() * 420);")
sub('{ x: -640, y: -50, scale: 1, duration: 0.75, ease: "power3.inOut" }', '{ x: -520, y: -77, scale: 1, duration: 0.75, ease: "power3.inOut" }')
sub('{ scaleX: 936 / 296, duration: 0.6, ease: "power3.inOut" }', '{ scaleX: 1040 / 520, duration: 0.6, ease: "power3.inOut" }')
sub('transformOrigin: "540px 743px"', 'transformOrigin: "1280px 696px"')
sub('transformOrigin: "300px 500px"', 'transformOrigin: "560px 500px"')
sub("const nodeX = [0, 247, 493, 740].map((x) => x + 98 - 26);", "const nodeX = [0, 460, 920, 1380].map((x) => x + 150 - 26);")
sub("{ x: 560 + 24 - 72,", "{ x: 1100 + 24 - 120,")
sub('transformOrigin: "540px 560px"', 'transformOrigin: "960px 560px"')
sub("{ x: 540 - 66 - s.x, y: 812 - 13 - s.y,", "{ x: 960 - 66 - s.x, y: 812 - 13 - s.y,")
sub('transformOrigin: "540px 480px"', 'transformOrigin: "960px 480px"')
sub("{ strokeDashoffset: 125, opacity: 0 }", "{ strokeDashoffset: 290, opacity: 0 }", count=2)
sub('{ opacity: 0, x: 296, y: 523 }', '{ opacity: 0, x: 563, y: 523 }')
sub('tl.to("#hop", { x: 523,', 'tl.to("#hop", { x: 860,')
sub('transformOrigin: "540px 520px"', 'transformOrigin: "960px 520px"')

open("index-16x9.html", "w").write(s)
print("wrote index-16x9.html")
