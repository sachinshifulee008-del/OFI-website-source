"""Convert the 48 uploaded Earth JPG frames into optimized WebP sequence for the
scroll-scrubbed landing animation. 1280px wide, q72, stripped metadata."""
import os
from PIL import Image

SRC = "/home/z/my-project/upload/extracted"
DST = "/home/z/my-project/public/ofi/earth-seq"
os.makedirs(DST, exist_ok=True)

files = sorted(f for f in os.listdir(SRC) if f.startswith("ezgif-frame-"))
total = 0
for i, name in enumerate(files, 1):
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    w = 1280
    h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    out = os.path.join(DST, f"frame-{i:02d}.webp")
    im.save(out, "WEBP", quality=72, method=6)
    total += os.path.getsize(out)
    if i in (1, 24, 48):
        print(f"{i:02d}: {os.path.getsize(out)//1024}KB")

print(f"frames: {len(files)}  total: {total/1024/1024:.1f}MB")
