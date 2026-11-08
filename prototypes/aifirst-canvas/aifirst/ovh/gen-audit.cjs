const fs = require('fs'), path = require('path');
const sharp = require('sharp');
const R = 'C:/Users/ying_/Documents/Codex/2026-09-08/clo/Sentri-UI/.claude/worktrees/aifirst-canvas/prototypes/aifirst-canvas/render/';
const rows = [
  ['1', 'Farm level colours rooms by pen type, in status colours', 'Farrowing reads as "needs a look", nursery as "in progress", the sick room as urgent; empty Room 1 and Room 3 look as full as Room 2.', 'The same ladder as a room at every level: a sow = neutral, empty = near-white, amber only where a pen needs a look. The type stays in the label.', 'au01farm', 'af01farm'],
  ['2', 'Batch view paints the batch\u2019s stalls pink', 'The last pink on the map; it means only "in this batch".', 'The batch\u2019s stalls a step darker than occupied; every other stall near-white.', 'au14batch', 'af14batch'],
  ['3', 'At night, empty stalls turn light blue', 'Night light on the near-white reads as the blue "in progress".', 'A warm off-white for empty stalls at night, so they stay neutral.', 'au09planN', 'af09planN'],
  ['4', 'The hover card outlives the room', 'After moving from Farrowing Room 2 to Gestation 1, Farrowing Room 2\u2019s B12 card is still on screen.', 'The hover card clears whenever the view moves to another room or level.', 'au16g1', 'af16g1'],
  ['5', 'Pen tags sit on the stalls they name', 'In Plan the B15 tag hides half of the amber B15 stall.', 'Each tag stands at its own stall\u2019s end, so the stall\u2019s colour stays visible.', 'au08plan', 'af08plan'],
  ['6', 'Close up, tags sit across the aisle', 'B-row tags run beside C\u2019s troughs; you can\u2019t tell which row a tag belongs to.', 'Each tag on its own stall\u2019s end, on its own row\u2019s side.', 'au04roomZ4', 'af04roomZ4'],
  ['7', 'Heat lamps glow orange by day', 'The warm pools look like the amber "needs a look" stall (A7).', 'The lamp glow is faint by day and full at night; A7 is the only warm stall by day.', 'au06pen', 'af06pen']
];
(async () => {
  const img = async (n) => 'data:image/jpeg;base64,' + (await sharp(R + 'L3JS_' + n + '.png').resize({ width: 980 }).jpeg({ quality: 80 }).toBuffer()).toString('base64');
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let body = '';
  for (const r of rows) {
    const b = await img(r[4]), a = await img(r[5]);
    body += '<section style="margin-top: 44px;"><div style="display: flex; align-items: baseline; gap: 14px;"><span style="font-size: 15px; font-weight: 600; color: #5D665F; width: 22px;">' + r[0] + '</span><h2 style="margin: 0; font-size: 20px; line-height: 28px; font-weight: 600;">' + esc(r[1]) + '</h2></div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 6px 0 0 36px; font-size: 14px; line-height: 21px; color: #3B4540;"><p style="margin: 0;">' + esc(r[2]) + '</p><p style="margin: 0;"><b style="font-weight: 600; color: #111511;">Fix:</b> ' + esc(r[3]) + '</p></div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 14px;">' +
      ['Before', b, 'After', a].reduce((acc, v, i, arr) => i % 2 ? acc : acc + '<figure style="margin: 0;"><figcaption style="font-size: 13px; font-weight: 600; color: ' + (i ? '#1d4d2e' : '#5D665F') + '; margin-bottom: 8px;">' + v + '</figcaption><img src="' + arr[i + 1] + '" alt="' + v + ': ' + esc(r[1]) + '" style="display: block; width: 980px; height: 598px; border-radius: 12px; box-shadow: 0 0 0 1px #DADFD5;"></figure>', '') +
      '</div></section>';
  }
  const notes = '<section style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">' +
    '<div style="padding: 18px 20px; border-radius: 14px; background: #FFFFFF; box-shadow: 0 0 0 1px #E6E9E2;"><div style="font-size: 16px; font-weight: 600;">8 · Your call: hover in the plain Farm view</div><p style="margin: 6px 0 0; font-size: 14px; line-height: 21px; color: #3B4540;">It is a three-row card (task statuses plus tags like Thin and Note). Inside a task you set hover to one line. Not changed here.</p></div>' +
    '<div style="padding: 18px 20px; border-radius: 14px; background: #FFFFFF; box-shadow: 0 0 0 1px #E6E9E2;"><div style="font-size: 16px; font-weight: 600;">9 · Found while checking: a stray box under the side panel</div><p style="margin: 6px 0 0; font-size: 14px; line-height: 21px; color: #3B4540;">On a pen\u2019s panel, a white box sticks out below the panel\u2019s bottom edge (visible in 7, both shots). Not fixed in this mock-up.</p></div></section>';
  const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Farm view audit</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&amp;display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
    '<div style="width: 2080px; padding: 40px 48px 64px; box-sizing: border-box; background: #F3F4F1; font-family: \'Geist\', system-ui, sans-serif; color: #111511; -webkit-font-smoothing: antialiased;">' +
    '<h1 style="margin: 0; font-size: 28px; line-height: 36px; font-weight: 600; letter-spacing: -.025em;">Farm view audit · before and after (mock-up, not live)</h1>' +
    '<p style="margin: 8px 0 0; font-size: 15px; line-height: 23px; color: #5D665F; max-width: 1400px;">Every zoom level, by day and at night. Seven fixes rendered in a test copy of the Farm view; the live Farm view is unchanged until you say so. Stalls already use the approved colours: a sow #c9cec1, empty #f6f7f3, needs a look amber.</p>' +
    body + notes + '</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":2080,"height":5200}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
  fs.writeFileSync(path.join(__dirname, 'pub/project/FarmViewAudit.dc.html'), html);
  console.log('board', Math.round(html.length / 1024) + ' KB');
})();
