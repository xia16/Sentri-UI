# Pig list: the rule (console)

One component lists pigs everywhere in the console. A page or an agent configures it; nobody builds a new pig table.
Style B tokens apply (Inter 14, 40 px controls, 0.75rem radius, warm stone grey, Sentri green).

## Uses (one component, three modes)

| Mode | Opened by | Checkbox | Bottom bar |
|---|---|---|---|
| Browse | the Pigs page | none | none |
| Browse, scoped | a display page, e.g. a running treatment's Sows | none | none |
| Pick | an Action ("Pick pigs" for Treatment, Vaccination, Culling…) | yes | "N of M picked" · Cancel · **Continue with N sows** |
| Act | an agent's answer or a saved view | yes | "N picked" · **Actions ▾** (opens an Action with them filled in) |

The farm view is the other way in: "Pick in the farm view" sits beside the title in Pick mode.

A display page that lists pigs (a running treatment, a batch, a pen) uses this same list, scoped by the page: the scope is fixed and not shown as a filter; search, filters and Columns work inside it. Lists of any length get them, because a scope can hold hundreds of pigs. Its default filters fit the page (running treatment: dose status, pen).

## Base (always there)

- Columns **Pig** (tag, 600) and **Pen**, first and fixed; the checkbox before them in Pick and Act.
- A **filter row**: the page's default filters, then **+ Filter**, then **Reset** at the right end.
- **Search** under the filter row: "Find a pig in these results". It narrows only inside the current results; a pig ID alone never lists pigs.
- No unfiltered list: with no filter set, the table is replaced by "Choose a room, batch or finding to see pigs."

## Defaults per opener (example: Treatment)

The page that opens the list sets its default filters and columns.
Treatment: filters **Room or pen**, **Disease or symptom**, **Status** (triage: Urgent, Priority, Watch); columns **Finding**, **Status**.
(Vaccination, Culling and the rest get their own defaults when they are designed.)

## Custom fields

- **+ Filter** adds any filter from the filter catalogue (batch, stage, parity, days in stage, last finding, temperature, return-to-heat count…).
- **Columns** (a ghost button at the right end of the search row) adds or removes columns from the column catalogue. Pig and Pen cannot be removed.
- Agents use the same two catalogues. An agent's search arrives as **one query chip** in the filter row, in plain words with the agent's avatar ("Vet · lame in Gestation 2, fever this week"); opening it shows the normal filters it stands for; ✕ removes it. Columns an agent adds look exactly like any other column.
- Every value comes from the data. An agent never writes a value into a cell. A figure that does not exist yet becomes a named metric in the catalogue, with its definition on the column header.

## How values look (one renderer per type)

| Type | Look |
|---|---|
| Number | right-aligned, tabular figures, unit in the header ("Temp °C"); outside its normal range = red text, nothing else |
| Status | the status badge, one hue per status |
| Tags | up to two quiet tags, then "+N" |
| Date | "Thu 5 Nov", or "since Wed" for durations |
| Short text | one line, muted; a value that needs more is a detail, not a cell |

- Any number column sorts; the active sort shows an arrow in its header. Agents may set the sort.
- About six columns fit the 680 px pane. Past that the table scrolls sideways inside itself with checkbox, Pig and Pen pinned, or the pane expands.

## Asking for more

Complex searches belong in chat. The page says so only where someone is looking for them:
- at the bottom of the **+ Filter** menu, below a separator, a quiet line with the agent's avatar:
  "Need something else? Ask Vet in chat." (the agent is the one this chat is with); clicking it puts the cursor in the chat composer.
- in the empty result: "No pigs match these filters." + the same line.
No banners, no tooltips, no permanent hint on the page.

## Comments

An agent may comment on a row, like a field comment on a form: a small avatar marker at the row's end; the comment opens under the row with its fix (for example "Untick C12") and Dismiss.
