# Assistant 助手

Draft: compiled from existing docs, not yet confirmed.

## Problem

Overnight review finds things a worker must settle (for example a movement note with no destination), and a worker may want to ask about their work. Neither belongs on Home, which is for what to do now. The Assistant is a separate space, reached from the Home header, for findings that need the worker and for questions.

## Who

Floor workers and supervisors in a section. The Assistant opens with the section's context, or the unit's when one is selected.

## Anchor

None. The only lifecycle is a finding: input needed, then answered.

## Rules

- The Assistant opens from the Home header and from Toolbox. Home carries no badge, count or dot for findings.
- Two tabs: Needs you (decisions the overnight review needs, with a count) and Conversations (questions, with suggestions and a composer).
- A finding names its place (section / unit / pen), quotes the source record, says what is missing, and asks for a free-text answer (required, up to 500 characters). Sending saves it; an answered finding leaves Needs you and Home in the same session.
- An answer is added to Records as "Movement clarification received". No live record is changed.
- A question is required and up to 1000 characters; the reply restates the scope. No analysis or farm action is performed and no medical recommendation is given.
- Everything is simulated: no background agent is connected, and answers and conversations reset on reload.

## Scope

In: Needs you, one finding, the answered finding, the up-to-date state, Conversations, a question and reply.

Out: the real agent, notifications, more than one finding, a finding with options instead of free text, editing or withdrawing an answer.

## Decisions

- Decided (ASTRA-HOME-DIRECTION): Assistant opens from the Home header; findings and decision counts live inside it and not on Home.
- Open: whether an answer is applied to the record (filed under To confirm).

## Sources

- ux/research/home/ASTRA-HOME-DIRECTION.md
- ux/research/home/HOME-VI-COVERAGE.md
- ux/research/home/UI-AUDIT-HOME-TASKS.md
- Prototype: ux/system/home-astra-prototype.html
