# Brief: recording live and dead piglets during farrowing

## The product
Sentri is a native phone app (iOS and Android) for pig-farm workers. This brief is about one screen job inside the Farrowing task: keeping a sow's litter count while she gives birth.

## The worker and the setting
- Farrowing-house worker, often at night, in a dim and noisy barn, wearing wet gloves, one hand on the crate, the phone in the other hand.
- A sow farrows over several hours. Workers come and go: one worker may watch a whole birth, another walks the room every hour and looks into each crate, and the next shift continues from the same record.
- The phone can be locked, pocketed or interrupted at any moment (the sow needs help, a piglet must be revived). The signal is unreliable; records are stored on the phone and sync later.
- Gloves and haste: big targets (footer and bar buttons 56px tall, every other target at least 44pt), text a worker acts on at least 13px, no hover, no long-press as the only way to do something, no tiny controls. Touch only.

## What is recorded for one sow's litter
- **Alive**: the number of live piglets with her now.
- **Dead**: the number of dead piglets, each with a cause. The farm's cause list: stillborn, mummified, crushed (laid on by the sow), scours, starve-out, other. The farm reports stillborn and crushed rates, so the cause matters to management, but it is a detail of a death.
- **Born** = Alive + Dead. Never typed; always derived. It is locked when the worker finishes farrowing (a separate, deliberate step, out of scope here).
- Every change is stamped with who and when, and the history is kept (a later correction never erases the first figure).

## Scenarios at the crate (all real)
1. A piglet is born alive while the worker watches.
2. A piglet is born dead (stillborn) or a mummified fetus comes out.
3. A piglet that was already counted alive dies (the sow lies on it; it starves; scours). It should leave Alive and join Dead; Born stays the same.
4. The worker finds a dead piglet nobody had counted (born and died between visits). It should join Dead; Alive is already right; Born goes up by one.
5. The worker mis-taps (counts one too many alive, or adds a death by mistake) and wants to take that one tap back.
6. The worker realises an earlier number, maybe from another shift, is wrong (miscounted: there were never 10 alive), with no death involved.
7. A piglet has vanished: fewer alive than recorded and no body (eaten, or lost under bedding).
8. An earlier death was recorded with the wrong cause, or on the wrong sow.
9. The worker walks up, looks in, and simply sees "9 alive and 1 dead body", without knowing what the record says or what happened since the last visit.

The core ambiguity: when the worker adds a death, did that piglet come out of the Alive count (scenario 3), or was Alive already right (scenarios 2 and 4)? The worker at the crate often cannot know which, and the record must still end up right. A second confusion: telling apart "something happened now" (a birth, a death) from "an older number was wrong" (a correction).

## What hurts today (evidence from walking the current design)
- Alive has − n + and saves on every tap. − only takes back taps made during this visit; below that it silently stops.
- Deaths are entered on a second screen of six cause steppers, which looks almost identical to the correction screen (seven steppers showing the same totals). Workers cannot tell "a piglet just died" from "fix an old number".
- Adding a death never lowers Alive, so for scenario 3 the worker must also remember to press − on Alive. Nothing says so; when they forget, Born is one too high.
- Changing Alive from 10 to 9 on the correction screen does not say whether a piglet died, vanished or was never there.
- The owner is unsure whether saving on every tap is right ("tap + twice, tap Back, and it is saved?").

## Settled by the owner (keep)
- Born is derived, never typed.
- History is kept; corrections are stamped, never silent.
- It must work for gloved, one-handed use; nothing important hidden behind hover or long-press.
- The owner's priority: **"we can lose functionality but not confuse the users."** Fewer options that are obviously right beat a complete set of options that need explaining.

## Open (your call)
- Whether a death lowers Alive automatically, never, or depends on something.
- Whether the worker records events (born, died) or states what they see (a census: how many alive, how many dead now), or a mix.
- Whether the cause is asked at all, asked at the moment, or asked later.
- How saving works (every tap, or a confirm), and how a mis-tap is undone.
- How "an old number was wrong" is separated from "something happened now".
- The number of screens, and what is on the main counting surface.
