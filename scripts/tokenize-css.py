"""One-off helper: replace raw hex / px values in a component stylesheet with design-system tokens.
Usage: python scripts/tokenize-css.py <css file> [--write]   (reports; with --write also rewrites the css and extends tokens.json)
Allowed raw values: 0, 1px hairlines, unitless numbers, %, and @media/@container breakpoints."""
import json, pathlib, re, sys, collections
root = pathlib.Path(__file__).resolve().parent.parent / "ux" / "design-system"
tok = json.loads((root / "tokens.json").read_text(encoding="utf-8"))
colors = {t["value"].lower(): t["name"] for t in tok["color"]["tokens"]}
colors["#fff"] = "paper"; colors["white"] = "paper"; colors["#20291e"] = "ink"
colors["#40698c"] = "focus-strong"; colors["#3e6890"] = "focus-strong"
for h, n in (("#aab2a1", "button-border"), ("#aeb8a1", "field-border"), ("#f1f2ed", "disabled-surface"), ("#d9ddd3", "disabled-border"), ("#f5f6f1", "back-press"), ("#3e6890", "focus-strong")):
    colors[h] = n
SPACE = ("padding", "margin", "gap", "row-gap", "column-gap", "top", "right", "bottom", "left", "inset", "translate", "scroll-margin", "scroll-padding")
need = collections.OrderedDict()   # token name -> value

def px_token(prop, val):
    p = prop.lower()
    if p == "letter-spacing":
        n = {"-0.6": "tracking-page-tight", "-0.5": "tracking-page", "-0.4": "tracking-sheet", "-3": "tracking-hero"}["%g" % float(val[:-2])]
        need[n] = "%gpx" % float(val[:-2]); return f"var(--{n})"
    over = {("tap-min", "48"): 1}
    mag0 = val[:-2].lstrip("-")
    if p in ("width", "min-width", "height", "min-height", "max-height", "flex-basis"):
        sem = {"48": "tap-min", "42": "statusbar-height", "86": "back-width"}.get(mag0)
        if sem and not (p == "max-height" and mag0 != "48"): return f"var(--{sem})"
        if mag0 == "92" and p == "width": return "var(--handle-width)"
        if mag0 == "68" and p == "min-height": return "var(--row-min)"
    if p == "inset" and mag0 == "42": return "var(--statusbar-height)"
    if p in ("font-size", "font"): cat = "font-size"
    elif p.endswith("radius"): cat = "radius"
    elif any(p == s or p.startswith(s + "-") for s in SPACE): cat = "space"
    else: cat = "size"
    num = val[:-2]; neg = num.startswith("-"); mag = num.lstrip("-")
    name = f"{cat}-{mag.replace('.', '-').lstrip('0') if mag.startswith('0.') else mag.replace('.', '-')}"
    need[name] = f"{mag}px"
    return f"calc(-1 * var(--{name}))" if neg else f"var(--{name})"

PXRE = re.compile(r"(?<![\w.#-])(-?\d*\.?\d+)px\b")
def conv_value(prop, value):
    value = re.sub(r"var\((--[\w-]+),\s*[^()]*(?:\([^()]*\)[^()]*)*\)", lambda m: "var(" + m.group(1) + ")", value)
    value = value.replace("0 -10px 40px #27351d0b", "var(--shadow-sheet)")
    # colours
    def hexsub(m):
        h = m.group(0).lower()
        if h in colors: return f"var(--{colors[h]})"
        unmapped.add(h); return m.group(0)
    value = re.sub(r"#[0-9a-fA-F]{3,8}\b", hexsub, value)
    value = re.sub(r"\bwhite\b", "var(--paper)", value)
    # var(--x, fallback) -> var(--x)
    value = re.sub(r"var\((--[\w-]+),\s*[^()]*(?:\([^()]*\)[^()]*)*\)", r"var(\1)", value)
    value = value.replace("var(--sans)", "var(--font-sans)")
    out = []; i = 0
    # skip px inside var( ) fallbacks already removed; handle each px
    def pxsub(m):
        v = m.group(1)
        if v == "86": return "var(--back-width)"
        if float(v) in (0, 1, -1) and prop.lower() not in ("font-size",): return m.group(0)
        if prop.lower() == "backdrop-filter": need["blur-scrim"] = "1.4px"; return "var(--blur-scrim)"
        if prop.lower() == "box-shadow" or prop.lower() == "filter": pass
        return px_token(prop, v + "px")
    return PXRE.sub(pxsub, value)

unmapped = set()
def process(css):
    css = css.replace("calc(50% - 46px)", "calc(50% - var(--handle-width) / 2)")
    prot = []
    def protect(m): prot.append(m.group(0)); return "@@P%d@@" % (len(prot) - 1)
    css = re.sub(r"@(?:media|container)[^{]*", protect, css)
    css = re.sub(r"@import[^;]*;", protect, css)
    comments = []
    def pc(m): comments.append(m.group(0)); return "@@C%d@@" % (len(comments) - 1)
    css = re.sub(r"/\*.*?\*/", pc, css, flags=re.S)
    css = re.sub(r"(?<=[{;\s])([a-z-]+)(\s*:\s*)([^;{}]+)", lambda m: m.group(1) + m.group(2) + conv_value(m.group(1), m.group(3)), css)
    css = re.sub(r"@@P(\d+)@@", lambda m: prot[int(m.group(1))], css)
    css = re.sub(r"@@C(\d+)@@", lambda m: comments[int(m.group(1))], css)
    return css

if __name__ == "__main__":
    f = pathlib.Path(sys.argv[1]); css = f.read_text(encoding="utf-8")
    out = process(css)
    print("unmapped colours:", sorted(unmapped))
    print("new tokens:", len(need))
    for k, v in need.items(): print(" ", k, v)
    left = re.findall(r"[^\s;{}]*(?:#[0-9a-fA-F]{3,8}\b|(?<![\w.-])-?\d*\.?\d+px)[^\s;{}]*", re.sub(r"/\*.*?\*/", "", out, flags=re.S))
    print("remaining raw:", collections.Counter(left).most_common(30))
    if "--write" in sys.argv and "--tokens" in sys.argv:
        p = root / "tokens.json"; raw = p.read_text(encoding="utf-8")
        have = set(re.findall(r'"name": "([\w-]+)"', raw))
        extra_colors = [("button-border", "#aab2a1", "Default (secondary) button rim."), ("field-border", "#aeb8a1", "Text field rim in the base layer."), ("disabled-surface", "#f1f2ed", "Disabled button fill in the base layer."), ("disabled-border", "#d9ddd3", "Disabled button rim."), ("back-press", "#f5f6f1", "Back button pressed fill."), ("focus-strong", "#3e6890", "Base-layer keyboard focus ring (button, link, field) where the page has no `focus` ring.")]
        groups = {"color": [(n, v, u) for n, v, u in extra_colors if n not in have], "spacing": [], "radius": [], "size": []}
        for n, v in need.items():
            if n in have: continue
            g = "spacing" if n.startswith("space-") else "radius" if n.startswith("radius-") else "size"
            groups[g].append((n, v, "Scale step used by component CSS. Prefer a named token when one fits."))
        groups["size"].append(("handle-width", "92px", "Width of the 4px home-indicator handle bar drawn on sheet footers.")) if "handle-width" not in have else None
        def key(t):
            m = re.search(r"(\d+)", t[0]); return (t[0].rstrip("0123456789-"), int(m.group(1)) if m else 0)
        for g, items in groups.items():
            if not items: continue
            items.sort(key=key)
            i = raw.index('"%s": {' % g); j = raw.index(chr(10) + '    ]', i)
            ins = (',' + chr(10)).join('      { "name": "%s", "value": "%s", "usage": "%s" }' % t for t in items)
            raw = raw[:j] + ',' + chr(10) + ins + raw[j:]
        p.write_text(raw, encoding="utf-8")
    if "--write" in sys.argv:
        f.write_text(out, encoding="utf-8")
        (pathlib.Path(sys.argv[1]).parent / ".tok-need.json").write_text(json.dumps(need), encoding="utf-8")
