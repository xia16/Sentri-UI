  // 1–8 · the bar and 3D as a pair: once on top, once at the bottom
  const colHead = (h, sub) => '<div style="' + st({ marginBottom: '-36px' }) + '"><div style="' + st({ fontSize: '20px', lineHeight: '28px', fontWeight: 600 }) + '">' + h + '</div><div style="' + st({ color: '#5D665F', fontSize: '14px' }) + '">' + sub + '</div></div>';
  const variant = (pos, n0, where) => {
    POS = pos;
    const pigsInner = H.head('Pigs', 'Gestation 2', '') + H.sec('Show on the farm', '<span style="font-size: 13px; font-weight: 500;">Clear</span>', 20) + H.card([{ name: 'Sows', n: '182', sw: '#2F3A33', on: true, bold: true }, { name: 'Boars', n: '4', sw: '#718075', bold: true }].map(choice).join(''), { pad: '6px' });
    const out = [
      frame(n0, 'The bar and 3D, ' + where, 'The bar: ‹ goes one level up, the name switches between places at this level, then Select, Batches, Pigs with how many there are, Devices (the sensors live there; a dot in the worst colour inside, red here because the feed line has stopped), and Actions. Just right of it, apart, the 3D button: named by what you are looking at (3D or Plan), it holds the camera tools.', B.room, roomTop('')),
      frame(n0 + 1, '3D opened: the camera tools', 'It opens ' + (pos === 'top' ? 'downward' : 'upward') + '. 3D and Plan are one switch; rotate, zoom, fit and night; Edit layout sits apart. Click only: it stays open while you rotate or zoom and closes when you click the farm.', B.room, roomTop('', { viewOpen: true }) + viewMenu()),
      frame(n0 + 2, 'Click the name: switch rooms', 'Just the places at this level, the current one ticked, a red dot where something is wrong; it opens ' + (pos === 'top' ? 'down' : 'up') + ' from the name. To go up, use ‹, then the name again.', B.room,
        roomTop('', { open: true, under: switcher([{ name: 'Gestation 1', n: '152 pigs' }, { name: 'Gestation 2', n: '186 pigs', dot: true, on: true }, { name: 'Sick room', n: '3 pigs', dot: true }]) })),
      frame(n0 + 3, 'Pigs 186 opens its panel', 'Panels open on the right, ' + (pos === 'top' ? 'under' : 'above') + ' the bar. Pick a kind and only those pens keep their colour; <b>Clear</b> brings every pen back.', B.room, roomTop('pigs') + panel(pigsInner)),
    ];
    POS = 'top'; return out;
  };
  const A = variant('top', 1, 'on top'), Bv = variant('bottom', 5, 'at the bottom');
