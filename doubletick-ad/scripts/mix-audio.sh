#!/usr/bin/env bash
# Builds assets/audio/mix.wav: edited VO + ducked music bed + UI SFX.
# All times are video-timeline seconds. Re-run after changing any timing.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=assets/source
OUT=assets/audio
DUR=34.0
VO_OFFSET_MS=300

# 1) VO: trim two long inter-scene breaths (1.15s -> 0.6s, 1.02s -> 0.55s), normalise to -16 LUFS.
ffmpeg -y -loglevel error -i "$SRC/vo-aaditya-raw.mp3" -filter_complex "\
[0:a]atrim=0:19.50,asetpts=PTS-STARTPTS[a];\
[0:a]atrim=20.05:27.70,asetpts=PTS-STARTPTS[b];\
[0:a]atrim=28.17,asetpts=PTS-STARTPTS[c];\
[a][b][c]concat=n=3:v=0:a=1,aresample=48000,pan=stereo|c0=c0|c1=c0,\
highpass=f=70,loudnorm=I=-16:TP=-2:LRA=9[vo]" -map "[vo]" -ar 48000 "$OUT/vo.wav"

# 2) Full mix. Music sits ~18 dB under VO, is side-chain ducked by the VO,
#    lifts after the last line (CTA) and fades out at the end.
ffmpeg -y -loglevel error \
  -i "$OUT/vo.wav" -i "$SRC/music-bed.mp3" \
  -i "$SRC/sfx-whoosh.mp3" -i "$SRC/sfx-tick.mp3" -i "$SRC/sfx-notify.mp3" -i "$SRC/sfx-click.mp3" \
  -filter_complex "\
[0:a]adelay=${VO_OFFSET_MS}|${VO_OFFSET_MS},apad,atrim=0:${DUR}[vo];\
[vo]asplit=2[vomix][vosc];\
[1:a]aresample=48000,atrim=0:${DUR},asetpts=PTS-STARTPTS,\
volume='if(lt(t,32.9),0.20,0.20+0.16*min(1,(t-32.9)/0.5))':eval=frame,\
afade=t=in:st=0:d=0.8,afade=t=out:st=$(echo "$DUR-1.1" | bc):d=1.1[mus];\
[mus][vosc]sidechaincompress=threshold=0.03:ratio=3:attack=40:release=450:makeup=1[musd];\
[2:a]asplit=4[w1][w2][w3][w4];\
[w1]volume=0.22,adelay=6250|6250[W1];[w2]volume=0.20,adelay=13350|13350[W2];\
[w3]volume=0.22,adelay=19250|19250[W3];[w4]volume=0.22,adelay=26850|26850[W4];\
[3:a]asplit=6[t1][t2][t3][t4][t5][t6];\
[t1]volume=0.30,adelay=8000|8000[T1];[t2]volume=0.30,adelay=9000|9000[T2];\
[t3]volume=0.30,adelay=10200|10200[T3];[t4]volume=0.30,adelay=11400|11400[T4];\
[t5]volume=0.22,adelay=24950|24950[T5];[t6]volume=0.22,adelay=25950|25950[T6];\
[4:a]asplit=2[n1][n2];[n1]volume=0.40,adelay=12400|12400[N1];[n2]volume=0.45,adelay=14000|14000[N2];\
[5:a]asplit=2[c1][c2];[c1]volume=0.35,adelay=17900|17900[C1];[c2]volume=0.28,adelay=29400|29400[C2];\
[vomix][musd][W1][W2][W3][W4][T1][T2][T3][T4][T5][T6][N1][N2][C1][C2]amix=inputs=16:normalize=0:duration=first,\
atrim=0:${DUR},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
  -ac 2 -ar 48000 "$OUT/mix.wav"

ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/mix.wav"
