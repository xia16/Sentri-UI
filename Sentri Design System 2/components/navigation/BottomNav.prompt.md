Fixed bottom tab bar — the app's 3–5 top-level destinations; red badge for overdue counts.

```jsx
<BottomNav value={tab} onChange={setTab} items={[
  {value:'today',label:'Today',icon:'clipboard-list',badge:6},
  {value:'locations',label:'Locations',icon:'map-pin'},
  {value:'animals',label:'Animals',icon:'tag'},
  {value:'more',label:'More',icon:'menu'}]} />
```
