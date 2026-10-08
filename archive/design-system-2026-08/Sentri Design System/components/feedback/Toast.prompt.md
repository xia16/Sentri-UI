Transient confirmation bar (dark ink, bottom of screen) — record confirmations with Undo. Fades in/out 200ms; no stacking.

```jsx
<Toast tone="success" message="8 results recorded" action="Undo" onAction={undo} />
<Toast tone="error" message="Couldn't sync — saved locally" />
```
