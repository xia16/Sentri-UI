# Transfer: the flow (proposal, 2026-11-03)

The owner's question: what should moving pigs feel like across the whole farm, when a sow goes group housing → gestation crate →
group housing → farrowing crate, and group housing can be one big pen or many small ones. Nothing here is ruled.

## What the crew does

Moving out, nobody holds a phone. They look once (which pens, who stays, where to), put the phone away and move pigs. Receiving
is the only point where someone stops anyway, because the pigs have to be put somewhere and the gate has to close behind them.

## Proposal: every move is a task, recorded once, at the destination, by exception

1. **Every move is a task, and the plan makes it.** The Console or the production line plan (live system: a transfer plan can
   raise a task by itself, e.g. 5 days before farrowing starts) makes one Transfer task per batch and move: mating → crates,
   crates → group gestation, gestation → farrowing, weaning (sows out, piglets to nursery), nursery → finisher. It shows in
   Today in both units: *Move out* at the source, *Receive* at the destination. One pattern for every move.
2. **The source records nothing.** *Pigs to move* is a glance: how many, where to, when, which pens empty, and the pigs that stay
   named under the map. No button: the pigs leave the source's record when they are received (live system: between out and in
   they are in transit).
3. **The destination records once, by exception.** What has to be recorded depends on whether the pigs have IDs:
   - **Pigs without ID** (piglets, growers): count each pen. Designed: the task page with the unit's pen map, tap a pen, count.
   - **Pigs with ID** (sows, gilts): a batch goes out together and each sow takes whichever crate or pen she reaches first
     (owner, 2026-11-03), so there is no sow-by-sow plan to confirm. Receiving locates them: *Scan* in the dock keeps the pen map
     on screen; scan one sow or a batch, they gather in the footer, tap the pen or crate they are in and they are in it.
4. **It ends on End task**: Received, Not arrived (opens: without ID as a number, with ID in the With ID picker, Move to).

## Questions

1. The source records nothing; pigs leave its record when received. **Ruled (owner, 2026-11-03): moving out is nothing, just a list
   to show them.** A pen that empties says *All*; a pen moving some says *12/13*, the 12 that move big; no icon, no key, no list of pigs that stay.
2. ~~Sows received by exception against a sow-by-sow plan.~~ Withdrawn (owner, 2026-11-03): farms move a batch at once and sows take any crate; sows are scanned into where they are (above).
3. Moving into farrowing is its own Transfer task. **Ruled (owner, 2026-11-03): yes; transfer tasks and their triggers are set up in
   the Console.** How farms automate moves (where to and when, by date or by a change in a pig's status) gets its own doc later;
   for now only the phone side is designed.
