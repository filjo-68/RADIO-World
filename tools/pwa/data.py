"""Build slim station snapshots + countries.json for the PWA from radio-browser dumps."""
import json, glob, os, sys
src, out = sys.argv[1], sys.argv[2]
os.makedirs(os.path.join(out, 'data', 'stations'), exist_ok=True)
countries = []
total = 0
for f in sorted(glob.glob(os.path.join(src, '*.json'))):
    cc = os.path.basename(f)[:2].upper()
    raw = json.load(open(f, encoding='utf-8'))
    slim = []
    seen = set()
    for s in raw:
        url = (s.get('url_resolved') or s.get('url') or '').strip()
        uid = s.get('stationuuid')
        if not url.startswith(('http://', 'https://')) or not uid or uid in seen:
            continue
        seen.add(uid)
        tags = [t.strip() for t in (s.get('tags') or '').split(',') if t.strip()][:4]
        slim.append({
            'i': uid, 'n': (s.get('name') or '').strip()[:120], 'u': url,
            'f': (s.get('favicon') or '').strip(), 'c': (s.get('codec') or '').strip(),
            'b': int(s.get('bitrate') or 0), 'h': 1 if s.get('hls') else 0,
            'v': int(s.get('votes') or 0), 'k': int(s.get('clickcount') or 0), 't': tags,
        })
    slim.sort(key=lambda x: (-x['k'], -x['v'], x['n'].lower()))
    total += len(slim)
    countries.append({'c': cc, 'n': len(slim)})
    with open(os.path.join(out, 'data', 'stations', cc + '.json'), 'w', encoding='utf-8') as fh:
        json.dump(slim, fh, ensure_ascii=False, separators=(',', ':'))
with open(os.path.join(out, 'data', 'countries.json'), 'w', encoding='utf-8') as fh:
    json.dump({'snapshot': '2026-11-18', 'countries': countries}, fh, separators=(',', ':'))
print('countries', len(countries), 'stations', total)
