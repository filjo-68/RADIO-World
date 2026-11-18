import asyncio, sys
from playwright.async_api import async_playwright
src, out = sys.argv[1], sys.argv[2]
JOBS = [('mark.svg', 'icon-192.png', 192), ('mark.svg', 'icon-512.png', 512), ('mark.svg', 'favicon-64.png', 64),
        ('mark-maskable.svg', 'maskable-512.png', 512), ('mark-maskable.svg', 'maskable-192.png', 192), ('mark-maskable.svg', 'apple-touch-icon.png', 180),
        ('mark.svg', 'preview-48.png', 48)]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for svgf, png, n in JOBS:
            pg = await b.new_page(viewport={'width': n, 'height': n})
            svg = open(f'{src}/{svgf}').read().replace('<svg ', f'<svg width="{n}" height="{n}" ', 1)
            await pg.set_content(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
            await pg.screenshot(path=f'{out}/{png}', omit_background=True)
            await pg.close()
        await b.close()
asyncio.run(main())
