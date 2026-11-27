import {language} from './feed-locale.js';

const zh = language === 'zh';
export const recountText = (en, cn) => zh ? cn : en;
const t = recountText;
const penLabel = id => t('Pen ' + id, id + ' 栏');
const headcount = p => (p?.pigs.length || 0) + (p?.untagged?.count || 0);
const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

export const isRecountPage = view => view.startsWith('recount-');

function locations(c, unit) {
  return [
    ...c.pens.map(pen => ({pen, unit, local:true})),
    ...(c.otherUnits || []).filter(u => u.name !== unit).flatMap(u => u.pens.map(pen => ({pen, unit:u.name, local:false})))
  ].flatMap(place => place.pen.pigs.map(pig => ({...place, pig})));
}

function openPen(c, id) {
  const r = c.recount;
  r.pen = id;
  const original = c.pens.find(p => p.id === id);
  const observation = r.drafts[id] || r.observations[id];
  r.drafts[id] = observation ? {...observation, tags:[...observation.tags]} : {total:headcount(original), tags:[]};
  r.query = '';
  r.listening = false;
  r.read = '';
  c.view = 'recount-pen';
}

export function recountResult(c, unit) {
  const observations = c.recount.observations;
  const places = locations(c, unit);
  const destinations = new Map(Object.entries(observations).flatMap(([id, count]) => count.tags.map(tag => [tag, id])));
  const found = [], moved = [], notFound = [];
  for (const origin of places) {
    const to = destinations.get(origin.pig.id);
    if (to && !origin.local) found.push({...origin, to});
    if (to && origin.local && to !== origin.pen.id) moved.push({...origin, to});
    if (!to && origin.local && observations[origin.pen.id]) notFound.push(origin);
  }

  const onRecord = c.pens.reduce((sum, p) => sum + headcount(p), 0);
  const countedDelta = Object.entries(observations).reduce((sum, [id, o]) => sum + o.total - headcount(c.pens.find(p => p.id === id)), 0);
  const fromSkipped = moved.filter(x => !observations[x.pen.id]).length;
  const counted = onRecord + countedDelta - fromSkipped;
  const withoutTagsDelta = counted - onRecord - found.length + notFound.length;
  const uncountedStock = c.pens.some(p => !observations[p.id] && p.untagged?.count > 0);
  return {found,moved,notFound,onRecord,counted,withoutTagsDelta,blocked:uncountedStock && withoutTagsDelta !== 0};
}

function stageTag(c, id) {
  const r = c.recount;
  const draft = r.drafts[r.pen];
  if (!draft.tags.includes(id)) draft.tags.push(id);
  r.query = '';
}

export function recountBack(c) {
  const r = c.recount;
  if (c.view === 'recount-detail') c.view = 'recount-review';
  else if (c.view === 'recount-review' || c.view === 'recount-pen') c.view = 'recount-map';
  else c.view = r.origin;
  r.listening = false;
}

export function simulateRecountRead(c, unit) {
  const r = c.recount;
  if (c.view !== 'recount-pen' || !r?.listening) return false;
  const known = locations(c, unit);
  const ordered = [...known.filter(x => x.local && x.pen.id === r.pen), ...known.filter(x => !x.local), ...known.filter(x => x.local && x.pen.id !== r.pen)];
  const sample = ordered.map(x => x.pig.id).concat('000999');
  r.read = sample[r.nextRead++ % sample.length];
  if (r.read !== '000999') stageTag(c,r.read);
  return true;
}

export function recountAction(c, action, value, unit, record, target) {
  if (action === 'count-start' || action === 'count-unit') {
    c.recount ||= {origin:c.view, observations:{}, drafts:{}, query:'', nextRead:0};
    c.recount.origin = c.view;
    if (action === 'count-start') openPen(c, value);
    else c.view = 'recount-map';
    return true;
  }
  if (!isRecountPage(c.view) || !action.startsWith('count-')) return false;

  const r = c.recount;
  const draft = r.drafts[r.pen];
  switch (action) {
    case 'count-back': recountBack(c); break;
    case 'count-open-pen': openPen(c, value); break;
    case 'count-step': {
      const next = draft.total + Number(target.dataset.step);
      if (Number.isSafeInteger(next) && next >= 0) draft.total = next;
      break;
    }
    case 'count-pick': stageTag(c, value); r.read = ''; break;
    case 'count-untick': draft.tags = draft.tags.filter(tag => tag !== value); r.read = ''; break;
    case 'count-scan': r.listening = true; r.query = ''; r.read = ''; break;
    case 'count-stop': r.listening = false; break;
    case 'count-done':
      if (draft.total < draft.tags.length) break;
      for (const tag of draft.tags) {
        for (const [id, o] of Object.entries(r.observations)) {
          if (id !== r.pen && o.tags.includes(tag)) {
            r.conflict = tag;
            return true;
          }
        }
      }
      r.conflict = '';
      r.observations[r.pen] = {...draft,tags:[...draft.tags]};
      recountBack(c);
      break;
    case 'count-finish': {
      if (!Object.keys(r.observations).length) break;
      const result = recountResult(c, unit);
      if (result.counted !== result.onRecord || result.found.length || result.moved.length || result.notFound.length || result.withoutTagsDelta) c.view = 'recount-review';
      else save(c, unit, record, result);
      break;
    }
    case 'count-show': r.detail = value; c.view = 'recount-detail'; break;
    case 'count-save': {
      const result = recountResult(c, unit);
      if (!result.blocked) save(c, unit, record, result);
      break;
    }
    default: return false;
  }
  return true;
}

function save(c, unit, record, result) {
  const r = c.recount;
  for (const change of [...result.found, ...result.moved]) {
    let dest = c.pens.find(p => p.id === change.to);
    if (!dest) {
      dest = {id:change.to,mode:'unknown',formula:'',pigs:[],faults:[]};
      c.pens.push(dest);
    }
    change.pen.pigs = change.pen.pigs.filter(p => p.id !== change.pig.id);
    dest.pigs.push(change.pig);
  }
  for (const [id, observation] of Object.entries(r.observations)) {
    let pen = c.pens.find(p => p.id === id);
    const notFound = result.notFound.filter(x => x.pen.id === id).map(x => x.pig.id);
    const anonymous = observation.total - observation.tags.length;
    if (!pen && anonymous) {
      pen = {id,mode:'unknown',formula:'',pigs:[],faults:[]};
      c.pens.push(pen);
    }
    // An unconfirmed ear tag is kept on the sample registry. Its observation
    // is separate until the downstream placement rule is decided.
    if (pen && !notFound.length) {
      const group = pen.untagged || {count:0,cases:[]};
      pen.untagged = {...group,count:anonymous};
    }
    const discrepancy = notFound.length ? ' · ' + t('Not found: ', '未找到：') + notFound.join(', ') : '';
    record(c, t('Count recorded','已记录盘点'), [id], t('Counted ' + observation.total + ' pigs', '实盘 ' + observation.total + ' 头') + discrepancy, 'Movement');
  }
  c.recountHistory ||= [];
  c.recountHistory.push({unit, pens:r.observations, notFound:result.notFound.map(x => ({tag:x.pig.id,pen:x.pen.id})), withoutTagsDelta:result.withoutTagsDelta});
  c.view = r.origin;
  c.recount = null;
}

function page(title, unit, body, primary, bar, footerSummary = '') {
  const ui = globalThis.SentriUI;
  const footer = footerSummary ? ui.sheetFooter({back:false,className:'recount-footer',
    content:footerSummary+ui.button({...primary,register:'primary'})}) : primary && ui.sheetFooter({back:false,primary});
  return ui.sheet({variant:'page',className:'inspection-recount',title,line:{text:unit},body,bar,
    back:{action:'count-back',label:t('Back','返回')},footer});
}

function mapPage(c, unit, bar, {lanes,depth}) {
  const ui = globalThis.SentriUI;
  const observations = c.recount.observations;
  const counts = Object.fromEntries(c.pens.map(pen => [pen.id,{count:headcount(pen)}]));
  for (const [id, observation] of Object.entries(observations)) counts[id] = {count:observation.total,counted:true};
  const map = ui.penMap({lanes,depth,counts,action:'count-open-pen',key:'inspection-count-map',
    entrance:t('Entrance','入口'), labels:{map:t('Pens','栏位'),pen:penLabel,counted:t('Counted','已盘'),
      onRecord:t('On record','账面'),emptyValue:t('Empty','空栏')}});
  const done = Object.keys(observations).length;
  return page(t('Recount','盘点'), unit, '<div class="recount-flow">'+
    ui.heading({kind:'section',level:2,title:t(done+(done===1?' pen counted':' pens counted'),'已盘 '+done+' 栏')})+map+'</div>', {
    label:t('Finish recount','结束盘点'), action:'count-finish', waiting:!done
  },bar);
}

function tagList(c, unit) {
  const ui = globalThis.SentriUI;
  const r = c.recount;
  const draft = r.drafts[r.pen];
  const known = locations(c, unit);
  const row = (entry, selected) => {
    const {pig,pen} = entry;
    const location = !entry.local ? entry.unit + ' · ' + penLabel(pen.id) : pen.id !== r.pen ? penLabel(pen.id) : '';
    return selected ? ui.rowSelect({code:pig.id,description:location,checked:true,action:'count-untick',value:pig.id,wrap:true,
      inputAttrs:{'aria-label':t('Remove ','移除 ')+pig.id}}) :
      ui.row({variant:'navigation',title:pig.id,description:location,action:'count-pick',value:pig.id});
  };
  const recordedTags = c.pens.find(pen => pen.id === r.pen)?.pigs ?? [];
  const entryFor = id => known.find(x => x.pig.id === id);
  const chosen = draft.tags.map(entryFor).filter(Boolean);
  const term = r.query.trim();
  const hits = term ? known.filter(x => !draft.tags.includes(x.pig.id) && x.pig.id.includes(term)).slice(0,12) : [];
  const group = rows => '<div class="st-panel st-row-group">'+rows+'</div>';
  const missing = chosen.length ? recordedTags.filter(pig => !draft.tags.includes(pig.id)).map(pig => pig.id) : [];
  const origin = r.read ? entryFor(r.read) : null;
  const notice = r.read === '000999' ? t('Ear tag not found: ','未找到耳标：')+r.read :
    origin && (!origin.local || origin.pen.id !== r.pen) ? r.read+' · '+origin.unit+' · '+penLabel(origin.pen.id) : '';
  return (notice ? '<p class="st-find-hint" role="status">'+esc(notice)+'</p>' : '') +
    (hits.length ? group(hits.map(x => row(x, false)).join('')) :
      term && !chosen.some(x => x.pig.id.includes(term)) ? '<p class="st-find-hint" role="status">'+t('No matching ear tag','没有匹配的耳标')+'</p>' : '') +
    (chosen.length ? group(chosen.map(x => row(x, true)).join('')) : !term ?
      ui.panel(ui.choiceEmpty(t(
        recordedTags.length+' on record in '+r.pen,
        r.pen+' 栏账面有 '+recordedTags.length+' 头带耳标'
      ), {title:t('Scan every tagged pig','扫描每头带耳标的猪')})) : '') +
    (missing.length ? '<p class="st-find-hint">'+t('On record, not yet confirmed: ','账面有、尚未确认：')+esc(missing.join(', '))+'</p>' : '');
}

export function recountInput(c, el, unit) {
  if (c.view !== 'recount-pen' || !el.matches('[data-recount-query]')) return false;
  c.recount.query = el.value;
  el.closest('.inspection-recount').querySelector('[data-recount-tags]').innerHTML = tagList(c, unit);
  return true;
}

function countHistory(c, unit, id, pen) {
  const ui = globalThis.SentriUI;
  const last = c.recountHistory?.findLast(round => round.unit === unit && round.pens[id])?.pens[id];
  const title = ui.heading({title:t('Since the last count','上次盘点以来'),icon:globalThis.SentriIcons.icon('record'),level:2});
  const line = (title, description, number) => ui.row({variant:'read',title,description,trailing:String(number)});
  const counted = t('Counted','已盘点');
  // The D4 example mirrors the reference ledger. A saved sample count becomes
  // the latest count in the active prototype session.
  const rows = last ? line(counted,t('Saved this session','本次会话已保存'),last.total) : id === 'D4' && pen ?
    line(counted,t('Oct 28 · 08:10 · G.H','10月28日 · 08:10 · G.H'),20) +
    line(t('Moved to D6','转至 D6 栏'),t('Oct 30 · 14:20 · M.L','10月30日 · 14:20 · M.L'),'−3') +
    line(t('Died','死亡'),t('Oct 31 · 07:05 · G.H','10月31日 · 07:05 · G.H'),'−1') : '';
  const onRecord = rows ? line(t('Should be here now','当前账面'),t(
    (pen?.pigs.length ?? 0)+' with ear tags · '+(pen?.untagged?.count ?? 0)+' without',
    '有耳标 '+(pen?.pigs.length ?? 0)+' 头 · 无耳标 '+(pen?.untagged?.count ?? 0)+' 头'
  ),headcount(pen)) : '';
  return '<section class="recount-section">'+title+
    (rows ? ui.rowGroup(rows+onRecord) : ui.panel(ui.choiceEmpty(t('No count records yet','暂无盘点记录'))))+'</section>';
}

function penPage(c, unit, bar) {
  const ui = globalThis.SentriUI;
  const r = c.recount;
  const draft = r.drafts[r.pen];
  const pen = c.pens.find(pen => pen.id === r.pen);
  const tagged = draft.tags.length;
  const missing = (pen?.pigs ?? []).filter(pig => !draft.tags.includes(pig.id));
  const under = draft.total < tagged;
  const error = t('Total is below confirmed ear tags.','总数少于已确认的耳标数。');
  const summaryTitle = under ? t('Check the total','请核对总数') :
    t((draft.total-tagged)+' without ear tags','无耳标 '+(draft.total-tagged)+' 头');
  const summaryDetail = under ? '' : !tagged && missing.length ? t('None scanned yet','尚未确认耳标') :
    missing.length === 1 ? t(missing[0].id+' not confirmed',missing[0].id+' 待确认') :
    missing.length ? t(missing.length+' tags not confirmed',missing.length+' 个耳标待确认') :
    draft.total === headcount(pen) && tagged === (pen?.pigs.length ?? 0) ?
      t('Matches the record','与账面吻合') : t('Differs from the record','与账面有差异');
  const footerSummary = '<div class="recount-summary" role="status">'+
    ui.heading({kind:'panel',level:3,title:summaryTitle,description:summaryDetail})+'</div>';
  const quantity = ui.stepper({variant:'well',label:t('How many pigs are in '+r.pen+'?',r.pen+' 栏一共有几头猪？'),
    value:draft.total,min:0,action:'count-step',key:r.pen,error:under ? error : ''});
  const search = r.listening ?
    ui.scanBar({state:c.scan?.connected ? 'scanning' : 'waiting',device:'Reader 1',stop:{action:'count-stop',label:t('Stop scanning','停止扫码')}}) :
    ui.choiceSearch({label:t('Ear tag','耳标'),placeholder:t('Ear tag','耳标'),value:r.query,attrs:{'data-recount-query':''},
      scan:{action:'count-scan',label:t('Scan ear tag','扫描耳标')}});
  const conflict = r.conflict && draft.tags.includes(r.conflict) ?
    '<p class="st-find-hint" role="alert">'+esc(r.conflict)+' · '+t('Already confirmed in another counted pen. Check both pens.','同一耳标已在另一栏确认，请核对两栏。')+'</p>' : '';
  const tagsTitle = ui.heading({kind:'section',level:2,title:t('Which tagged pigs are here?','哪些带耳标的猪在这里？'),
    icon:globalThis.SentriIcons.icon('tag'),meta:tagged ? t(tagged+' found','已确认 '+tagged+' 头') : ''});
  const title = t('Count '+r.pen,r.pen+' 栏盘点');
  return page(title, unit, '<div class="recount-pen-flow">'+quantity+
    '<section class="recount-section">'+tagsTitle+search+
    '<div class="recount-tags" data-recount-tags>'+tagList(c,unit)+'</div>'+conflict+'</section>'+
    countHistory(c,unit,r.pen,pen)+'</div>',{
      label:t('Done','完成'),action:'count-done',waiting:under
    },bar,footerSummary);
}

const reviewTitles = {
  found:['Found from other units','从其他单元找到'],
  moved:['Moved within unit','单元内换栏'],
  notFound:['Not found','未找到']
};

function reviewPage(c, unit, bar) {
  const ui = globalThis.SentriUI;
  const summary = recountResult(c, unit);
  const rows = [['found',1],['moved',1],['notFound',-1]].filter(([key]) => summary[key].length).map(([key, sign]) =>
    ui.row({variant:'navigation',title:t(...reviewTitles[key]),trailing:key==='moved' ? String(summary[key].length) : signed(sign*summary[key].length),action:'count-show',value:key,wrap:true}));
  if (summary.withoutTagsDelta) rows.push(ui.row({variant:'navigation',title:t('Without ear tags','无耳标差异'),trailing:signed(summary.withoutTagsDelta),action:'count-show',value:'withoutTags',wrap:true}));
  const counted = ui.row({title:t('Counted','实盘'),trailing:String(summary.counted)});
  const onRecord = ui.row({title:t('On record','账面'),trailing:String(summary.onRecord)});
  const notice = summary.blocked ? '<p class="st-find-hint" role="status">'+t('Count the remaining pens with untagged pigs to resolve this difference.','请继续盘点还有无耳标猪的栏位，核实这笔差异。')+'</p>' : '';
  return page(t('Recount review','盘点差异'),unit,'<div class="recount-flow"><div class="st-panel st-row-group">'+
    counted+rows.join('')+onRecord+'</div>'+notice+'</div>',{
    label:t('Save recount','保存盘点'),action:'count-save',waiting:summary.blocked
  },bar);
}

function detailPage(c, unit, bar) {
  const ui = globalThis.SentriUI;
  const summary = recountResult(c, unit);
  const key = c.recount.detail;
  if (key === 'withoutTags') return page(t('Without ear tags','无耳标差异'),unit,
    '<div class="recount-flow">'+ui.facts([{label:t('Difference','差异'),value:signed(summary.withoutTagsDelta)}],{columns:1})+
    '<p class="st-find-hint">'+t('Unresolved differences are recorded with this observation.','未核实的差异随本次盘点记录。')+'</p></div>',null,bar);
  const detail = summary[key].map(x => ui.row({variant:'read',title:x.pig.id,
    description:x.unit+' · '+penLabel(x.pen.id)+(x.to ? ' → '+penLabel(x.to) : ''),wrap:true})).join('');
  const note = key === 'notFound' ? '<p class="st-find-hint">'+t('Recorded as a discrepancy for follow-up.','记入差异，待后续核实。')+'</p>' : '';
  const title = key === 'found' ? t('From other units','从其他单元找到') : t(...reviewTitles[key]);
  return page(title,unit,'<div class="recount-flow"><div class="st-panel st-row-group">'+detail+'</div>'+note+'</div>',null,bar);
}

export function renderRecount(c, unit, bar, layout) {
  if (c.view === 'recount-map') return mapPage(c,unit,bar,layout);
  if (c.view === 'recount-pen') return penPage(c,unit,bar);
  if (c.view === 'recount-review') return reviewPage(c,unit,bar);
  return detailPage(c,unit,bar);
}
