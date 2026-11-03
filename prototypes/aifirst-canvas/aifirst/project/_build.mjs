import fs from 'fs';
import { applyOps, emptyDoc, usualDoc, derive } from './layout.engine.js';
const ids = process.argv.slice(2);
for (const id of ids) {
  const ops = JSON.parse(fs.readFileSync(`farms/${id}.ops.json`, 'utf8'));
  const start = id === 'sketch' ? emptyDoc() : emptyDoc();
  const r = applyOps(start, ops);
  console.log(id, 'ops', ops.length, 'changes', r.changes.length, 'problems', JSON.stringify(r.problems));
  const D = derive(r.doc);
  console.log('  rooms', D.rooms.length, 'places', D.totals.places, 'byUse', JSON.stringify(D.totals.byUse), 'D.problems', JSON.stringify(D.problems));
  const b = D.rooms[0]; console.log('  room0 shell', b.geom.fw, 'x', b.geom.fl, 'door', b.door.x, 'pens', b.pens.length, 'end rows', b.geom.ends.map(e => e.at + ':' + e.n).join(','), 'drawn', b.drawn.map(p=>p.code+':'+(p.bad?'BAD':'ok')+':'+p.area.toFixed(1)).join(' '));
  const all = D.rooms.map(r=>r.fp); const x1=Math.max(...all.map(f=>f.x1)), x0=Math.min(...all.map(f=>f.x0)), z1=Math.max(...all.map(f=>f.z1)), z0=Math.min(...all.map(f=>f.z0));
  console.log('  site', x1-x0, 'x', z1-z0, 'sections', JSON.stringify(D.sections.map(s=>s.hull)), D.zones.map(z=>z.id));
  fs.writeFileSync(`farms/${id}.json`, JSON.stringify(r.doc, null, 1));
}
