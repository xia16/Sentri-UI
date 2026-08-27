Glove-friendly ± count entry with 48px buttons — piglet counts, doses, feed steps. Prefer this over a keyboard for numbers under ~50.

```jsx
<Stepper label="Born alive" value={n} onChange={setN} max={30} />
<Stepper label="Feed" value={f} onChange={setF} step={0.5} unit="kg" />
```
