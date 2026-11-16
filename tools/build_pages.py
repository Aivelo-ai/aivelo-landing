#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère les pages SEO nationales à partir du gabarit creation-site-web-bordeaux.html.

    python3 tools/build_pages.py

- le contenu de chaque page est dans tools/pages_data.py (PAGES) ;
- l'en-tête, le menu, les réalisations, la méthode, le contact et le pied de page viennent du gabarit :
  une modification du gabarit se propage en relançant le script ;
- le script met aussi à jour sitemap.xml et la rangée de liens « Par métier » du pied de toutes les pages.
"""
import datetime
import glob
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages_data import PAGES, RELATED  # noqa: E402

TEMPLATE = 'creation-site-web-bordeaux.html'
BASE = 'https://aivelo.fr'
ARROW = '<svg class="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'
PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="13" rx="2.5" fill="#1F2B48"/><rect x="4.3" y="6.8" width="15.4" height="9.4" rx="1.2" fill="#4F7EF7"/><circle cx="12" cy="10.4" r="2" fill="#fff"/><path d="M8.4 16.2a3.6 3.6 0 0 1 7.2 0Z" fill="#fff"/><rect x="8" y="19" width="8" height="1.6" rx=".8" fill="#1F2B48"/></svg>'


def text(s):
    """HTML → texte brut (pour les données structurées)."""
    return html.unescape(re.sub(r'<[^>]+>', '', s)).replace('\xa0', ' ').strip()


def cut(s, start, end):
    a = s.index(start)
    return a, s.index(end, a)


def tiles(items):
    out = []
    for i, (h, p) in enumerate(items, 1):
        out.append(f'''      <article class="local-tile" data-reveal>
        <span class="local-num">{i:02d}</span>
        <h3>{h}</h3>
        <p>{p}</p>
      </article>''')
    return '\n'.join(out)


def grid_section(sec_id, d):
    return f'''<section class="section local-why" id="{sec_id}">
  <div class="container">
    <header class="section-head section-head--center">
      <p class="eyebrow" data-reveal>{d['eyebrow']}</p>
      <h2 class="section-title" data-split>{d['h2']}</h2>
      <p class="section-lead" data-reveal>{d['lead']}</p>
    </header>
    <div class="local-grid">
{tiles(d['tiles'])}
    </div>
  </div>
</section>'''


def faq_section(p):
    items = []
    for i, (q, a) in enumerate(p['faq']):
        qh = q.replace(' ?', '&nbsp;?')
        items.append(f'''      <div class="acc-item" data-reveal>
        <h3><button class="acc-btn" aria-expanded="false" aria-controls="acc-{i}" id="acc-btn-{i}">{qh}<i aria-hidden="true"></i></button></h3>
        <div class="acc-panel" id="acc-{i}" role="region" aria-labelledby="acc-btn-{i}"><div><p>{a}</p></div></div>
      </div>''')
    return f'''<section class="section faq" id="faq">
  <div class="container faq-grid">
    <header class="section-head">
      <p class="eyebrow" data-reveal>Questions fréquentes</p>
      <h2 class="section-title" data-split>{p['faq_h2']}</h2>
      <p class="section-lead" data-reveal>Une autre question ? <a href="mailto:arthur.s@aivelo.fr">Écrivez-moi</a>, je réponds sous 24 h ouvrées.</p>
    </header>
    <div class="accordion">
{chr(10).join(items)}
    </div>
  </div>
</section>'''


def related_nav():
    links = ''.join(f'<li><a href="{u}">{t}</a></li>' for u, t in RELATED)
    return f'<nav class="footer-metiers" aria-label="Sites par métier et guides"><p class="footer-h">Sites par métier &amp; guides</p><ul>{links}</ul></nav>\n    '


def build(tpl, p):
    url = f"{BASE}/{p['slug']}"
    s = tpl

    # ---------- <head>
    s = re.sub(r'<title>.*?</title>', f"<title>{p['title']}</title>", s, count=1, flags=re.S)
    s = re.sub(r'(<meta name="description" content=").*?(" />)', lambda m: m.group(1) + html.escape(p['desc'], quote=True) + m.group(2), s, count=1)
    og_title = html.escape(p['title'].replace(' | Aivelo', ' · Aivelo'), quote=True)
    for key in ('og:title', 'twitter:title'):
        s = re.sub(r'(<meta (?:property|name)="%s" content=").*?(" />)' % key, lambda m: m.group(1) + og_title + m.group(2), s, count=1)
    for key in ('og:description', 'twitter:description'):
        s = re.sub(r'(<meta (?:property|name)="%s" content=").*?(" />)' % key, lambda m: m.group(1) + html.escape(p['og_desc'], quote=True) + m.group(2), s, count=1)
    s = re.sub(r'(<meta property="og:url" content=").*?(" />)', lambda m: m.group(1) + url + m.group(2), s, count=1)
    s = re.sub(r'(<link rel="canonical" href=").*?(" />)', lambda m: m.group(1) + url + m.group(2), s, count=1)
    s = re.sub(r'<meta name="geo\.[a-z]+" content="[^"]*" />\n', '', s)

    # ---------- données structurées : on garde le studio, on remplace service / fil d'Ariane / FAQ
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    ld = json.loads(m.group(1))
    graph = [n for n in ld['@graph'] if n.get('@type') not in ('Service', 'BreadcrumbList', 'FAQPage')]
    old_service = next(n for n in ld['@graph'] if n.get('@type') == 'Service')
    offers = json.loads(json.dumps(old_service['offers']).replace(f'{BASE}/creation-site-web-bordeaux', url))
    graph += [
        {'@type': 'Service', 'name': p['crumb'], 'serviceType': p['service'], 'provider': {'@id': f'{BASE}/#studio'},
         'areaServed': {'@type': 'Country', 'name': 'France'}, 'offers': offers, 'url': url},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': f'{BASE}/'},
            {'@type': 'ListItem', 'position': 2, 'name': p['crumb'], 'item': url}]},
        {'@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': text(a)}} for q, a in p['faq']]},
    ]
    ld['@graph'] = graph
    s = s[:m.start(1)] + '\n' + json.dumps(ld, ensure_ascii=False, indent=2) + '\n' + s[m.end(1):]

    # ---------- <main>
    a = s.index('<main id="main">')
    b = s.index('</main>')
    main = s[a:b]
    w0, w1 = cut(main, '<section class="section works"', '</section>')
    works = main[w0:w1 + 10]
    works = re.sub(r'(<h2 class="section-title"[^>]*>).*?(</h2>)', lambda mm: mm.group(1) + p['works_h2'] + mm.group(2), works, count=1, flags=re.S)
    m0, m1 = cut(main, '<section class="section methode', '</section>')
    methode = main[m0:m1 + 10]
    o0, o1 = cut(main, '<section class="section offres"', '</section>')
    offres = main[o0:o1 + 10]
    offres = re.sub(r'(<h2 class="section-title"[^>]*>).*?(</h2>)', lambda mm: mm.group(1) + p['offres_h2'] + mm.group(2), offres, count=1, flags=re.S)
    c0, c1 = cut(main, '<section class="contact"', '</section>')
    contact = main[c0:c1 + 10]
    contact = re.sub(r'(<p class="section-lead" data-reveal>).*?(</p>)', lambda mm: mm.group(1) + p['contact'] + mm.group(2), contact, count=1, flags=re.S)
    contact = contact.replace('au%20sujet%20d%E2%80%99un%20site%20web.', 'au%20sujet%20de%20' + p['wa'].replace(' ', '%20').replace('’', '%E2%80%99') + '.')
    # the three trust items of the template hero; the first one becomes national
    t0, t1 = cut(main, '<ul class="hero-trust"', '</ul>')
    trust = main[t0:t1 + 5]
    trust = re.sub(r'<li>.*?</li>', f'<li><i class="tr-obj">{PIN}</i>En visio, partout en France</li>', trust, count=1, flags=re.S)

    h1 = p['h1']
    crop = ' seo-visual--page' if p.get('img_crop') else ''
    hero = f'''<section class="hero local-hero seo-hero" id="top">
  <div class="container hero-inner">
    <div class="hero-copy">
      <nav class="crumbs" aria-label="Fil d'Ariane" data-hero-fade><a href="/">Accueil</a><span aria-hidden="true">›</span><span aria-current="page">{p['crumb']}</span></nav>
      <p class="eyebrow hero-eyebrow" data-hero-fade><span class="pulse"></span>{p['eyebrow']}</p>
      <h1 class="hero-title" data-hero-title>
        <span class="line"><span>{h1[0]}</span></span>
        <span class="line"><span>{h1[1]}</span></span>
        <span class="line"><span><em class="serif">{h1[2]}</em></span></span>
      </h1>
      <p class="hero-sub">
        {p['sub']}
      </p>
      <div class="hero-ctas" data-hero-fade>
        <a href="/#estimation" class="btn btn-primary btn-lg magnetic"><span class="btn-roll">{p['cta']}</span>
          {ARROW}</a>
        <a href="https://calendly.com/arthur-s-aivelo/atelier-decouverte" target="_blank" rel="noreferrer" class="btn btn-ghost btn-lg magnetic" data-book><span class="btn-roll">Réserver l'atelier</span></a>
      </div>
      {trust}
    </div>
    <figure class="seo-visual{crop}" data-hero-fade>
      <img src="assets/img/{p['img']}" alt="{html.escape(p['img_alt'], quote=True)}" width="880" height="660" fetchpriority="high" decoding="async" />
    </figure>
  </div>
</section>'''

    new_main = '\n\n'.join([
        '<main id="main">', hero,
        grid_section('pourquoi', p['why']),
        grid_section('contenu', p['inc']),
        offres, works, methode, faq_section(p), contact, '',
    ])
    s = s[:a] + new_main + s[b:]

    # links that pointed to sections of the template page
    s = s.replace('href="#zones"', 'href="/creation-site-web-bordeaux#zones"')
    return s


def patch_footer(s):
    """Rangée « Par métier » dans le pied de page (idempotent)."""
    s = re.sub(r'<nav class="footer-metiers".*?</nav>\n    ', '', s, flags=re.S)
    return s.replace('<div class="footer-bottom">', related_nav() + '<div class="footer-bottom">', 1)


def main():
    os.chdir(ROOT)
    tpl = open(TEMPLATE, encoding='utf-8').read()
    for p in PAGES:
        out = build(tpl, p)
        open(f"{p['slug']}.html", 'w', encoding='utf-8').write(out)
        print('page', p['slug'], len(out))

    for f in sorted(glob.glob('*.html')):
        s = open(f, encoding='utf-8').read()
        if '<div class="footer-bottom">' not in s:
            continue
        open(f, 'w', encoding='utf-8').write(patch_footer(s))

    # sitemap : les pages existantes gardent leur date, les nouvelles prennent la date du jour
    today = datetime.date.today().isoformat()
    sm = open('sitemap.xml', encoding='utf-8').read()
    for p in PAGES:
        loc = f"{BASE}/{p['slug']}"
        if f'<loc>{loc}</loc>' not in sm:
            sm = sm.replace('</urlset>', f'  <url><loc>{loc}</loc><lastmod>{today}</lastmod></url>\n</urlset>')
    open('sitemap.xml', 'w', encoding='utf-8').write(sm)
    print('sitemap', sm.count('<url>'), 'urls')


if __name__ == '__main__':
    main()
