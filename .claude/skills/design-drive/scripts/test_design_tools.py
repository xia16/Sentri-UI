#!/usr/bin/env python3
"""design_doctor.py and design_lint.mjs: every check fires on a defect and
stays quiet on a clean system.

The lint half needs Node and Playwright; without Node it reports SKIP rather
than passing silently. Run: python3 .claude/skills/design-drive/scripts/test_design_tools.py
"""
from __future__ import annotations

import json
import shutil
import socket
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parents[4]
TOOLS = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))
import design_doctor  # noqa: E402

TOKENS = {
    "version": "1.0.0",
    "color": {"tokens": [{"name": "paper", "value": "#ffffff"}, {"name": "ink", "value": "#111111"}]},
    "type": {"groups": [{"name": "Text", "styles": [{"name": "body", "fontSize": "14px"}]}]},
    "spacing": {"tokens": [{"name": "s", "value": "8px"}, {"name": "m", "value": "16px"}]},
    "radius": {"tokens": [{"name": "control", "value": "8px"}]},
    "size": {"tokens": [{"name": "touch-min", "value": "44px"}]},
}
STRINGS = {
    "verbs": {"Record": {"meaning": "commit one observation", "zh": "记录"}},
    "banned": {"Submit": "every action commits itself; name the act"},
    "strings": {
        "title": {"en": "Litter", "zh": "窝", "kind": "label"},
        "record": {"en": "Record {n} piglets", "zh": "记录 {n} 头仔猪", "kind": "action"},
    },
}
BASE_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#ffffff;color:#111111;font:400 14px/1.5 sans-serif}
.screen{padding:16px;display:flex;flex-direction:column;row-gap:8px}
button{min-height:44px;min-width:44px;padding:8px 16px;border:0;border-radius:8px;background:#111111;color:#ffffff;font-size:14px}
"""
CLEAN = f"""<!doctype html><html><head><meta charset=utf-8><style>{BASE_CSS}</style></head><body>
<main class="screen">
  <h1 data-str="title" style="font-size:14px">Litter</h1>
  <div data-ds="Button"><button data-str="record">Record 12 piglets</button></div>
</main></body></html>"""
BROKEN = f"""<!doctype html><html><head><meta charset=utf-8><style>{BASE_CSS}
.off{{padding:13px;font-size:15px;color:#ff0000;border-radius:5px;background:#ffffff}}
.wide{{width:500px;background:#ffffff}}
.clip{{width:60px;overflow:hidden;white-space:nowrap}}
.a{{position:relative}} .b{{position:relative;top:-18px}}
.tiny{{min-height:0;min-width:0;width:30px;height:30px;padding:0}}
.list{{height:300px;overflow-y:auto}}
.dock{{position:absolute;left:0;right:0;bottom:0;height:120px;background:#ffffff}}
.frame{{position:relative;height:400px}}
</style></head><body>
<main class="screen">
  <p class="off">Off-token box</p>
  <div class="wide">Too wide for the screen</div>
  <div class="clip">This text is clipped without ellipsis</div>
  <p class="a">First line of ink</p><p class="b">Second line on top</p>
  <button class="tiny">x</button>
  <button>Submit</button>
  <div class="frame"><div class="list">{"<p>row</p>" * 30}<button>Last action</button></div><div class="dock"><button>Dock</button></div></div>
</main></body></html>"""


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def make_repo(tmp: Path, *, tokens=None, strings=None, states=True, pages=None) -> Path:
    ds = tmp / "ds"
    (ds / "components" / "Button").mkdir(parents=True)
    (ds / "tokens.json").write_text(json.dumps(tokens or TOKENS), encoding="utf-8")
    readme = "# Button\n\n**States**\n- default, pressed, disabled\n" if states else "# Button\n\nA button.\n"
    (ds / "components" / "Button" / "README.md").write_text(readme, encoding="utf-8")
    (ds / "components" / "Button" / "preview.html").write_text("<!-- @dsCard -->", encoding="utf-8")
    (tmp / "laws").mkdir()
    (tmp / "laws" / "strings.json").write_text(json.dumps(strings or STRINGS, ensure_ascii=False), encoding="utf-8")
    (tmp / "clean.html").write_text(CLEAN, encoding="utf-8")
    (tmp / "broken.html").write_text(BROKEN, encoding="utf-8")
    port = free_port()
    cfg = {
        "design_system": "ds", "strings": "laws/strings.json",
        "serve": f'"{sys.executable}" -m http.server {{port}} --bind 127.0.0.1', "port": port,
        "base_url": "http://127.0.0.1:{port}/",
        "viewports": [{"name": "phone", "width": 390, "height": 844}], "locales": ["en"],
        "pages": pages or [{"name": "clean", "url": "clean.html", "strict": True}, {"name": "broken", "url": "broken.html"}],
    }
    (tmp / "docs" / "agents").mkdir(parents=True)
    (tmp / "docs" / "agents" / "design.md").write_text(f"# Design\n\n```json\n{json.dumps(cfg, indent=2)}\n```\n", encoding="utf-8")
    return tmp


class Doctor(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def areas(self, **kw):
        return {i["area"] for i in design_doctor.run(make_repo(self.tmp, **kw), False, None).gaps}

    def test_clean_system_has_no_gaps(self):
        self.assertEqual(self.areas(), set())

    def test_no_config_is_reported_not_crashed(self):
        self.assertEqual(design_doctor.main(["--repo", str(self.tmp)]), 2)

    def test_missing_core_token_set(self):
        t = json.loads(json.dumps(TOKENS)); t["radius"] = {"tokens": []}
        self.assertIn("tokens", self.areas(tokens=t))

    def test_version_must_be_semantic(self):
        t = json.loads(json.dumps(TOKENS)); t["version"] = 1
        self.assertIn("version", self.areas(tokens=t))

    def test_card_without_states(self):
        self.assertIn("states", self.areas(states=False))

    def test_used_component_without_card(self):
        r = design_doctor.run(make_repo(self.tmp), False, ["Button", "Stepper"])
        self.assertTrue(any("Stepper" in g["msg"] for g in r.gaps))

    def test_banned_word_action_not_a_verb_and_zh_drift(self):
        s = json.loads(json.dumps(STRINGS))
        s["strings"]["bad"] = {"en": "Submit record", "zh": "提交", "kind": "action"}
        s["strings"]["drift"] = {"en": "Record death", "zh": "登记死亡", "kind": "action"}
        msgs = [g["msg"] for g in design_doctor.run(make_repo(self.tmp, strings=s), False, None).gaps]
        self.assertTrue(any("banned 'Submit'" in m for m in msgs))
        self.assertTrue(any("not a verb in the set" in m for m in msgs))
        self.assertTrue(any("does not use '记录'" in m for m in msgs))

    def test_verb_needs_a_meaning(self):
        s = json.loads(json.dumps(STRINGS)); s["verbs"]["Done"] = {}
        self.assertIn("strings", self.areas(strings=s))

    def test_missing_zh_is_a_gap_only_at_handoff(self):
        s = json.loads(json.dumps(STRINGS)); del s["strings"]["title"]["zh"]
        repo = make_repo(self.tmp, strings=s)
        self.assertFalse(design_doctor.run(repo, False, None).gaps)
        self.assertTrue(design_doctor.run(repo, True, None).gaps)


@unittest.skipUnless(shutil.which("node"), "SKIP: node not installed, design_lint.mjs untested")
class Lint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp())
        make_repo(cls.tmp)
        out = cls.tmp / "out"
        cls.proc = subprocess.run(["node", str(TOOLS / "design_lint.mjs"), "--repo", str(cls.tmp), "--out", str(out)],
                                  capture_output=True, text=True, encoding="utf-8", timeout=600)
        report = out / "report.json"
        cls.report = json.loads(report.read_text(encoding="utf-8")) if report.exists() else None

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def rules(self, page):
        self.assertIsNotNone(self.report, self.proc.stderr + self.proc.stdout)
        return {f["rule"] for r in self.report["results"] if r["page"] == page for f in r["findings"]}

    def test_exit_code_reflects_findings(self):
        self.assertEqual(self.proc.returncode, 1, self.proc.stderr)

    def test_clean_strict_page_is_clean(self):
        self.assertEqual(self.rules("clean"), set())

    def test_each_rule_fires_on_its_defect(self):
        got = self.rules("broken")
        for rule in ("token-spacing", "token-font-size", "token-color", "token-radius", "geo-hscroll",
                     "geo-viewport", "geo-clipped", "geo-collision", "geo-tap", "geo-unreachable", "copy-banned"):
            self.assertIn(rule, got, f"{rule} did not fire; got {sorted(got)}")

    def test_strict_page_needs_registry_and_components(self):
        page = CLEAN.replace('data-str="title" ', "").replace('<div data-ds="Button">', "<div>")
        (self.tmp / "loose.html").write_text(page, encoding="utf-8")
        cfg_file = self.tmp / "docs" / "agents" / "design.md"
        text = cfg_file.read_text(encoding="utf-8")
        cfg = json.loads(text.split("```json\n")[1].split("\n```")[0])
        cfg["pages"] = [{"name": "loose", "url": "loose.html", "strict": True}]
        cfg_file.write_text(f"```json\n{json.dumps(cfg)}\n```\n", encoding="utf-8")
        out = self.tmp / "out-loose"
        subprocess.run(["node", str(TOOLS / "design_lint.mjs"), "--repo", str(self.tmp), "--out", str(out)],
                       capture_output=True, text=True, encoding="utf-8", timeout=600)
        cfg_file.write_text(text, encoding="utf-8")
        got = {f["rule"] for r in json.loads((out / "report.json").read_text(encoding="utf-8"))["results"] for f in r["findings"]}
        self.assertIn("copy-unregistered", got)
        self.assertIn("ds-unmarked", got)


if __name__ == "__main__":
    unittest.main(verbosity=2)
