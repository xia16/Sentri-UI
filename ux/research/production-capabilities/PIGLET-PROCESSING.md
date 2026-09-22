# Piglet processing

Figma nodes: `2511:8521`, `2511:8637`, `2512:9051`, `2512:9216`, `2519:9421`.

## Intent

Keep litter-level care and per-pig identity in one place without pretending that every piglet has an identity record.

## Information model

- **Care** is a day-based checklist. Each item has a planned day, completion state, author, and time.
- **Piglet records** contains identified piglets and one explicit unidentified count.
- Identity fields are ear tag, ear notch, sex, and weight. Any field may be absent.
- Litter totals remain the source of truth for the number alive; identity rows describe a subset of that litter.

## Interaction

- Entry: **Actions → Production → Piglet processing**.
- Care and Piglet records are tabs on the same full page.
- Due items can be checked, then saved together as the visit result.
- Piglet records support scan-tag, choose-ear-notch, and manual add entry points.
- Rows open an editor. Save is disabled until at least one identity field is present.
- Missing identity is shown as a count, not as generated placeholder animals.
