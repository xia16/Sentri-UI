// Regenerate the page-by-entry inventory from the current feature graph and
// the browser replay. The route matrix is independently driven by real taps.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const feature = JSON.parse(readFileSync(path.join(here, '../feature.json'), 'utf8'));
const replays = JSON.parse(readFileSync(path.join(here, 'entry-render-results.json'), 'utf8'));
const routes = JSON.parse(readFileSync(path.join(here, 'route-results.json'), 'utf8'));
const byId = new Map(replays.map(row => [row.id, row]));
const incoming = new Map(feature.screens.map(screen => [screen.id, []]));
for (const [from, to] of feature.flow) if (incoming.has(to)) incoming.get(to).push(from);
for (const entry of feature.entryPoints) if (incoming.has(entry.lands)) incoming.get(entry.lands).push(`Home ${entry.label}`);
const transient = new Set(['farrowing.pen-landed', 'farrowing.pen-landed-live', 'farrowing.pen-landed-plain']);
const short = id => id.replace(/^farrowing\./, '');
function source(id) {
  if (/^farrowing\.(pen-map|pen-landed|room-single)/.test(id)) return 'V6';
  if (/^farrowing\.(piglet-care|piglet-identity)/.test(id)) return 'V7';
  if (id === 'farrowing.sow-actions') return 'V8';
  if (id === 'farrowing.note') return 'V5';
  if (id === 'farrowing.death-selected') return 'V2 + V4';
  if (/^farrowing\.(piglets|foster)/.test(id)) return 'V4';
  if (/^farrowing\.(task-|overview)/.test(id)) return 'V3';
  if (/^farrowing\.(count|undo|before|death|litter|finish|locked|details|history|ended)/.test(id)) return 'V2';
  return 'V1';
}
function sources(id) {
  const tally = new Map();
  for (const from of incoming.get(id) || []) {
    const label = from.startsWith('farrowing.') ? short(from) : from;
    tally.set(label, (tally.get(label) || 0) + 1);
  }
  return [...tally].map(([label, n]) => `${label}${n > 1 ? ` ×${n}` : ''}`).join(', ') || 'preset / URL';
}
const stable = replays.filter(row => !transient.has(row.id));
const matched = stable.filter(row => row.current === row.id && !row.errors.length).length;
const routed = routes.filter(row => row.pass).length;
const lines = [
  '# Farrowing 页面 × 入口复核矩阵 · 2026-11-17',
  '',
  `当前分支的 **${feature.screens.length} 个 screen、${feature.flow.length} 条内部 flow、${feature.entryPoints.length} 条 Home ways in** 均列在下方。每页的最新版按已同意的画布、当前原型和组件来源判定；“Flow 来源”从当前 \`feature.json\` 的入边生成。每页 preset/steps 在 390 × 844 真实原型中重放，结果见 [entry-render-results.json](entry-render-results.json)。另从 Home、Room、各状态、Find、Scan、Actions、Piglets 和 End task 控件逐条进入，见 [实际入口矩阵](route-matrix.md)及 [JSON 证据](route-results.json)。`,
  '',
  '- **V1 入口与列表**：PR 289 的单任务 Find/Scan 与批量 Actions；Room 状态色由 PR 297，Row 由 PR 310 更新。',
  '- **V2 计数与记录**：PR 291/292 的 visit draft，PR 306 的 Undo/Details/第七死因，PR 311 的 withdrawn log，PR 315 的死亡白卡片；本轮把已选仔猪带进同一死亡页。',
  '- **V3 全任务**：PR 294 的 End task、PR 297 的进度色；本轮让 outcome 示例与七死因统计一致。',
  '- **V4 Piglets/Foster**：PR 310 的 Piglets 清单、Send/Move 与 Foster，PR 315 的白卡片。',
  '- **V5 Note**：PR 314 的消息式 Note 与 Show for 默认 7 天；本轮同步到母猪 Note。',
  '- **V6 PenMap**：PR 307 的房间形状、尺寸和 Whole room；负责人 2026-11-16 同意 PR 317 画布后，本分支同步 Farrowing、Inspection 与共享组件。',
  '- **V7 Care/身份**：原型中的 sow Actions → Piglet processing；负责人 2026-11-17 选择保留该入口，本轮同步 Piglet records 的 Row 与身份校验。独立 Piglet processing 任务仍是 in-design。',
  '- **V8 Sow Actions**：PR 315 的原位灰显；本轮校正到具体母猪的重放步骤与状态说明。',
  '',
  '| 页面 | 最新版来源 | Flow 来源 | 实际重放 |',
  '|---|---|---|---|',
  ...feature.screens.map(screen => {
    const replay = byId.get(screen.id);
    const actual = !replay ? '未重放' : transient.has(screen.id) && replay.current === 'farrowing.room' ? 'T → room' : replay.current === screen.id && !replay.errors.length ? '✓' : `差异 → ${replay.current || '无'}`;
    return `| \`${short(screen.id)}\` | ${source(screen.id)} | ${sources(screen.id)} | ${actual} |`;
  }),
  '',
  `重放结果：${matched}/${stable.length} 个稳定页面 ID 与运行态一致；${transient.size} 个 PenMap 落点帧是正确的瞬时画面，动效结束后回 Room。真实入口 ${routed}/${routes.length} 条对齐。入口覆盖与同步前的 13 组差异分别见 [route-matrix.md](route-matrix.md)和 [audit.md](audit.md)。`,
  ''
];
writeFileSync(path.join(here, 'page-entry-matrix.md'), lines.join('\n'));
console.log(`Wrote ${feature.screens.length} page rows and ${routes.length} route results`);
