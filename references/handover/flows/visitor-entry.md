# Visitor entry (访客入场)

| | |
|---|---|
| Area | [Console IA, workbench and access](../console-ia-workbench-access.md) |
| Platforms | Console (review list), public web pages for the visitor, sampling-point page, back end |
| Maturity | specified + built in prototype (an illustration page only; the real forms are not built) |
| Newest sources | `Vaccine/prds/saas-login/03-访客入场流程.md` (2026-05-24); `Vaccine/prds/saas-login/00-SaaS登陆与入场流程总览.md` (2026-05-24); `Vaccine/src/components/NewEntryApplicationFlowPage.tsx` (2026-05-27, illustration of four steps) |
| Related flows | [staff-registration-and-entry](staff-registration-and-entry.md), [console-workbench](console-workbench.md), [login-and-farm-switch](login-and-farm-switch.md) |

## Job
An outside visitor applies to enter a farm, an admin approves, the visitor takes a sample at the sampling point, and only a passing test gives entry permission. When done, the application is approved, the sample passed, and the entry permission is "in effect".

## Trigger and actors
- Admin copies the farm's application link and sends it. Visitor opens it without logging in. A sampling-point staff member helps at the QR code.
- Visitors have no account and never enter the Console or Mobile app. Not designed: visitor accounts, a visitor permission console, visitors switching farms.

## Flow
```mermaid
flowchart TD
  subgraph Console
    A["Copy farm application link"] --> J["Application list: pending"]
    J -->|"approve"| M["Approved, sampling = not sampled"]
    J -->|"reject"| L["Rejected: end"]
  end
  subgraph Visitor
    A --> C["Open link, fill application"] --> G["Submit: pending review"]
    G --> J
    M --> O["At sampling point: scan QR"]
    O --> S["Type phone or email"]
    S --> V{"Approved application matches?"}
    V -->|"no"| W["Blocked: no approved application found, contact admin"]
    V -->|"yes"| X["Sampling page: check applicant info"]
    X --> Z["Sampling done = waiting for test"]
  end
  subgraph Back end
    Z --> AB{"Test result"}
    AB -->|"pass"| AE["Entry permission in effect"]
    AB -->|"fail"| AC["Permission stays not in effect"]
  end
```

## Steps
**Console admin**
1. Copy or send the farm's long-lived application link. One link per farm, reused for every visitor; each submission becomes its own record.
2. Open the application list. Pending rows show name, phone, email, expected arrival and leave time, purpose. Choose `Approve` (sampling state becomes "not sampled") or `Reject`.

**Visitor**
3. Open the link: the page shows the farm name and the application form: name, phone, email, expected arrival start, expected leave time, purpose, and similar. No login and no code. `Submit` shows a "submitted" message; the record is "pending review".
4. After approval, go to the sampling point and scan its QR code. The page shows the farm and the point.
5. Type phone or email. MVP: no code check. Optional per farm or point (for unattended or high-risk points): an identity-provider code check before matching.
6. The system looks for an approved application on this farm with that contact. None found: blocked ("no approved application found, contact the admin"). Found: the sampling page shows the applicant, contact, farm and point so a person on site can check them.
7. Finishing the sample sets the state to "waiting for test". The test result then sets the permission.

## States
| Object | State | How it gets there | What it allows next |
|---|---|---|---|
| Application | Pending review | Visitor submits | Admin approves or rejects |
| Application | Approved | Admin approves | Sampling at the point |
| Application | Rejected | Admin rejects | Nothing; visitor cannot enter sampling |
| Application | Expired | Not handled in time, or past a set validity | Nothing |
| Sampling | Not sampled | Application approved | Scan QR |
| Sampling | Sampling | Visitor enters the sampling page | Complete sample |
| Sampling | Waiting for test | Sample done | Test result |
| Sampling | Test passed / Test failed | Result recorded | Permission set |
| Entry permission | Not in effect | Default; also after a failed test | Needs a new approved application and passing test (implied) |
| Entry permission | In effect | Test passed | Visitor may enter the farm |

## Rules
1. The link maps to a farm, not a person, and carries an opaque token; the QR code carries a token that resolves to farm and sampling point. Neither shows plain farm or point IDs.
2. Applying needs no login and no code.
3. Only approved applications can open the sampling page.
4. Expected arrival and leave times are advisory: the sampling page may show a "time does not match" hint but never blocks.
5. Entry permission starts only after a passing test.
6. With no code check, the sampling page must show the applicant's details for on-site checking.
7. All applications, sampling and permission calls are isolated by farm.
8. A rejected, unreviewed or unmatched application cannot enter sampling; each shows its own message ("not approved yet", "not approved", not found).

## Data
| Field | Where | Required? |
|---|---|---|
| Visitor name, phone, email, purpose | Application | yes (name and a contact at least; others "and similar") |
| Expected arrival start, expected leave | Application | yes (advisory) |
| Three statuses (application, sampling, permission) | Application record | yes |
| Reviewer, review time | Application record | on review |
| Link token, enabled flag, created time | Farm link | yes |
| Sampling token, farm, point, enabled | QR code | yes |

## Edge cases
- Visitor never applied: contact does not match, blocked.
- Contact differs from the application: blocked.
- QR code invalid or turned off: "sampling point invalid or QR expired".
- Test failed: permission not granted; no retest or reapplication path is specified.
- Reusable link means anyone with it can submit; spam control is not specified.

## Versions
- 2026-05-24: PRD written (apply, review, scan, sample, test, permission).
- 2026-05-27: illustration page for the four steps (no menu entry).
- 2026-08-25: the online Console preview lists Visitors (external people) and Entry applications under two different tabs, with a different description (isolation hours, companions) than this PRD.

## Figma and repo
- Figma: Sentri Console (Done) > Guests (12 screens), a guest entry form with face capture, and a site-permission model with test-report credential and validity. Differs from this flow: Figma guests are Console records with Face ID and permission types; this flow has no face capture, validity or exit, and Figma has no QR-at-sampling-point step.
- Repo: no feature. Sampling tasks and biosecurity have no handover spec other than test strategy.

## Open questions
1. **Visitor model:** non-Console person with entry permission only after sampling (PRD 03) vs Figma guest records with Face ID, permission types and validity.
2. Where is the Console list for visitor applications in the IA? The 2026-08-25 preview shows both Visitors and Entry applications; they show the same three requests.
3. Whether the optional code check is a farm setting or a sampling-point setting (PRD says "by farm or point").
4. What "expired" means for an application (long unhandled or past a validity) is not defined.
5. The relation between visitor sampling and the Console sampling tasks (waiting to sample / waiting for test / tested) is not described.
