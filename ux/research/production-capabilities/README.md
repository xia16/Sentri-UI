# Production capability review

Source: Figma file `psrxDa9LRWLdTL9XMZmWdc`, section `2490:4892` (reviewed 17 Sep 2026).

The source section is a collection of flows rather than one screen. The prototype adopts the underlying capabilities and data states while keeping Sentri's current page, drawer, bottom action bar, and save-language conventions.

| Capability | Figma reference nodes | Current prototype | Decision |
| --- | --- | --- | --- |
| Markers | `2567:8730`, `2567:8778`, `2567:8825`, `2567:8917` | Missing | Add a persistent marker editor to a sow's General actions. |
| Treatment | `2632:16590`, `2583:20812`, `2583:20308` | Strong partial | Keep the existing searchable medicine picker, condition picker, bulk roster, and per-pig dose overrides. Document the remaining production rules. |
| Piglet processing | `2511:8521`, `2512:9051`, `2512:9216` | Missing from live Farrowing study | Add a litter care page, due-day checklist, identity roster, and identity editor. |
| Fostering | `2565:4696`, `2657:9553`, `2657:9072`, `2657:9355` | Listed but disabled | Add incoming/outgoing direction, destination sow, quantity, and a saved litter event. |
| Mortality | `2857:7199`, `2889:7987`, `2889:8203`, `2900:13209` | Count-only during farrowing | Add selected identified piglets, unidentified quantity, one explicit cause, photos, and a single save result. |
| Count reconciliation | `2519:9350`, `2523:20226` and related count-confirm states | Missing | Add current versus reported count, a bounded stepper, mandatory reason, and an explicit replacement result. |
| Miscarriage | `2567:19584` | Already present | Keep the existing reason, batch-removal consequence, history, and unavailable-state rules. |
| Health management | `2501:6101`, `2632:16389`, `2803:16252` | Already present | Reuse the shared disease/symptom catalogue, care instructions, resolve flow, and treatment flow. |
| Search and identity | `2952:33862`, `2952:34352`, `2952:34476`, `2952:34860` | Search exists for sows; piglet identity missing | Put scan, ear-notch selection, manual entry, and roster search inside Piglet records. |

The resulting navigation is:

```text
Sow record → Actions → Production → Piglet processing / Foster piglets / Record piglet deaths
                         Production → Reconcile piglet count / Record miscarriage
                         General → Add marker
Piglet processing → Care | Piglet records → Edit identity / Report mortality
```

Each capability has its own note in this folder. The live prototype remains in memory only and does not write production data.
