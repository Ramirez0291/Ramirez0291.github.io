# Regenerate the depth maps used by the homepage intro (src/scripts/genesis).
# For every public/intro/<key>.webp, writes public/intro/<key>-depth.webp: grayscale, 255 = nearest,
# 512 px on the long side, lightly blurred so the 2.5D parallax does not tear at sharp edges.
#
#   pip install torch transformers pillow numpy
#   python scripts/intro-depth.py public/intro
#
# Model: Depth Anything V2 Small (downloaded from Hugging Face on first run, ~100 MB).
import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageFilter
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

src_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "public/intro")
model_id = "depth-anything/Depth-Anything-V2-Small-hf"
proc = AutoImageProcessor.from_pretrained(model_id)
model = AutoModelForDepthEstimation.from_pretrained(model_id).eval()

for f in sorted(src_dir.glob("*.webp")):
    if f.stem.endswith("-depth"):
        continue
    img = Image.open(f).convert("RGB")
    W, H = img.size
    work = img.copy()
    work.thumbnail((1400, 1400), Image.LANCZOS)
    inputs = proc(images=work, return_tensors="pt")
    with torch.no_grad():
        pred = model(**inputs).predicted_depth  # relative inverse depth: larger = closer
    d = torch.nn.functional.interpolate(pred.unsqueeze(1), size=(work.height, work.width), mode="bicubic", align_corners=False)[0, 0].numpy()
    lo, hi = np.percentile(d, 1.5), np.percentile(d, 99.5)
    d = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
    out = Image.fromarray((d * 255).astype(np.uint8), "L")
    tw = 512 if W >= H else round(512 * W / H)
    th = round(tw * H / W)
    out = out.resize((tw, th), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))
    dst = src_dir / f"{f.stem}-depth.webp"
    out.save(dst, "WEBP", quality=88)
    print(dst.name, out.size)
