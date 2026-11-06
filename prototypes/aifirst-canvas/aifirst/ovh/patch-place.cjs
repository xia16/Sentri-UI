// Every Add works like Add room: lanes and rows are placed with a green box that snaps to where they go; the door's shape is the same green; Esc cancels.
const fs = require('fs'), path = require('path');
const F = process.argv[2], S = __dirname;
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

once('  edMapTask(u) {', fs.readFileSync(path.join(S, 'edplace.part.js'), 'utf8') + '  edMapTask(u) {');
once("      if (u.view === 'room' && u.devT && u.devT.kind) { c.style.cursor = this.edCursor(u.devT.kind); return; }",
  "      if (u.view === 'room' && (u.tool === 'lane' || u.tool === 'row')) { this.edRoomGhost(e); c.style.cursor = 'crosshair'; return; }\n      if (u.view === 'room' && u.devT && u.devT.kind) { c.style.cursor = this.edCursor(u.devT.kind); return; }");
once("        else if (inRoom && u.devT && u.devT.kind) d0.kind = 'adddevice';", "        else if (inRoom && (u.tool === 'lane' || u.tool === 'row')) d0.kind = 'edplace';\n        else if (inRoom && u.devT && u.devT.kind) d0.kind = 'adddevice';");
once("      if (d.kind === 'adddevice') {", "      if (d.kind === 'edplace') { if (!d.moved && e.button === 0) this.edRoomDrop(e); return; }\n      if (d.kind === 'adddevice') {");
once("run: () => this.addLane(rcur.id) }", "run: () => this.edStartPlace('lane') }");
once("run: () => this.openEndRow() }", "run: () => this.edStartPlace('row') }");
once("new T.MeshBasicMaterial({ color: '#121815', transparent: true, opacity: 0.5, depthWrite: false })); this.dgh.renderOrder = 6;", "this.mat.ghost); this.dgh.renderOrder = 6;");
once("const html = this.ovEdLoc(u) + this.ovViewHtml(O, u, true) + this.edHtml(u)", "if (!(u.tool === 'lane' || u.tool === 'row')) this.edHideGhost(); const placing = u.view === 'room' && (u.tool === 'lane' || u.tool === 'row' || u.addDoor || (u.devT && u.devT.kind)); if (this.labelsEl) this.labelsEl.classList.toggle('edplacing', !!placing); const html = (placing ? '<style>.edplacing, .edplacing * { pointer-events: none !important; }</style>' : '') + this.ovEdLoc(u) + this.ovViewHtml(O, u, true) + this.edHtml(u)");
once("  cancelTask() {\n    const u = this.ui();\n", "  cancelTask() {\n    const u = this.ui();\n    if (u.tool === 'lane' || u.tool === 'row') { this.edHideGhost(); this.put({ tool: '' }); return true; }\n    if (u.tool === 'zone' || u.tool === 'sec') { this.setTool(''); return true; }\n");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
