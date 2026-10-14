/* The `stop` glyph (a rounded square, the registry's 24-unit open-stroke style) for Scan's "Stop scanning" button.
   It belongs in SentriIcons (ux/design-system/components/bundle.js); that file is held by the shared-change PR, so it is added here, once, until that lands.
   When it does: move the path into the registry's `paths`, delete this file and its <script> tag in farrowing-astra-concept.html. */
(function (root) {
  'use strict';
  const base = root.SentriIcons;
  if (!base || base.paths.stop) return;
  const stop = 'M8.5 6.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z';
  const icon = (k) => k === 'stop' ? `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${stop}"/></svg>` : base.icon(k);
  root.SentriIcons = Object.freeze({ ...base, paths: Object.freeze({ ...base.paths, stop }), icon });
})(globalThis);
