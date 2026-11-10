import sys
src, dst, main_src, main_dst = sys.argv[1:5]
L = open(src, encoding='utf-8').read().split('\n')
# 1-based: helmet 10..13, content 59..(features end = 192 "</div>" + blank + 194 "</div>")
start = 59 - 1
fe = next(i for i, l in enumerate(L) if 'features for this area' in l)
end = next(i for i in range(fe, len(L)) if L[i] == '            </div>')  # the padding div's closing line
assert L[end].strip() == '</div>', L[end]
content = L[start:end + 1]
helmet = L[9:13]
script_i = next(i for i, l in enumerate(L) if l.startswith('<script type="text/x-dc"'))
script = L[script_i:]
script[0] = """<script type="text/x-dc" data-dc-script data-props='{"embedded":{"editor":null,"default":false},"$preview":{"width":467,"height":848}}'>"""
body = '\n'.join(script)
body = body.replace("const menus = st.menus || [false, false, true];", "const menus = st.menus || [false, false, false];")
# one pane only, keep its toggle working
import re
body = re.sub(r"      panes: \[\n.*?\n      \]\n", "      panes: [pane(0, '', '')]\n", body, flags=re.S)
assert "panes: [pane(0, '', '')]" in body
out = ['<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">', '<title>Home G pane</title>',
       '<script src="./support.js"></script>', '</head>', '<body>', '<x-dc>'] + helmet + [
       '<div style="width: 100%; height: 100%; box-sizing: border-box; overflow-y: auto; scrollbar-width: none; background: #F6F7F1; font-family: \'Geist\', system-ui, sans-serif; color: #1B211C; -webkit-font-smoothing: antialiased">',
       '  <sc-for list="{{panes}}" as="pn" hint-placeholder-count="1">'] + content + ['  </sc-for>', '</div>', '</x-dc>'] + body.split('\n')
open(dst, 'w', encoding='utf-8').write('\n'.join(out))

m = open(main_src, encoding='utf-8').read()
a = '<dc-import name="Home" embedded="{{true}}" hint-size="100%,100%"></dc-import>'
assert m.count(a) == 1
m = m.replace(a, '<dc-import name="HomeGPane" embedded="{{true}}" hint-size="100%,100%"></dc-import>')
# Artifacts menu button in the tab bar, before the expand button
b = '    <sc-if value="{{showExpand}}" hint-placeholder-val="{{true}}">'
assert m.count(b) == 1
art = '''    <button type="button" style="display: flex; align-items: center; gap: 6px; height: 34px; padding: 0 10px; border: 0; border-radius: 10px; background: transparent; font: inherit; font-size: 13px; font-weight: 500; color: #3B4540; cursor: pointer; flex-shrink: 0">
      <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M9 13h6M9 17h4"></path></svg>
      Artifacts
      <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="m6 9 6 6 6-6"></path></svg>
    </button>
'''
m = m.replace(b, art + b)
m = m.replace('<title>', '<title>Console with Home G · ', 1)
open(main_dst, 'w', encoding='utf-8').write(m)
print('ok', len(content))
