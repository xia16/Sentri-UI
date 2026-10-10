# Vendored fonts

The Google Fonts stylesheets the prototypes link, and the font files they name, so screenshots and checks render the real typefaces without the network. `scripts/font-route.mjs` serves them inside the headless browser; the pages themselves still link Google Fonts.

- Plus Jakarta Sans and IBM Plex Mono, both under the SIL Open Font License 1.1.
- Refresh with `node scripts/vendor-fonts.mjs` when a page links a new font URL; a link that isn't here is reported as missing, never silently drawn in the fallback face.
