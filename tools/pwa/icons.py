import sys, os
from PIL import Image, ImageDraw
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
A1, A2 = (236, 52, 108), (140, 36, 170)

def draw(size, maskable=False, radius_frac=0.22):
    S = size * 4  # supersample
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    grad = Image.new('RGBA', (S, S))
    gd = ImageDraw.Draw(grad)
    for y in range(S):
        t = y / (S - 1)
        gd.line([(0, y), (S, y)], fill=tuple(int(A1[i] + (A2[i] - A1[i]) * t) for i in range(3)) + (255,))
    mask = Image.new('L', (S, S), 0)
    md = ImageDraw.Draw(mask)
    if maskable:
        md.rectangle([0, 0, S, S], fill=255)
    else:
        md.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * radius_frac), fill=255)
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)
    scale = 0.62 if maskable else 0.8   # keep glyph inside maskable safe zone
    cx, cy = S / 2, S * 0.5
    u = S * scale / 10
    w = max(2, int(u * 0.75))
    white = (255, 255, 255, 255)
    # centre dot
    r = u * 0.9
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=white)
    # broadcast arcs left/right
    for k, rr in enumerate((2.3, 3.8)):
        R = u * rr
        box = [cx - R, cy - R, cx + R, cy + R]
        d.arc(box, start=-40, end=40, fill=white, width=w)
        d.arc(box, start=140, end=220, fill=white, width=w)
    return img.resize((size, size), Image.LANCZOS)

draw(192).save(os.path.join(out, 'icon-192.png'))
draw(512).save(os.path.join(out, 'icon-512.png'))
draw(512, maskable=True).save(os.path.join(out, 'maskable-512.png'))
draw(180, maskable=True).convert('RGB').save(os.path.join(out, 'apple-touch-icon.png'))
draw(64).save(os.path.join(out, 'favicon-64.png'))
print('ok')
