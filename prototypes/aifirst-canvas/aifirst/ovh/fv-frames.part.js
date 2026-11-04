  // 1 · one connected bar
  const f1 = frame(1, 'One bar across the top', 'Where you are on the left: ‹ goes one level up, the name switches between places at this level, then its sensors. What you can open on the right: Select, Batches, Pigs with how many there are, Equipment; the view tools folded into <b>3D ▾</b>; Actions. No breadcrumb and nothing that reacts to hover, so the bar never changes size under the mouse.', B.room,
    roomTop('') + callout(8, 64, 1) + callout(64, 64, 2) + callout(1000, 64, 3) + callout(1186, 64, 4));
  // 2 · view tools open
  const f2 = frame(2, '3D ▾ opened: the view tools', 'Click only; it stays open while you rotate or zoom and closes when you click the farm. Plan and 3D are one switch at the top. Edit layout leaves the farm view, so it sits apart at the bottom.', B.room, roomTop('', { viewOpen: true }) + viewMenu());
  // 3 · the switcher
  const f3 = frame(3, 'Click the name: switch rooms', 'Just the places at this level, the current one ticked, a red dot where something is wrong. To go up, use ‹ on the bar, then the name again. Click only: it stays open until you pick or click away.', B.room,
    roomTop('', { open: true }) + switcher([{ name: 'Gestation 1', n: '152 pigs' }, { name: 'Gestation 2', n: '186 pigs', dot: true, on: true }, { name: 'Sick room', n: '3 pigs', dot: true }]));
  // 4 · pigs is a main panel
  const pigsInner = H.head('Pigs', 'Gestation 2', '') + H.sec('Show on the farm', '<span style="font-size: 13px; font-weight: 500;">Clear</span>', 20) + H.card([{ name: 'Sows', n: '182', sw: '#2F3A33', on: true, bold: true }, { name: 'Boars', n: '4', sw: '#718075', bold: true }].map(choice).join(''), { pad: '6px' });
  const f5 = frame(4, 'Pigs 186: the count is the door to the filter', 'The number sits on the bar; clicking it opens Pigs on the right, like Batches. Pick a kind and only those pens keep their colour; <b>Clear</b> brings every pen back. The chosen row is a fill inside its box.', B.room,
    roomTop('pigs') + panel(pigsInner));
  // 5 · equipment on the right
  const eqInner = H.head('Equipment', 'Gestation 2', '') + '<div style="margin-top: 16px;">' + eqTiles + '</div>';
  const f6 = frame(5, 'Equipment opens on the right too', 'Same place and size as Batches and Pigs, so the bar behaves one way. The tiles are unchanged; a tile opens its card in the same panel, with Back.', B.panel,
    roomTop('equip') + panel(eqInner));
  // 6 · the task: legend is the key, no tooltip
  const f7 = frame(6, 'A task: the legend is the key, so no tooltip', 'The ring has no hover card: the legend beside it already says the same. Clicking a legend row shows only those pens; the chosen row is a quiet fill that stays inside its card.', B.task,
    taskTop('batches') + taskP);
  // 7 · pig profile: one Performance
  const f8 = frame(7, 'At a pen: no pig count; one Performance', 'At a pen the bar names the pen and Pigs has no count (her card is the panel, shown scrolled to the bottom). Her litters loses its “Performance ›” link; Performance is the button at the bottom, next to Log.', B.pig,
    top({ name: 'Pen A7' }) + pigP);
  // 8 · 960
  const f9 = frame(8, 'At 960 wide: only the sensor that is out of range', 'One bar still fits: the in-range sensors step back (they stay in Equipment), the one out of range stays on the bar.', B.room960,
    top({ name: 'Gestation 2', dot: true, chips: chip(I.air, 'NH₃ 9.4', { bg: K.amberT, color: K.amber }), pigs: 186 }), 960);
