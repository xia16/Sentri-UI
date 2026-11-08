# Sentri console: system principles

For the frontend developer building the AI-first console (desktop web).

> The shared, editable copy is the Claude Doc **"Sentri console: system principles"**: https://claude.ai/artifact/Xqb68QiCn9Zpgkf1Gt3PuJ. The Doc is the one to read and comment on. This file is a snapshot of it from 6 Nov 2026, and its section numbers differ slightly.

These are the rules every feature follows. If a feature's design and this doc disagree, ask; don't pick one. Each rule is marked **Decided** (the owner ruled), **Default** (a design call to build with unless the owner says otherwise), or **Open** (not settled; don't build as final). Last updated 6 Nov 2026.

- Reference canvas: https://claude.ai/artifact/3d1Q4z2YMnFwmFBXtaCeMm (pages Home, Treatment, Archive). Treatment is the first feature built to these rules. Use it as the worked example.
- The Farm view has its own detailed plan: `PLAN.md` (next to this file). It is **normative for the Farm view's layout and behaviour**. Where its "Overhaul O1–O6" section differs from its earlier T1–T5 tickets, O1–O6 wins. This doc only adds how the rest of the console connects to it.

---

## 0. Terms (each word has one meaning in this doc)

| Term | Means | Not to be confused with |
|---|---|---|
| **Pane** | The right-hand area that holds tabs | — |
| **Tab** | One open page in the pane (Home, Farm view, an Action, a Custom page) | — |
| **Farm view** | The always-open tab with the 3D farm | A Custom page |
| **Location card** | The Farm view's card, top left: where you are (farm › zone › section › room › pen › pig) | — |
| **Right panel** | The Farm view's panel on the right: batches, a batch, a running task | — |
| **Bottom bar** | The Farm view's bar: Select · Schedule · Equipment · Actions | — |
| **Record** (noun) | A thing that exists and has an ID: a pig, pen, room, batch, task, running treatment, device | "record" (verb), meaning to log an event on the phone |
| **Action** | A form that creates or changes something (New treatment, Vaccination plan) | — |
| **Ways into an Action** | / Actions in chat · ··· Actions on a record · Actions in the bottom bar · Actions ▾ in a pig list | All of them open the same Action tab |
| **Custom page** | A tab built from fixed blocks (list, chart, figures, note); dashboards are Custom pages we designed | The Farm view; "Plan", the Farm view's bird's-eye mode |
| **Query** | A set of filters (plus columns, in a list) from the catalogues | — |
| **Highlight** | A query shown on the Farm view | — |
| **Triage status** | Urgent · Priority · Watch: how a pig's health finding ranks | Task status |
| **Task status** | Done · Today · Late · Waiting · Skipped: where a task or dose stands | Triage status |

---

## 1. What the console is

**Decided.** The console plans and directs. The phone records.

- People in the barn record events (breeding, farrowing, doses given, deaths) on the phone app.
- The console:
  - sets plans, so the phones get tasks;
  - gives directions on pigs;
  - shows the farm.
- Never build a console page that records a floor event. A console direction (check, treat, move, cull, watch) becomes a phone task.

**Users:** the farm's operator or manager. On small farms this is one person.

**Access:** everyone with console access has full access for now.
- **Default:** build no permission layer.
- Send every write through one client-side call per Action, so that roles can be added in one place later.

### The frame

```
┌────────┬──────────────────────┬──────────────────────────────────┐
│Sidebar │ Chat                 │ Pane: tabs                       │
│AI team │ (one conversation)   │ [Home] [Farm view] [Treatment ×] │
│Groups  │                      │                                  │
└────────┴──────────────────────┴──────────────────────────────────┘
```

- **Sidebar** holds conversations only:
  - the AI teammates: General Manager (GM), Production (PR), Vet (VT), Biosecurity (BS), Equipment (EQ);
  - group chats with people, which an agent joins when @-mentioned.

  There are no page navigation items.
- **Chat** is always beside the pane.
  - The composer holds **/ Actions**: an index popover with search and six types (Pigs, Production incl. batches, Health, Feed, People, Setup) in one scrolling list.
  - The **"Looking at …"** chip names the pane's active context, so the agent knows it:
    - the tab's name;
    - in the Farm view, the location card's level ("room Gestation 1"), or the open record.
- **Pane:**
  - **Home** and **Farm view** are always open and can't be closed. Everything else opens as a closable tab.
  - **The Farm view** is a full page with the chat docked at 400 px; the chat can be hidden there.
  - **Other tabs** are 680 px by default and can go full width (chat hidden).

### Tabs (Default)
- **Opening a record** activates the Farm view tab (§3.1).
- **Actions:** one tab per Action draft. Opening the same Action again with different pigs opens a second tab.
  - A draft lives while its tab is open.
  - Closing a tab that has changes asks first ("Discard this draft?").
- **A Custom page** opens as a new tab and becomes active. From the Farm view, the pane leaves the Farm view; the Farm view keeps its place and highlight for when you come back.

---

## 2. One question, one surface

**Decided (6 Nov 2026).** Each question is answered in exactly one place.

| The user asks | Surface | What it shows |
|---|---|---|
| What needs me? | **Home** | Entrances and read-only peeks (exact form is Open, §10) |
| What do I decide? | **Inbox** | Approve / Answer / To do items |
| When? | **Schedule** (a page reached from Home) | Today, the week, what's coming, as a timeline |
| Where, and which pig? | **Farm view** | Rooms, pens and pigs now, and every record |
| How are we doing? | **Dashboards** | A fixed baseline of farm-wide charts; never batch-level, never commentary |
| What changed today, and why? | **Daily report** (in the general group chat) | Day-to-day changes, problems, comparisons against plan (3.6) |
| Show me something specific | **Custom page** tab | A list or chart an agent built, or a saved one |
| Change or create something | **Action** tab | A form |
| Help, explain, do it for me | **Chat** | Conversation; its cards open any of the above |

Home's own cards never act. Pages reached from Home (Schedule, the Inbox) can: Schedule's "+" opens an Action, and the Inbox has Approve.

---

## 3. Where each kind of content opens

### 3.1 Record → the Farm view
**Decided (6 Nov 2026).**

- **Every record has one address:** `{kind, id}`, for example `{treatment, RX-25G009}`, `{pig, 206234}`, `{pen, B15}`. Anything that links to a record (Schedule, Inbox, chat cards, lists, Custom pages, dashboards, highlights) opens it by address. Nothing else redraws it.
- **Opening a record:**
  1. Activate the Farm view tab.
  2. Move the camera to the record's place (PLAN.md camera rules).
  3. Show its details:
     - places, pens and pigs in the **location card** (top left, ~360 px);
     - batches, running tasks and running treatments in the **right panel** (380 px);
     - a pig opened while a batch is open shows as a sub-page of the batch, with Back → the batch (PLAN.md).
- **Panel language** (not the Action style): background `#F6F7F1`, radius 22, a boxed back button, pill buttons, white cards inside.
- **The map carries the status.** For a running task, pens and crates take its task-status colours (§8). The panel holds the summary, not a copy of what the map shows.
- **Devices and equipment** are records too. They open from the bottom bar's Equipment (PLAN.md).
- **Records with no place** (a medicine order, a supplier, a person, a pig that has left the farm) open as their own tab instead. *Open: no screen is designed yet.*
- **A record's ··· Actions** opens Actions on it. For a running treatment: *Change* and *End early* (Default), each opening an Action tab.

**Consequence for Treatment:** the running treatment (RX-25G009) belongs in the Farm view's right panel.
- Issue → the Farm view with those sows.
- Schedule's Amox row opens it there.
- The canvas's Treatment tab still shows it as a tab page. **Build it in the right panel**, not as a tab. Its mock-up is on the canvas's Treatment page.

### 3.2 Action → its own tab
**Decided.**

- An Action **never opens inside the Farm view.** It opens from any of the four ways in (§0).
- Pigs already chosen (the Farm view's Select, a list's Act mode, an agent's draft) arrive **filled in**.
- **An Action involving pigs starts by picking pigs.** The Pigs section comes first, and the picker offers **"Pick in the farm view"**.
  - **Default:** this switches to the Farm view in Select mode, with a pill at the top: "Picking for New treatment · 3 picked · Done".
  - Done returns to the Action tab with the picks.
  - Esc or Cancel returns without changes.
- Issuing creates a record, which opens in the Farm view.

### 3.3 Custom page → its own tab
**Decided (6 Nov 2026).**

- **A Custom page is built only from these blocks:**
  - **List:** the Pig list (§5.2), or the same pattern for batches.
  - **Chart:** line, bar or stacked bar; one chart style product-wide.
  - **Figures:** a row of 2–4 numbers.
  - **Note:** short plain text from the agent; at most one.
- Agents compose Custom pages from these blocks, never a custom layout or a new block.
- Every row, bar or figure links to a record or another Custom page.
- Dashboards are Custom pages we designed: a stable baseline of farm-wide charts, never batch-level and never commentary. Anything dynamic belongs in the daily report (3.6).
- A Custom page can be saved and reopened.

### 3.4 Decision → the Inbox
- Kinds: **Approve**, **Answer**, **To do**. Opening one goes to its Action (a draft to approve) or its record.
- Who creates them: §4.
- *The Inbox page design is Open.*

### 3.5 Time → Schedule
- A timeline: task rows × days, with bars for done, today, planned and estimate.
- A cell or row opens the task's record (§3.1). A row's place opens the Farm view there. **"+"** opens the Action, prefilled.
- Schedule and the Farm view reach the same task record by time or by place. Neither is a second task UI.

### 3.6 Daily report → the general group chat
**Decided (6 Nov 2026).**

- **Who writes it:** the agents draft and generate a daily report each day.
- **Where it lands:** it is posted in the farm's general group chat, and everyone in that chat sees it.
- **One link, two sections:** everyone gets the same link. Opening it shows a section just for the viewer, plus a shared section for everyone.
- **What goes in it:** everything dynamic about the farm: day-to-day changes, problems, comparisons against plan.
- **Versus dashboards:** dashboards are the same farm-wide charts every day. The report is what changed and why.
- **Versus the Inbox:** the report informs and asks for nothing. A decision it raises is its own Inbox item (§4), and the report links to it.
- **Default:** the report opens as its own tab, built from the Custom page blocks (Note, Figures, Chart, List). Everything in it links out to records.

---

## 4. Chat vs Inbox: who started it decides

**Decided (5 Nov 2026).**

- **You started it in chat** ("help me set up vaccine plans"): it stays in chat.
  - The agent replies with one card per draft (Open), plus **Approve / Approve all**, then receipts.
  - No Inbox item is created. If you don't approve, it isn't done; the agent doesn't chase.
- **You didn't start it** (a scheduled trigger, a background agent, a teammate, a system check): it becomes an **Inbox** item. When an agent did it, a message also appears in that agent's chat.
- **Reports** (the daily report, for example) go to chat only. A decision a report raises is its own Inbox item.
- **Approving saves exactly the drafted Action.** It is the same call as pressing the Action's own button; the agent doesn't redo the work.
- **Default, for Approve all with invalid drafts:** a draft that fails a check (capacity, withdrawal, a required field) can't be approved. Approve all approves the valid ones and lists the rest with their reason and Open.

---

## 5. The parts every feature reuses

### 5.1 Action page: style B ("Sentri green, sectioned")
**Decided (5 Nov 2026).**

- **Tokens:**
  - Inter 14;
  - 40 px controls;
  - radius 12 px (cards), 10 px (controls);
  - no borders; shadow-sm on cards;
  - primary Sentri green `#276640`;
  - text `#1c1917`, muted `#57534e`, lines `#e7e5e4`, input borders `#d6d3d1`.
- **Background:**
  - **Forms are white.** The grey `#f5f5f4` with white cards is for display-heavy pages the owner named (Schedule; record layouts).
  - Don't move a style to another page without asking. A grey Home was rejected as dull.
  - *Open:* the background of Custom pages and the Inbox.
- **Layout:** a title, then sections. Each section has a 240 px label column (title and one-line help) and a fields column, separated by a thin rule.
- **Footer (save bar):** white, with a line on top.
  - On the left, the summary ("4 sows · Amoxicillin · 3 doses, every 24 hours") and the consequence ("Tasks go to the phones once issued").
  - On the right, Cancel and the primary button.
  - The primary button is disabled until the form can be issued. The left line then says what's missing ("Add a medicine to issue").
- **Fields:** short values get short fields: up to 280 px for numbers and dates, 140 px for counts.
- **Inline checks:** deterministic rules (capacity, withdrawal, required fields) are checked by code at the field. Each Action's rule list comes from its API. Reasoning goes in chat.
- **Pick pigs:** a screen inside the Action with its own back link ("‹ New treatment"). The footer shows "N of M picked · Cancel · Continue with N sows".

### 5.2 Pig list: one component for every list of pigs
**Decided (5 Nov 2026).** The full rule is `style-board/pig-list-rule.md`; this summary must not contradict it.

- **Modes:**

  | Mode | Opened by | Checkbox | Bottom bar |
  |---|---|---|---|
  | Browse | the Pigs page | no | none |
  | Browse, scoped | a record (a treatment's sows) | no | none |
  | Pick | an Action ("Pick pigs") | yes | "N of M picked" · Cancel · **Continue with N sows** |
  | Act | an agent's answer or a saved Custom page | yes | "N picked" · **Actions ▾** (opens an Action with them filled in) |

- **Base:**
  - The **Pig** column (the tag, weight 600) and the **Pen** column come first and are fixed.
  - The filter row: the opener's default filters, **+ Filter**, then **Reset** at the right end.
  - Search under the filter row: "Find a pig in these results". It narrows only within the current results.
  - **Columns** button.
- **Never an unfiltered list.** A scope (a scoped list's record) or any filter counts as a filter. Only with neither, show "Choose a room, batch or finding to see pigs."
  - A scope is fixed and is not shown as a filter.
- **Defaults come from the opener.**
  - Treatment's filters: Room or pen, Disease or symptom, Triage status (Urgent, Priority, Watch).
  - Treatment's columns: Finding, Triage status.
- **Value renderers (one per type):**
  - **Number:** right-aligned, tabular figures, unit in the header; out of range = red text only.
  - **Status:** the badge for its vocabulary (triage or task, §8).
  - **Tags:** at most 2, then +N.
  - **Date:** "Thu 5 Nov" or "since Wed".
  - **Short text:** one muted line.
- **Sorting:** any number column sorts.
- **Width:** about 6 columns fit at the default 680 px; more when the tab is wide. Past what fits, the table scrolls sideways with the checkbox, Pig and Pen pinned.
- **Reset** returns the filters to the opener's defaults. **Clear** empties something typed. The query chip's ✕ **removes** the query.
- **Row comments:** an agent may comment on a row: an avatar marker at the row's end, opening under the row with its fix (for example "Untick C12") and Dismiss.

### 5.3 Query and highlight
**Decided (6 Nov 2026).**

- **A query** = filters from the **filter catalogue**, plus, for lists, columns from the **column catalogue**.
  - Both catalogues list real backend fields. Each feature's fields come with its API (Default: no field exists only in the frontend).
  - People and agents use the same catalogues.
- **Shown as one chip:** the agent's avatar plus plain words, "Vet · lame in Gestation 2, fever this week".
  - Opening the chip shows the normal filters it stands for.
  - ✕ removes it.
  - One agent query at a time: a new one replaces the old.
- **In a list:** rows and columns.
- **In the Farm view (a highlight):**
  - Matching pigs light up and everything else fades. The count shows in the results card.
  - Each lit pig's label carries **at most one value** the agent picks ("D40 · 39.8").
  - A **results card** in the right panel:
    - Its title is the question in plain words ("Fever this week"). The agent and the count sit under it.
    - Below that is one table, with a divider row per room (the room's name and pig count) and roomy rows (about 50 px). The columns are Pig, then the agent's columns (here Finding and °C).
    - The table is sorted hottest first within each room. Rooms are ordered by their first value.
    - The table scrolls inside the card, so the buttons stay put.
    - Clicking a row flies the camera to that pig.
  - The results card is the query's rendering, not a record page.
  - **"See as a list"** opens a Custom page with the same query and all its columns.
- **The agent answers where the user is.** In the Farm view it highlights; in a list it filters. When the map can't show the answer, the agent opens a Custom page itself and says why in chat:
  - pigs that have left the farm;
  - the future (moves, next week);
  - ranking and comparison.
- **Scale:**
  - Zoomed out, rooms show a count badge, and the results card's table is divided by room.
  - Group pens light up as a fraction ("12 of 30"), because a pen is a grouping.
- **A highlight is a view, not a task.** To make the barn act, use Select → Actions, which creates a record that reaches the phones.
- **Highlights stay until removed.** The chip is visible the whole time.
- **Values always come from data.** An agent never writes a value. A missing figure becomes a named metric in the catalogue, with its definition on the column header.

### 5.4 Agent comments on an Action
**Decided (5 Nov 2026), except where marked.**

- **Field comment.** The page declares its comment anchors in code; an agent can comment only where an anchor exists.
  - **Look:** a soft amber box under the field (`#fdf6e7`) with the agent's avatar, name, time and one short message. The field's border turns amber `#b45309`.
  - **Actions:**
    - **Apply**, a named fix such as "Use intramuscular", sets the field;
    - **Dismiss**;
    - **Reply** (the quote icon) puts a quoted reply into the chat composer.
  - **Lifetime:** it stays while the draft lives, including through Change pigs and back. It clears when applied, dismissed, issued or discarded.
  - **Use:** rule breaks, risks and recommendations.
  - *Open:* the proposed limit is at most 3 open on a page.
- **Page-level comment** *(Open, proposed)*: for a remark that spans several fields.
  - Same component, anchored under the page title.
  - At most one per page.
- **Filled-in credit:** when an agent drafted the form, one quiet line sits under the title: "Vet filled this in at 08:41. Check it before you issue."
  - It is metadata, not a comment.
  - It disappears once the form is issued.
- **Never on a page:**
  - banners;
  - "AI suggests" evidence sections;
  - "Ask the AI" buttons (the chat is beside the page);
  - per-field "filled by AI" chips.
- **"Ask Vet in chat"** appears only at the bottom of the + Filter menu and in a list's empty state.
  - Clicking it focuses the composer in that agent's chat.
  - It is never a tooltip or a permanent hint.

### 5.5 Agent cards in chat
- A card opens one thing (an Action, a record or a Custom page). It has:
  - an icon tile;
  - a title ("New treatment · 4 sows");
  - a one-line state ("Filled in by Vet · not issued yet");
  - **Open**.
- A bundle has one card per item, plus Approve all (§4).

### 5.6 Empty, loading and error states (Default)
- **Loading:** a quiet skeleton per block, with no spinner over the page.
- **Empty:** a one-line reason ("No pigs match these filters."), plus the Ask hint where §5.4 allows it.
- **Error:** inline, at the block that failed, with Retry. A failed Issue keeps the draft and says what failed in the save bar.

---

## 6. What agents can and can't do (the AI contract)

**Decided.** **Code renders everything. Agents write only words, queries and drafts.**

- **Agents can:**
  - talk in chat;
  - draft Action values, through the same API the Action uses;
  - comment at declared anchors;
  - set queries and columns from the catalogues;
  - compose Custom pages from the fixed blocks;
  - send ops to engines (the farm layout engine, the room planner);
  - create Inbox items, for work the user didn't start.
- **Agents can't:**
  - render UI, or write HTML or three.js;
  - invent a block, a colour or a layout;
  - write a value into a table;
  - issue, approve or send anything without the user's OK.
- **Planners are rules, not reasoning.** Room assignment and moves run on deterministic rules plus the farm's preferences. The agent calls the planner as a tool and speaks only when the plan breaks.
- **Farm layout:** agents send ops to a pure layout engine over one JSON layout document (in cm); the page draws `derive(doc)`.
- **Phone tasks:**
  - Issuing an Action that directs work creates the record and its phone tasks in one backend call.
  - The console shows the result as the record. Doses given on the phone update the record and the Farm view live.
  - *Open:* the offline and sync-failure case.

---

## 7. The Farm view, as the rest of the console uses it

Normative detail is in `PLAN.md`. The parts other features touch:

- **Levels:** farm › zone › section › room › pen (› pig). Back goes up one level; clicking empty ground goes up one level.
- **Bottom bar:** Select · Schedule · Equipment · Actions ("the left shows, the bottom does").
  - Select ticks pigs or pens.
  - Actions opens an Action with them (§3.2).
- **3D | Plan:**
  - 3D is the default.
  - Plan (bird's-eye) is a tool a task switches to (show, pick or pick-rows of pens). When the task ends, the camera returns to where it was.
- **Running task:** pens and crates take the task-status colours. Clicking a bar segment or a legend row highlights only those pigs.
- **Queries and highlights:** §5.3.

**Decided (6 Nov 2026):**

- **Schedule replaces Batches.**
  - The bar's Schedule opens Home's Schedule timeline, scoped to the level you're on (farm › zone › section › room › pen) and grouped by batch.
  - A task row opens its record in the right panel. A batch name opens the batch.
  - There is no separate batch calendar.
- **A pen opens its contents.** One pig opens that pig; several pigs open the pig list. A pen has no "Pigs" pill.
- **Adding anything places first:** zone, section, room, lane, row, door, device.
  1. Choose what to add.
  2. The pointer carries its shape: a room's box, a zone's outline, a device's icon. One line says where to click.
  3. Click to put it down.
  4. Then name it.

  Add room is the model. The camera stays where you are and never zooms out.
- **Add → Device** starts the device flow:
  1. a grouped list (Climate, Feed and water, Comfort, Other), each with its icon, its name and what it serves;
  2. placing it;
  3. an optional "Connects to";
  4. Save.
- *Open:* moving a room's edit actions (Add lane, Add device, Reshape walls, Delete) from the top bar into the room card, as click-in pages.

---

## 8. Visual rules (system-wide)

- **Surfaces:**
  - A page is one surface; groups are white cards. No cards inside cards, and no tinted containers that mean nothing.
  - Footers and docks are white with a line on top.
- **Task status colours.** One hue per status, everywhere (phone, console, Farm view):

  | Status | Colour |
  |---|---|
  | Done | green |
  | Today / in progress | blue |
  | Late / needs you / Skipped | amber |
  | Waiting | an outline or empty track |
  | Act now | red, exactly one red signal per row |

  - A task past its plan is "late", never red.
  - Shapes that hold a number take a light fill with same-hue ink. Thin marks take the mark colour.
- **Triage status badges:** Urgent = red badge (the row's one red signal), Priority = amber badge, Watch = outline badge.
- **Agent identity colours:**

  | Agent | Colour |
  |---|---|
  | GM | ink `#20291F` |
  | PR | `#FCEFD6` / `#8A5A12` |
  | VT | `#DDF1EF` / `#1F6F68` |
  | BS | `#ECE8FB` / `#5B4AB3` |
  | EQ | `#FBE5E3` / `#A23B33` |

  - They are used only on avatar tiles. They are identity, never status, and don't count toward the one-red rule.
  - Nothing else signals "AI".
- **Icons:**
  - One meaning per icon, reused wherever that meaning applies.
  - Never the same icon on two section headings of one page.
  - One `pig` for every kind and age.
  - ··· for every Actions button.
  - A new icon passes a blind naming test first.
  - Table: `ux/design-system/components/Icon/README.md`.
- **Say it once:** a state already shown never gets a second label. A part repeated across features has one look.
- **Information budget:** rank what the user must see first; cut what repeats a header; never add a part just because there is room.
- **Navigation:**
  - Back = up one level, keeping any draft.
  - ✕ closes a drawer, card or tab.
  - Esc closes a popover first, then ends a task (Plan, picking), then goes up a level. It never dismisses an agent comment or leaves an Action.
- **Language:** English first. Chinese is done when a feature freezes.

---

## 9. Worked example: Treatment end to end

1. **Ways in:**
   - / Actions → Treatment opens Pick pigs.
   - From the Farm view with pigs picked: the form opens with them.
   - From the Farm view with a whole room: Pick pigs opens.
   - The Vet's chat card ("New treatment · 4 sows · Filled in by Vet"): the filled form opens.
   - Schedule's Amox row: the running treatment opens in the Farm view.
2. **Pick pigs:**
   - Room / Disease / Triage-status filters, + Filter (with Ask Vet), and search in the results.
   - Pick by row or checkbox, or pick all.
   - Continue with N sows.
   - "Pick in the farm view" (§3.2).
3. **New treatment:**
   - **Pigs:** chips, plus Change pigs (which keeps the picks).
   - **Why:** diseases and symptoms.
   - **Prescription:** from an earlier prescription, medicine, form, method, dose, start, several doses → doses and interval. Withdrawal comes from the medicine record.
   - **Notes.**
4. **The Vet's draft:** the credit line, plus a field comment on Method with Use intramuscular / Dismiss / Reply.
5. **Issue** creates the record and the phone tasks, then opens the Farm view.
6. **Running treatment** (right panel):
   - The sows' crates are coloured by dose status.
   - The panel shows the current dose, how many have been given, the next dose, the sows with their marks, and the prescription.
   - For a large treatment, "See as a list" opens a scoped list on a Custom page.
   - ··· Actions: Change, End early.

Canvas: the Treatment page (top frame live; Farm view mock-ups beside it).

---

## 10. Who can do what

**Open (proposal, 8 Nov).** Roles and permissions are their own feature, designed apart from any one page; each Action page shows or hides its actions by these rules and says nothing else about them. First case: the running treatment's Actions menu.

| Action | Vet | Manager | Worker | Agent |
| --- | --- | --- | --- | --- |
| Change a prescription, hold, resume, stop | Yes | No | No | Fills it in; the vet issues |
| Add pigs to a course, take pigs off | Yes | No | No | Fills it in; the vet issues |
| Close a course whose doses are all settled | Yes | Yes | No | No |
| Correct a recorded dose (with a reason, audited) | Yes | No | No | No |
| Record doses | Phone | Phone | Phone | No |
| See the treatment page | Yes | Yes | Read-only | Yes |

- A person who can't take an action doesn't see it: the page stays the same without the Actions menu.
- Prescriptions belong to the human vet, so an agent never issues one.
- Open: whether a farm can grant a manager hold or stop, and who may add pigs during an outbreak.

## 11. Open (don't build these as final)

- **Home's form.** Proposals on the canvas's Home page:
  - "Home, calmer" (lists);
  - "Home, calmer, with cards";
  - "Home as a routing page", which the owner found too empty.

  The next proposal is routing plus read-only peeks:
  - the Inbox's top 3 titles;
  - Today's next jobs;
  - per-area attention lines that say why ("D40, D41 · 39.8 °C, lame · Gestation 2"), each opening its page.
- **The Inbox page.**
- **Dashboards:** which charts make up the fixed baseline set. A proposal based on the old web Home is on the canvas's Home page.
- **Daily report:**
  - timing (after the day ends, or in the morning);
  - what goes in each person's section (by role, by what they own, or by what they asked about);
  - where past reports are kept.
- **Page-level agent comments, and the 3-comment limit** (§5.4).
- **Form pickers:** the medicine, method and similar dropdowns don't open in the prototype. Use the design system's pickers.
- **Records with no place** (§3.1): the rule is set, but no screen is designed.
- **Backgrounds** of Custom pages and the Inbox.
- **Offline and sync failure** for issued Actions.
- **The data contract** (catalogue fields, query format, record addresses): comes per feature with its API. This doc only fixes the shape.
