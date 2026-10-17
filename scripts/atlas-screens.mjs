// The atlas's screens and pages, read from atlas/atlas.json: pure helpers the shooter, the checks, the reach and the gate share.
// Kept apart from the gate's rules (scripts/loop-rules.mjs re-exports them) because what a checker imports is part of its evidence
// identity (docs/design-workflow/gate-v2.md §3): a rule change in the gate must not void every check result.
import path from 'node:path';

// Every atlas screen that renders, with its feature.
export function screensOf(atlas, { features = [], screens = [] } = {}) {
  const list = [];
  for (const p of atlas.platforms) for (const s of p.sections) for (const f of s.features) for (const c of f.screens) {
    if (!c.url) continue;
    if (features.length && !features.includes(f.id)) continue;
    if (screens.length && !screens.includes(c.id)) continue;
    list.push({ id: c.id, feature: f.id, url: c.url, status: c.status, ...(c.preset !== undefined ? { preset: c.preset } : {}), ...(c.steps !== undefined ? { steps: c.steps } : {}) });
  }
  return list;
}

// The design system's own pages (atlas: Components → <Name> → <variant>, each state drawn by atlas/library.js stateGridAt) are
// in the gate's reach like screens: a page teaches the law, so it must follow it (rules ledger L23). Each is a "screen" with the
// id ds:<Name>/<variant> and the feature design-system; the variants are those the atlas draws (atlas.json: the files on disk).
export const DS_FEATURE = 'design-system';
export const componentPage = (id) => { const m = /^ds:([^/]+)\/([^/]+)$/.exec(String(id)); return m ? { component: m[1], variant: m[2] } : null; };
// A screen id as a folder name: a ds: id's colon is not a legal file name on Windows.
export const idPath = (id) => String(id).replace(/:/g, '_');
export function componentPagesOf(atlas, { components = [], screens = [] } = {}) {
  const list = [];
  for (const p of atlas.platforms) for (const c of p.components || []) for (const v of c.files?.variants || []) {
    const id = `ds:${c.name}/${v}`;
    if (components.length && !components.includes(c.name)) continue;
    if (screens.length && !screens.includes(id)) continue;
    list.push({ id, feature: DS_FEATURE, component: c.name, variant: v, url: `/atlas/index.html?view=components&component=${encodeURIComponent(c.name)}&variant=${encodeURIComponent(v)}` });
  }
  return list;
}
// The components whose own folder (ux/design-system/components/<Name>/) a change edits: their pages moving is the change's own reach.
export const componentsTouched = (files) => [...new Set(files.map((f) => (/^ux\/design-system\/components\/([^/]+)\//.exec(f) || [])[1]).filter(Boolean))].sort();

// The page an atlas screen opens, as a repo path.
export const pageOf = (url) => { const p = url.split(/[?#]/)[0].replace(/^\//, ''); return !p || p.endsWith('/') ? p + 'index.html' : p; };

// The repo files a page loads itself (scripts, stylesheets, images, frames), resolved from the page. Links it only points
// to, anything off this server and markup built inside a script string are left out.
export function pageAssets(html, page) {
  const dir = path.posix.dirname(page);
  const out = new Set();
  for (const m of html.matchAll(/<(?:script|link|img|iframe|source)\b[^>]*?\s(?:src|href)\s*=\s*(["'])(.*?)\1/gis)) {
    const ref = m[2].split(/[?#]/)[0].trim();
    if (!ref || /^([a-z][a-z\d+.-]*:|\/\/)/i.test(ref) || /['"+\s<>]/.test(ref)) continue;
    const f = ref.startsWith('/') ? path.posix.normalize(ref.slice(1)) : path.posix.normalize(path.posix.join(dir, ref));
    if (!f.startsWith('../')) out.add(f);
  }
  return [...out];
}

