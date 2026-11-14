"""Rebuild the blocky palette-mode clouds texture into a smooth luminance
map suitable for use as a THREE alphaMap (white clouds on black)."""
from PIL import Image, ImageFilter

src = Image.open("/home/z/my-project/public/ofi/earth3d/earth_clouds_1024.png").convert("RGBA")
# composite clouds over black so density maps to luminance
bg = Image.new("RGBA", src.size, (0, 0, 0, 255))
comp = Image.alpha_composite(bg, src).convert("L")
# smooth the hard pixel steps + soften edges
comp = comp.filter(ImageFilter.GaussianBlur(radius=1.4))
comp = comp.point(lambda v: min(255, int(v * 1.25)))  # restore some contrast
comp = comp.convert("RGB")
out = "/home/z/my-project/public/ofi/earth3d/earth_clouds_1024.jpg"
comp.save(out, "JPEG", quality=85)
import os
print("saved", out, os.path.getsize(out) // 1024, "KB")
