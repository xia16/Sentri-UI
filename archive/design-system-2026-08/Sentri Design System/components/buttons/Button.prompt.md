The action control: olive primary, bordered secondary, ghost, red danger; verbs only ("Record", "Mark pregnant", "Move 12 pigs").

```jsx
<Button icon="check" onClick={record}>Record</Button>
<Button variant="secondary" size="sm">Skip</Button>
<Button variant="primary" size="lg" full>Record 8 results</Button>
```

`size="lg"` + `full` is the standard bottom-of-screen field action. Hover darkens; press scales 0.98.
