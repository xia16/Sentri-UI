Bottom sheet for record entry and confirmations — the primary modal surface (thumb-reachable). 40% ink scrim; footer holds the action buttons.

```jsx
<Sheet open={open} onClose={close} title="Record result — 8 selected"
  footer={<Button size="lg" full onClick={save}>Record 8 results</Button>}>
  <Select label="Result" options={['Pregnant','Not pregnant','Recheck']} value={r} onChange={setR} />
</Sheet>
```
