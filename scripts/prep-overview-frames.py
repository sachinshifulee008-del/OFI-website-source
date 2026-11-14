#!/usr/bin/env python3
"""
prep-overview-frames.py — convert the uploaded cinematic mp4 into a scroll-scrub
frame sequence for the OFI Overview page.

Steps:
  1. ffmpeg samples every 8th frame of the 752-frame / 60 fps / 12.53 s source
     -> 94 JPG frames at 1280 px wide (the literal "convert to jpg" step).
  2. Pillow re-encodes each frame to WebP (q70, method 6) into
     public/ofi/overview-seq/frame-01.webp ... frame-94.webp
     (WebP keeps the on-site payload a few MB instead of ~20 MB of JPG).

Output count must stay in sync with FRAME_COUNT in
src/components/ofi/views/OverviewScrollSequence.tsx.
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image

SRC = Path("/home/z/my-project/upload/original-6165a7947c44b2d1671cd82a878ea41b.mp4")
TMP_JPG = Path("/tmp/overview-jpg")
OUT_DIR = Path("/home/z/my-project/public/ofi/overview-seq")
STRIDE = 8          # sample every 8th source frame (60 fps -> 7.5 fps scrub)
TARGET_W = 1280     # source is 1600x1200 (4:3) -> 1280x960
WEBP_Q = 70


def main() -> None:
    TMP_JPG.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ---- step 1: ffmpeg -> JPG frames (every 8th frame, scaled) ----
    cmd = [
        "ffmpeg", "-v", "error", "-i", str(SRC),
        "-vf", f"select='not(mod(n,{STRIDE}))',scale={TARGET_W}:-2",
        "-vsync", "vfr", "-q:v", "2",
        str(TMP_JPG / "f-%03d.jpg"),
    ]
    print("extracting JPG frames ...")
    subprocess.run(cmd, check=True)
    jpgs = sorted(TMP_JPG.glob("f-*.jpg"))
    print(f"extracted {len(jpgs)} JPG frames")
    if not jpgs:
        sys.exit("no frames extracted")

    # ---- step 2: JPG -> optimized WebP ----
    total = 0
    for i, jpg in enumerate(jpgs, start=1):
        img = Image.open(jpg).convert("RGB")
        out = OUT_DIR / f"frame-{i:02d}.webp"
        img.save(out, "WEBP", quality=WEBP_Q, method=6)
        total += out.stat().st_size
        if i % 20 == 0 or i == len(jpgs):
            print(f"  {i}/{len(jpgs)} frames encoded")

    print(f"done: {len(jpgs)} webp frames, {total / 1_048_576:.2f} MiB total -> {OUT_DIR}")


if __name__ == "__main__":
    main()
