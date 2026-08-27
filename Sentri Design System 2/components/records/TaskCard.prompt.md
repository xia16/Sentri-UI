One work type as a card: due/overdue badges, locations, "x of y" progress, and an upcoming line — a task stays visible with only `nextUp` when nothing is due now (missing ≠ zero).

```jsx
<TaskCard title="Pregnancy check" icon="search-check" overdue={2} due={31}
  locations="Gestation 1–3" progress={{done:18,total:31}}
  nextUp="18 eligible in 4 days" onClick={openTask} />
```
