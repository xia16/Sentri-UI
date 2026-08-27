Fixed dark-olive header naming the current location/context; back chevron + icon actions (TopBarAction).

```jsx
<TopBar title="Gestation 1" subtitle="Section B · 24 pens" onBack={goBack}
  actions={<><TopBarAction icon="scan-line" label="Scan" /><TopBarAction icon="bell" label="Alerts" badge={3} /></>} />
```
