# -*- coding: utf-8 -*-
import re, os, sys

ROOT = '/workspace'

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)

def split_rules(css):
    """Split css into list of (prelude, body). Top-level only."""
    results = []
    depth = 0; buf_start = 0; block_start = 0; prelude = ''
    in_comment = False
    j = 0
    n = len(css)
    while j < n:
        two = css[j:j+2]
        if two == '/*':
            end = css.find('*/', j+2)
            j = (end+2) if end != -1 else n
            continue
        ch = css[j]
        if ch == '{':
            if depth == 0:
                prelude = css[buf_start:j].strip(); block_start = j
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                results.append((prelude, css[block_start+1:j])); buf_start = j+1
        j += 1
    return results

HEADER_SELS = {'.header', '.header-right', '.header-left', '.logo-circle',
               '.logo-circle img', '.brand-name', '.nav', '.nav a',
               '.nav a:hover', '.header-contacts-btn'}

SHARED_MODAL_SELS = {'.about-modal', '.about-modal.is-open', '.about-modal__backdrop',
                      '.about-modal__dialog', '.about-modal__title', '.about-modal__close',
                      '.about-modal__content p'}

def is_header_rule(prelude):
    sels = {s.strip() for s in prelude.split(',') if s.strip()}
    return bool(sels) and sels <= HEADER_SELS

def strip_header_from_css(css):
    """Remove header rules from top level and inside @media blocks. Returns new css."""
    out = []
    for prelude, body in split_rules(css):
        if prelude.startswith('@media'):
            inner = []
            for p2, b2 in split_rules(body):
                if is_header_rule(p2):
                    continue
                inner.append('    %s {%s\n    }' % (p2, b2))
            # keep media even if it becomes empty? drop if empty
            if inner:
                out.append('%s {\n%s\n}' % (prelude, '\n'.join(inner)))
            else:
                # check there were rules originally that all got removed -> drop block
                had = split_rules(body)
                if had:
                    pass  # dropped entirely
                else:
                    out.append('%s {%s}' % (prelude, body))
        elif is_header_rule(prelude):
            continue
        else:
            out.append('%s {%s}' % (prelude, body))
    return '\n\n'.join(out) + '\n'

# ---------- canonical shared header html ----------
def header_html(prefix):
    return ('<!-- ОБЩИЙ HEADER (одинаков на всех страницах) -->\n'
            '        <header class="container header">\n'
            '            <a class="header-left" href="%(p)sindex.html">\n'
            '                <div class="logo-circle">\n'
            '                    <img src="%(p)slogo.png" alt="Логотип — Благополучная собака">\n'
            '                </div>\n'
            '                <div class="brand-name">Благополучная собака</div>\n'
            '            </a>\n'
            '            <div class="header-right">\n'
            '                <nav class="nav"></nav>\n'
            '                <a href="https://forms.gle/RQvBHuGSBAH4rzZR6" class="header-contacts-btn">Обратная связь</a>\n'
            '            </div>\n'
            '        </header>')

HEADER_RE = re.compile(r'[ \t]*<!--[^>]*HEADER[^>]*-->[\s\S]*?<header class="container header">[\s\S]*?</header>')

ABOUT_BTN_RE = re.compile(r'<button class="cta-btn">Контакты</button>')

MODAL_HTML = '''
    <!-- МОДАЛКА «О ПРОЕКТЕ» (общая, см. js/common.js) -->
    <div class="about-modal" aria-hidden="true">
        <div class="about-modal__backdrop" data-about-close="1"></div>
        <div class="about-modal__dialog" role="dialog" aria-modal="true">
            <button type="button" class="about-modal__close" data-about-close="1" aria-label="Закрыть">×</button>
            <h3 class="about-modal__title">О проекте</h3>
            <div class="about-modal__content">
                <p>Наш просветительский проект поможет вам организовать жизнь вашей собаки максимально благополучно. Узнать потребности, которые стоят за ее поведением и понимать, как их удовлетворить.</p>
                <p>Вы начнете понимать язык тела и сигналы вашей собаки и сможете ей помочь в стрессовых для нее ситуациях.</p>
                <p>Если вы мечтаете взять собаку из приюта и не знаете, как помочь ей адаптироваться дома, мы бережно поможем вам это сделать.</p>
                <p>Приятного изучения ❤️</p>
            </div>
        </div>
    </div>
'''

CONTACTS_SCRIPT_RE = re.compile(
    r'\n?<script>\s*\(function \(\)\s*\{\s*var contactsButton = document\.querySelector\(\'\.header-contacts-btn\'\);[\s\S]*?\}\)\(\);\s*</script>'
)

PPLX_ATTR_RE = re.compile(r'\s*<script data-pplx-inline-edit>[\s\S]*?</script>')

def remove_modal_html(s):
    """remove static about-modal div (balanced div counting)."""
    marker = '<div class="about-modal"'
    i = s.find(marker)
    if i == -1:
        return s
    # find start of line
    line_start = s.rfind('\n', 0, i) + 1
    depth = 0; j = i; n = len(s)
    pos = i
    while pos < n:
        if s.startswith('<div', pos):
            depth += 1; pos += 4
        elif s.startswith('</div>', pos):
            depth -= 1; pos += 6
            if depth == 0:
                end = pos
                break
            continue
        else:
            pos += 1
    else:
        return s
    # consume trailing newline
    while end < n and s[end] in ' \t':
        end += 1
    if end < n and s[end] == '\n':
        end += 1
    return s[:line_start] + s[end:]

def extract_style(html):
    m = re.search(r'( *)<style>([\s\S]*?)</style>', html)
    if not m:
        return None, None, None
    return m.group(1), m.group(2), m.span()

pages = [
    # (html path, css rel path to write or None->keep, prefix for root-relative links)
    ('/workspace/index.html',      '/workspace/css/style_index.css',           './'),
    ('/workspace/blago/blago.html','/workspace/blago/style.css',               '../'),
    ('/workspace/behaviour/behaviour.html', '/workspace/behaviour/style_behaviour.css', '../'),
    ('/workspace/aging/aging.html','/workspace/aging/style.css',               '../'),
    ('/workspace/problems/problems.html', '/workspace/problems/style_problems.css', '../'),
    ('/workspace/adaptation/Адаптация_собаки_—_Благополучная_собака.html', '/workspace/adaptation/style_adaptation.css', '../'),
    ('/workspace/communication/Коммуникация.html', '/workspace/communication/style_communication.css', '../'),
]

for html_path, css_path, prefix in pages:
    s = read(html_path)
    orig_len = len(s)

    # 1. replace header block
    new_header = header_html(prefix)
    s2, nrep = HEADER_RE.subn(new_header, s, count=1)
    if nrep == 0:
        HEADER_RE2 = re.compile(r'[ \t]*<header class="container header">[\s\S]*?</header>')
        s2, nrep = HEADER_RE2.subn(new_header, s, count=1)
    assert nrep == 1, 'header not found in ' + html_path
    s = s2

    # 2. remove old contacts modal script (standalone <script> starting with contactsButton)
    s, n2 = CONTACTS_SCRIPT_RE.subn('', s)
    # also commented-out variant on index: leave comments alone except huge inline one handled below

    # 3. remove perplexity inline-edit script
    s, n3 = PPLX_ATTR_RE.subn('', s)

    # 4. handle styles
    indent, css, span = extract_style(s)
    if span is not None:
        st, en = span
        if css_path.endswith(('style_problems.css', 'style_adaptation.css', 'style_communication.css')) or html_path.endswith('index.html'):
            # externalize inline <style> into page css file (header rules removed -> they live in common.css)
            css_out = strip_header_from_css(css)
            write(css_path, css_out)
            s = s[:st] + '<link rel="stylesheet" href="./%s">' % os.path.basename(css_path) + s[en:]
        else:
            # existing external css: strip duplicated header rules
            cssx = read(css_path)
            cssx2 = strip_header_from_css(cssx)
            write(css_path, cssx2)
            # remove inline style block only if it was just the about-modal patch
            m2 = re.search(r'\n[ \t]*<style>[\s\S]*?\.about-modal[\s\S]*?</style>', s)
            if m2 and m2.span() != (st, en):
                pass
            elif m2:
                s = s[:m2.start()] + '\n' + s[m2.end():]
    else:
        # no inline styles at all: just clean the external css
        cssx = read(css_path)
        cssx2 = strip_header_from_css(cssx)
        write(css_path, cssx2)

    # 5. add common.css + common.js links
    # stylesheet: insert before page stylesheet link (or before </head>)
    common_css = '<link rel="stylesheet" href="%scss/common.css">' % prefix
    if '<link rel="stylesheet" href="%s' % prefix in s:
        pass
    # find the page stylesheet link
    pat = re.compile(r'<link rel="stylesheet" href="(\./)?(%s|style[^"]*\.css)"> ' % '', )
    # simpler: insert right before the first occurrence of the page's own css link
    own = re.search(r'<link[^>]*href="[^"]*%s"[^>]*>' % os.path.basename(css_path), s)
    if own:
        s = s[:own.start()] + common_css + '\n    ' + s[own.start():]
    else:
        s = s.replace('</head>', '%s\n</head>' % common_css)

    # script: insert before </body>
    common_js = '<script src="%sjs/common.js"></script>' % prefix
    modal_needed = 'about-project-btn' in s
    if '</body>' in s:
        ins = (MODAL_HTML + '    ' if modal_needed and 'class="about-modal"' not in s else '') 
        s = s.replace('</body>', ins + '    ' + common_js + '\n</body>')

    write(html_path, s)
    print('OK %-70s header:%d contactsScript:%d pplx:%d len %d->%d' % (html_path, nrep, n2, n3, orig_len, len(s)))
