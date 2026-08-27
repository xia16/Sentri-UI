2–3-way mode switch — canonically the "By task / By location" work-organization toggle.

```jsx
<SegmentedControl options={[{value:'task',label:'By task',icon:'clipboard-list'},{value:'location',label:'By location',icon:'map-pin'}]} value={mode} onChange={setMode} />
```
