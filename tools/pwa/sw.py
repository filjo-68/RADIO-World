import sys, os, json, hashlib, glob
root = sys.argv[1]
files = ['./', 'index.html', 'styles.css', 'i18n.js', 'app.js', 'globe.js', 'manifest.webmanifest', 'data/countries.json', 'data/globe.json',
         'vendor/hls.light.min.js', 'LICENSE.txt', 'THIRD_PARTY_NOTICES.txt', 'icons/favicon.svg']
files += sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, 'fonts', '*.woff2')))
files += sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, 'icons', '*.png')))
files += sorted(os.path.relpath(p, root) for p in glob.glob(os.path.join(root, 'flags', '*.png')))
h = hashlib.sha256()
for f in files:
    if f != './':
        h.update(f.encode()); h.update(open(os.path.join(root, f), 'rb').read())
tpl = open(os.path.join(os.path.dirname(__file__), 'sw.template.js')).read()
out = tpl.replace('__VERSION__', h.hexdigest()[:10]).replace('__PRECACHE__', json.dumps(files, indent=0))
open(os.path.join(root, 'sw.js'), 'w').write(out)
print('precache', len(files), 'version', h.hexdigest()[:10])
