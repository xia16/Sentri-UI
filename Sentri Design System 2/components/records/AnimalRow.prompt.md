One animal in a work list: mono ID + pen context, status badge, optional attention note; pass `onSelect` to enable bulk selection.

```jsx
<AnimalRow id="SOW-04182" pen="PEN 14" meta="Parity 3 · Batch 24-31" status="due" statusLabel="Day 28" selected={sel} onSelect={setSel} />
<AnimalRow id="SOW-04190" pen="PEN 15" note="On health watch" status="none" statusLabel="Not checked" onClick={open} />
```
