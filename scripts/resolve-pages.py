"""Resolve merge conflicts in docs/agents/design.md's `pages` list by keeping
every page from both sides (deduplicated by name). Used by the design driver
when parallel slices each add pages."""
import json, re, sys, pathlib
p = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "docs/agents/design.md")
s = p.read_text(encoding="utf-8")
def pick(m):
    lines = [l.rstrip().rstrip(",") for l in (m.group(1) + "\n" + m.group(2)).splitlines() if l.strip()]
    return ",\n".join(lines)
s = re.sub(r"<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*", pick, s, flags=re.S)
m = re.search(r"```json\n(.*?)```", s, re.S)
cfg = json.loads(m.group(1))
seen, pages = set(), []
for pg in cfg["pages"]:
    if pg["name"] not in seen: seen.add(pg["name"]); pages.append(pg)
cfg["pages"] = pages
p.write_text(s, encoding="utf-8")
print("ok", len(pages), "pages")
