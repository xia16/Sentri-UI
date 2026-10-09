#!/usr/bin/env python3
"""Design-system doctor: does this repo's design system meet the contract?

The contract is the Claude Design System artifact's structure plus what the
design loop needs. A system grows as features land, so the doctor asks two
things only: is the required core there, and is everything a delivered design
uses complete?

    design_doctor.py [--repo DIR] [--handoff] [--used NAME ...] [--json]

--used     component names a delivered design uses (the lint's `components`
           list); each must have a complete card. Without it, every card is
           checked.
--handoff  a missing zh string is an error, not a warning.

Reads the repo's `docs/agents/design.md` (see `load_config`). Exit 0 clean,
1 gaps, 2 no config or unreadable input. Standard library only.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

CONFIG = Path("docs/agents/design.md")
CORE = ("color", "type", "spacing", "radius", "tap-min")
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
COVER = "Cover"  # the Design System type's title card, not a component
STATES = re.compile(r"^(?:#+\s*|\*\*)States\b", re.M)


class NoConfig(Exception):
    pass


def load_config(repo: Path) -> dict:
    """The first ```json block in docs/agents/design.md."""
    f = repo / CONFIG
    if not f.is_file():
        raise NoConfig(f"no {CONFIG.as_posix()} in {repo.as_posix()}: set up the design config first")
    m = re.search(r"```json\s*\n(.*?)\n```", f.read_text(encoding="utf-8"), re.S)
    if not m:
        raise NoConfig(f"{CONFIG.as_posix()} has no ```json block")
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        raise NoConfig(f"{CONFIG.as_posix()}: bad json ({e})") from e


class Report:
    def __init__(self):
        self.items: list[dict] = []

    def gap(self, area, msg):
        self.items.append({"level": "gap", "area": area, "msg": msg})

    def warn(self, area, msg):
        self.items.append({"level": "warn", "area": area, "msg": msg})

    @property
    def gaps(self):
        return [i for i in self.items if i["level"] == "gap"]


def check_tokens(ds: Path, r: Report) -> dict:
    f = ds / "tokens.json"
    if not f.is_file():
        r.gap("tokens", f"no tokens.json in {ds.name}")
        return {}
    t = json.loads(f.read_text(encoding="utf-8"))
    present = {
        "color": bool(t.get("color", {}).get("tokens")),
        "type": any(s.get("fontSize") for g in t.get("type", {}).get("groups", []) for s in g.get("styles", [])),
        "spacing": bool(t.get("spacing", {}).get("tokens")),
        "radius": bool(t.get("radius", {}).get("tokens")),
        "tap-min": any(x.get("name") == "tap-min" for x in t.get("size", {}).get("tokens", [])),
    }
    for k in CORE:
        if not present[k]:
            r.gap("tokens", f"core token set missing: {k}")
    if not SEMVER.match(str(t.get("version", ""))):
        r.gap("version", f"tokens.json version is {t.get('version')!r}; designs need a semantic version (e.g. \"2.0.0\") to record")
    return t


def check_components(ds: Path, used: list[str] | None, r: Report) -> list[str]:
    root = ds / "components"
    cards = sorted(p.name for p in root.iterdir() if p.is_dir()) if root.is_dir() else []
    if not cards:
        r.gap("components", "no component cards in components/")
    wanted = used if used is not None else cards
    for name in wanted:
        d = root / name
        if not d.is_dir():
            r.gap("components", f"{name}: used by a design but has no card")
            continue
        readme, preview = d / "README.md", d / "preview.html"
        if name == COVER:
            continue
        if not readme.is_file():
            r.gap("components", f"{name}: no README.md")
            continue
        if not preview.is_file():
            r.gap("components", f"{name}: no preview.html")
        if not STATES.search(readme.read_text(encoding="utf-8")):
            r.gap("states", f"{name}: README has no States section (default, pressed, disabled, focus, error, loading, empty — whichever apply)")
    return cards


def check_strings(repo: Path, rel: str, handoff: bool, r: Report) -> None:
    path = repo / rel
    if not path.is_file():
        r.gap("strings", f"no string registry at {rel}")
        return
    try:
        reg = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        r.gap("strings", f"{rel}: bad json ({e})")
        return
    verbs = reg.get("verbs", {})
    banned = reg.get("banned", {})
    strings = reg.get("strings", {})
    if not verbs:
        r.gap("strings", "registry has no verb set")
    for v, spec in verbs.items():
        if not isinstance(spec, dict) or not spec.get("meaning"):
            r.gap("strings", f"verb {v!r} has no meaning — a verb set is definitions, not a list")
    for sid, s in strings.items():
        en = (s or {}).get("en", "")
        if not en:
            r.gap("strings", f"{sid}: no en text")
            continue
        for word, why in banned.items():
            if re.search(rf"\b{re.escape(word)}\b", en, re.I):
                r.gap("strings", f"{sid}: {en!r} uses banned {word!r} — {why}")
        if s.get("kind") == "action":
            first = en.split()[0].strip("&·,") if en.split() else ""
            if first not in verbs:
                r.gap("strings", f"{sid}: action {en!r} starts with {first!r}, not a verb in the set")
            else:
                zh_verb = verbs[first].get("zh")
                if zh_verb and s.get("zh") and zh_verb not in s["zh"]:
                    r.gap("strings", f"{sid}: zh {s['zh']!r} does not use {zh_verb!r} for {first!r}")
        if not s.get("zh"):
            (r.gap if handoff else r.warn)("strings", f"{sid}: no zh text")


def run(repo: Path, handoff: bool, used: list[str] | None) -> Report:
    cfg = load_config(repo)
    r = Report()
    ds = repo / cfg.get("design_system", "")
    if not cfg.get("design_system") or not ds.is_dir():
        r.gap("config", f"design_system path {cfg.get('design_system')!r} is not a folder")
        return r
    check_tokens(ds, r)
    check_components(ds, used, r)
    check_strings(repo, cfg.get("strings", "(not configured)"), handoff, r)
    for key in ("rulings", "glossary"):
        if cfg.get(key) and not (repo / cfg[key]).is_file():
            r.warn(key, f"{cfg[key]} is configured but missing")
    return r


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--repo", default=".")
    ap.add_argument("--handoff", action="store_true")
    ap.add_argument("--used", nargs="*")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    try:
        r = run(Path(a.repo).resolve(), a.handoff, a.used)
    except (NoConfig, json.JSONDecodeError, OSError) as e:
        print(f"design-doctor: {e}", file=sys.stderr)
        return 2
    if a.json:
        print(json.dumps({"gaps": len(r.gaps), "items": r.items}, ensure_ascii=False, indent=2))
    else:
        for i in r.items:
            print(f"{i['level']:4}  {i['area']:10} {i['msg']}")
        print(f"design-doctor: {len(r.gaps)} gap(s), {len(r.items) - len(r.gaps)} warning(s)")
    return 1 if r.gaps else 0


if __name__ == "__main__":
    sys.exit(main())
