// Prototype room fixtures in the shape returned by penMapOf(room, types). The app receives these props from the saved
// Farm layout; ?penmap=long|mixed|single lets the atlas show the component's other room states without a new product control.
globalThis.SentriPenMapSampleRooms = {
  standard: { map: true, props: { lanes: ['A', 'B', 'C', 'D'], depth: 6 } },
  long: { map: true, props: { lanes: ['A', 'B', 'C', 'D'].map(letter => ({ letter, runs: [{ n: 50, type: 'Farrowing crate', size: 180 }] })) } },
  mixed: { map: true, props: {
    lanes: ['A', 'B'].map(letter => ({ letter, runs: [{ n: 10, type: 'Group pen', size: 483 }, { n: 12, type: 'Gestation stall', size: 65 }] })),
    rows: [{ letter: 'C', at: 'far', runs: [{ n: 24, type: 'Gestation stall', size: 65 }] }]
  } },
  single: { map: false, props: { lanes: ['B'], depth: 1 } }
};
