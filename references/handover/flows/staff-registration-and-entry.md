# Staff invite, registration and presence (员工注册与入场)

| | |
|---|---|
| Area | [Console IA, workbench and access](../console-ia-workbench-access.md) |
| Platforms | Console (admin side), a standalone web page (employee side), back end |
| Maturity | specified + built in prototype |
| Newest sources | `Vaccine/prds/saas-login/01-员工注册流程.md` (rev. 2026-07-02); `Vaccine/prds/saas-login/02-员工入场流程.md` (2026-05-24); `Vaccine/prds/saas-login/修改日志/修改日志-2026-07-02-Console员工添加身份证号.md`; `Vaccine/docs/UNIFIED_ACCESS_FLOW.md` (2026-06-01, partly superseded) |
| Related flows | [login-and-farm-switch](login-and-farm-switch.md), [visitor-entry](visitor-entry.md), [console-workbench](console-workbench.md) |

## Job
A farm admin adds an employee and sends an invite; the employee proves the invited phone or email, joins that farm, and is then tracked as on the farm, off the farm or on leave. When done, the person has an account bound to the farm, the invite is "registered", and presence starts as "off the farm".

## Trigger and actors
- Admin: Console staff list, `Add staff`. Employee: opens the registration link (demo address on the standalone page). Presence is changed by a Console admin or a site manager.
- Also involved: the identity provider (verifies the contact), the back end (invites, profile, farm membership).
- Not here: account bans or suspension, roles and permissions, payroll or scheduling.

## Flow
```mermaid
flowchart TD
  subgraph Console
    A["Staff list: Add staff"] --> B["Name, ID number, phone or email"]
    B --> C["Send link: invite = pending"]
  end
  subgraph Employee
    C --> D["Open link: accept page"]
    D -->|"invalid, expired, already bound"| E["Message: ask admin to resend"]
    D -->|"Continue"| F["Verify the invited contact + 6-digit code"]
    F --> G{"Verified contact = invited contact?"}
    G -->|"no"| H["Mismatch page: switch account"]
    G -->|"yes"| I{"New user?"}
    I -->|"yes"| J["Complete profile: name, ID number"]
    I -->|"no, profile complete"| K["Bind farm"]
    J --> K
    K --> L["Joined page: invite = registered"]
  end
  subgraph Back end
    L --> M["Presence = off the farm"]
  end
  L --> N{"How many farms?"}
  N -->|"1 or came from invite"| O["Enter that farm"]
  N -->|"many, not from invite"| P["Choose farm"]
  M --> Q["Admin sets presence: on / off / leave"]
```

## Steps
**Admin (Console staff list)**
1. The list has three tabs: Pending registration, Registered, Expired. Pending shows name, contact, sent time, expiry and a resend action; Registered shows name, contact, presence, farm, registered time; Expired shows expiry and resend.
2. `Add staff`: name, ID number (15 or 18 digits; a trailing `X` is upper-cased; added 2026-07-02; profile data only, not used to verify identity), phone or email. `Send link` creates the invite (7 days) and the person appears under Pending. Resend creates a new link and replaces the old one.

**Employee (standalone page, one focused card per step)**
3. **Accept page**: "Join <farm>", masked contact, hint that the link is valid 7 days, `Continue` or "This is not my phone or email". Link not found, expired and already-bound each show their own message.
4. **Verify page**: enter the invited phone or email (must be on this farm's invite list), send code, enter 6 digits, `Verify and continue`. If the device is already signed in, the code step is skipped but identity is still compared.
5. **Mismatch page** ("current account does not match the invite"): `Switch account` or `Back`.
6. **Complete profile** (new users only): name (up to 20 characters) and ID number required; verified contact and farm are read-only. Users who already have a complete profile skip it; users from another farm just bind.
7. **Joined page**: "Joined <farm>", invite becomes Registered, presence defaults to off the farm. Buttons: `Enter farm`, and `Switch farm` when the account has several.
8. **Where they land:** one farm: that farm. Many farms and came from this invite: the newly bound farm (the switcher stays in the Console). Many farms and not from an invite: the farm chooser ([login-and-farm-switch](login-and-farm-switch.md)).

**Presence (admin, Registered tab)**
9. Filter: all, on the farm, off the farm, on leave. Actions depend on state (see States). Presence is per farm: the same account may be on the farm in one and off in another.

## States
| Object | State | How it gets there | What it allows next |
|---|---|---|---|
| Invite (per farm) | Pending | Admin sends link | Employee can register; admin can resend |
| Invite | Registered | Verified contact matches and farm is bound | Presence tracking |
| Invite | Expired | 7 days without registration | Admin resends |
| Presence (Registered only) | Off the farm | Default after registering, new farm bound, or leave ended | Mark in, set leave |
| Presence | On the farm | Admin marks in | Mark out, set leave |
| Presence | On leave | Admin sets leave | End leave (returns to off the farm) |

## Rules
1. The invite link carries only an opaque token; the back end looks up farm, contact, status and expiry from it.
2. After the identity provider verifies a contact, the back end compares it with the invited contact; a forwarded link is useless to anyone else, and a mismatch never binds.
3. An existing user with another farm can accept a new invite and just binds the new farm; registration status belongs to the invite, not the account.
4. The ID number is saved as employee profile data and is not an identity check.
5. Registration state and presence are separate fields; presence is not a login permission and does not replace invite status.
6. Only Registered staff have presence. Pending and Expired staff cannot be marked in, out or on leave.
7. Cannot mark in while on leave: end leave first. Marking in someone already on the farm changes nothing and says so.
8. Admin must have staff-management rights for the current farm; actions apply to that farm only.

## Data
| Field | Where | Required? |
|---|---|---|
| Name, ID number, phone or email | Add staff | yes |
| Invite: token, farm, target contact, status, sent time, expiry, bound user and time | back end | yes |
| Farm membership: farm, user, presence, joined time | back end | yes |
| Presence: updated time, updated by | back end | yes |

## Edge cases
- Link forwarded to the wrong person: blocked at the contact comparison.
- Invite already used: "you have already joined this farm" and the person may enter.
- Failed code attempts and resend limits: dedicated messages (too frequent, too many failures, expired code).
- Save failure on profile or binding: message and retry.
- Concurrency and undo are not specified.

## Versions
- 2026-05-24: PRDs 01 to 03 written.
- 2026-05-27/28: standalone registration page built with a password step.
- 2026-06-01: unified access flow (generic link, phone first, password required, optional "fill in entry application" after registration).
- 2026-07-02: PRD 01 revised (invite token, no password step); ID number added to Add staff.
- Dropped from the unified flow: multi-farm bulk binding and the generic link.

## Figma and repo
- Figma (Sentri Console Done): Staff (18 screens), Add User and entrance link, Staff H5 Log-in (7), entry application H5 (28). Model differs: the admin adds a person, the person applies, the admin approves, then Face ID. Staff status chips there: On farm, Away / On leave, No Face ID, Terminated.
- Repo: no feature.

## Open questions
1. **Password at registration.** `UNIFIED_ACCESS_FLOW.md` (decision 6) and the prototype page require one; PRD 01 has none; PRD 04 lets login skip it.
2. **Generic link vs invite link.** The unified flow handles several pending farms and mixed registered/pending lists; PRD 01 is single-farm by token; PRD 04 does not mention pending invites.
3. **Staff entry application.** The unified flow and the prototype add "fill in entry application" after registration (identity prefilled and locked), implied to be for staff; PRDs 00, 02 and 04 call it out of scope, and 02 has the admin set presence by hand. No PRD for the form or its review.
4. **Status vocabularies:** Pending / Registered / Expired and On / Off / Leave vs Figma's No Face ID / On farm / On leave / Terminated.
5. The unified flow says presence defaults to "off the farm or on leave"; PRD 02 says off the farm only (02 is the settled one).
