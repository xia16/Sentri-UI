"""Generate ux/design-system/tokens.css from tokens.json: one CSS custom
property per token, named as the token. tokens.json stays the source."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / "ux" / "design-system"
t = json.loads((root / "tokens.json").read_text(encoding="utf-8"))
lines = []
for group in ("color", "spacing", "radius", "shadow", "size", "weight", "opacity", "motion", "drawer"):
    for tok in t.get(group, {}).get("tokens", []):
        lines.append(f"  --{tok['name']}: {tok['value']};")
fam = t.get("type", {}).get("families", {})
for name, f in (fam.items() if isinstance(fam, dict) else []):
    stack = f.get("stack") or f.get("value") if isinstance(f, dict) else f
    if stack: lines.append(f"  --font-{name}: {stack};")
for g in t.get("type", {}).get("groups", []):
    for s in g["styles"]:
        lines.append(f"  --type-{s['name']}-size: {s['fontSize']};")
out = "/* Generated from tokens.json by scripts/tokens-css.py — do not edit. */\n:root {\n" + "\n".join(lines) + "\n}\n"
(root / "tokens.css").write_text(out, encoding="utf-8")
print(len(lines), "properties")
