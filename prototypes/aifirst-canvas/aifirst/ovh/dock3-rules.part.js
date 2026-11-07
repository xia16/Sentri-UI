  const rules = [
    ['One bar, at the top', 'The place, shown by its kind and its name; then what you can open or do; then 3D or Plan, and Select, or undo · redo · Done, at the right end. It never wraps: what does not fit goes under More.'],
    ['One pane', 'Everything you open or do opens in the main pane: the Schedule, a task, a pig, Add pens, a lane. It sits under the bar and runs to the bottom edge. The bar keeps its full width, so nothing cuts into it.'],
    ['The map is clear', 'No location card. You go into a room or a lane by clicking it on the map; ‹ in the bar goes up a level. Zoom sits alone at the bottom left.'],
    ['Placing', 'The map turns to Plan and the bar itself becomes the guide, with Cancel where Done was. Once it is down, the pane asks for the details.'],
    ['One stack that unwinds', 'The pane\'s back chip names where you came from and puts the pane, the bar\'s place, the camera and the highlights back there. ✕, Esc or a click on empty map close it.'],
    ['One camera move', 'Opening something moves the camera once, straight to it, into the free map beside the pane.']
  ];
  const legend = '<div style="display: flex; align-items: center; gap: 22px; margin-top: 14px; padding: 14px 18px; background: #FFFFFF; border: 1px solid #DFE4D8; border-radius: 16px;"><span style="font-size: 15px; font-weight: 600;">Each place shows its kind</span>' + [['farm', 'Farm'], ['zone', 'Zone (was a blank dashed square)'], ['sec', 'Section'], ['room', 'Room'], ['pen', 'Pen'], ['lane', 'Lane']].map((x) => '<span style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px;">' + kindIc(x[0]) + x[1] + '</span>').join('') + '</div>';
