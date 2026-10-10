# Feed plan 饲喂计划

## Problem

Feed is guidance for the worker, not a task to tick off. The worker needs to see what a pen and each pig is fed today and to change it for one pig, several pigs or several pens in one move. The old Figma has no feed plan screen; this feature is new and is built inside the Inspection prototype.

## Who

The worker on the walk, who reads today's feed on the pen header, and the worker who must adjust it after a finding (a thin sow, a sick pen). Sows in a trough pen and in a station pen are covered; ad-lib pens are read-only.

## Anchor

No anchor. A pig's feed is always in one of four states (follow the curve, adjusted by a percentage, held at a fixed amount, stopped), but the states do not drive other work, so the screens are grouped as Read, Several pens, Adjust and On the walk list.

## Rules

- Feed is guidance: formula, amount, timing. It creates no completion event; the Record as done and refill actions were removed (ROUND-3).
- A pig's allowance = base amount from the curve x factor, or a held amount, or 0 when stopped. A pen's total is the sum of its pigs.
- The editor changes feed by a percentage of the curve from -50% to +50%, or holds the amount, or stops feed. The percentage replaces existing adjustments.
- Ad-lib pigs, dead sows and pigs with no plan are listed as blocked with the reason and are never changed.
- An end date, if given, is today or later. A note is optional.
- Opening the editor from a pen or from ticked pens captures the pigs of those pens; the same editor serves pens, ticked pigs and one pig.
- Keep the feeding program (the animal's plan) separate from the feed formula (the product) - ASTRA-FEED-PLAN-FIELDS.

## Scope

In: Pen feeding (reading), ad-lib pen, the several-pens entry, the Adjust feed editor and its end date and note, the pig's feed plan with the base curve, and how a pen-wide increase, decrease or hold reads on the walk list, and switching a pen's (or a batch's pens') formula on the day it is due (drawn in the pen workflow deck, not in the Astra prototype).

Out: the pen header on the walk (inspection), the Feeding block on the pig record (pig-profile), body-condition findings that used to link to feed (health-record). Feed inventory, purchase, supplier and formula authoring belong to management screens.

## Decisions

- One editor for every scope; only the target changes.
- Percentage limits of -50% and +50%, slider steps of 5%.
- The base curve is a sample (day 35 to 56 around the pig's base amount) and makes no claim about real feed.

Open (recorded on the screens as issues):

- Brand, supplier, energy (ME or NE), protein and lysine proposed in ASTRA-FEED-PLAN-FIELDS are not drawn; units for protein and lysine are unconfirmed.
- Saving a change silently ends the link between a body-condition finding and its feed adjustment.
- Three ways to return to the curve (mode, 0%, Reset).
- "Formula due" on the pen header has no screen that explains it.
- A held amount shows only a tag; the kg is in a tooltip.
