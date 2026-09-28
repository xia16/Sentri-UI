Compact numeric pill in status colors — workload counts on rows and nav ("6 overdue in Gestation 2"). Pass `null` for unknown counts (renders "—").

```jsx
<CountPill count={6} status="overdue" />
<CountPill count={14} status="due" />
<CountPill count={null} status="none" />
```
