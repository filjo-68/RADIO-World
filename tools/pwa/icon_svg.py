"""Radio World app mark: dotted-meridian globe + broadcast waves on an aurora field."""
import sys

def svg(maskable=False, transparent_corners=True):
    s = 0.76 if maskable else 1.0          # keep glyph inside the maskable safe zone
    tx = 256 * (1 - s)
    bg = '<rect width="512" height="512" fill="url(#bg)"/>' if maskable else '<rect width="512" height="512" rx="118" fill="url(#bg)"/>'
    glow = '<rect width="512" height="512" fill="url(#glow)"/>' if maskable else '<rect width="512" height="512" rx="118" fill="url(#glow)"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs>
  <radialGradient id="bg" cx="18%" cy="92%" r="120%">
    <stop offset="0" stop-color="#FF3D8B"/><stop offset=".42" stop-color="#7B2FF7"/><stop offset=".78" stop-color="#2A1170"/><stop offset="1" stop-color="#140A36"/>
  </radialGradient>
  <radialGradient id="glow" cx="82%" cy="14%" r="55%">
    <stop offset="0" stop-color="#5BE3FF" stop-opacity=".5"/><stop offset="1" stop-color="#5BE3FF" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="wave" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9F6FF"/></linearGradient>
  <clipPath id="g"><circle cx="230" cy="284" r="150"/></clipPath>
</defs>
{bg}{glow}
<g transform="translate({tx} {tx}) scale({s})">
  <g clip-path="url(#g)" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="9">
    <ellipse cx="230" cy="284" rx="66" ry="150"/>
    <ellipse cx="230" cy="284" rx="150" ry="52"/>
    <path d="M80 284h300M230 134v300"/>
  </g>
  <circle cx="230" cy="284" r="150" fill="none" stroke="#fff" stroke-width="22"/>
  <g fill="none" stroke="url(#wave)" stroke-width="22" stroke-linecap="round">
    <path d="M340 128a62 62 0 0 1 56 56"/>
    <path d="M346 66a124 124 0 0 1 112 112"/>
  </g>
  <circle cx="336" cy="180" r="24" fill="#FFFFFF"/>
  <circle cx="336" cy="180" r="24" fill="none" stroke="#FF3D8B" stroke-width="9"/>
</g>
</svg>'''

if __name__ == '__main__':
    out = sys.argv[1]
    open(out + '/mark.svg', 'w').write(svg())
    open(out + '/mark-maskable.svg', 'w').write(svg(maskable=True))
    print('ok')
