/* Data sync (features/data-sync/PRD.md, PR 235; owner 2026-10-18 to 2026-10-20): Saved work, a task's log, past uploads and
   Not accepted. Fictional records on one phone: nothing is sent, and no other prototype shares this queue. */
(() => {
  const S = window.SentriUI;
  const I = window.SentriIcons;
  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');
  const scenarioSelect = document.getElementById('scenario');
  const languageSelect = document.getElementById('language');
  const params = new URLSearchParams(location.search);
  // Home and the task pages open this page with their own scenario names; each lands on one of five.
  const SCENARIOS = { offline: 'offline', syncing: 'syncing', partial: 'syncing', conflict: 'syncing', uncertain: 'syncing', done: 'done', history: 'syncing', expired: 'expired', switch: 'switch' };
  const state = {
    scenario: SCENARIOS[params.get('scenario')] || 'offline',
    lang: params.get('lang') === 'zh' ? 'zh' : 'en',
    from: params.get('from') || '',
    view: params.get('taskId') ? 'task' : 'phone',
    task: params.get('taskId') || '',
    unit: '',
    back: [],
    drawer: false,
    dialog: params.get('scenario') === 'switch' ? 'switch' : '',
    signedOut: params.get('scenario') === 'expired'
  };
  scenarioSelect.value = params.get('scenario') || 'offline';
  languageSelect.value = state.lang;

  const L = (en, zh) => ({ en, zh });
  const t = (v) => (v && typeof v === 'object' && 'en' in v ? v[state.lang] : v);
  const C = {
    title: L('Saved work', '本机记录'),
    uploading: L('Uploading', '上传中'), waiting: L('Waiting to upload', '等待上传'),
    done: L('Everything has uploaded.', '全部已上传。'),
    past: L('Past uploads', '已上传记录'), lastDays: L('last 30 days', '最近 30 天'),
    today: L('Today', '今天'), yesterday: L('Yesterday', '昨天'),
    allUnits: L('All units', '全部单元'), chooseUnit: L('Choose unit', '选择单元'), unitChooser: L('Choose a unit', '选择单元'),
    unit: (u) => L(`Unit ${u}`, `${u} 号单元`), onPhone: (n) => L(`${n} records on this phone`, `本机 ${n} 条记录`),
    notAccepted: L('Not accepted', '未被接受'), notAcceptedN: (n) => L(`${n} records not accepted`, `${n} 条记录未被接受`),
    notAcceptedShort: (n) => L(`${n} not accepted`, `${n} 条未被接受`),
    already: L('Already recorded', '已有记录'), refused: L("Couldn't be accepted", '无法接受'),
    youRecorded: (v) => L(`You recorded ${v.en}`, `你记录的是“${v.zh}”`),
    signIn: L('Sign in to keep uploading', '登录后继续上传'), safe: L('Your records are safe on this phone', '记录已安全保存在本机'),
    continueAs: L('Continue as G. Hansen', '以 G. Hansen 继续'),
    continueBody: L('Sign in again with the same account at Green Valley Farm. Saved records upload by themselves after that.', '请用 Green Valley Farm 的原账号重新登录，之后本机记录会自动上传。'),
    signInAct: L('Sign in', '登录'),
    switchTitle: L('Upload first', '先上传'),
    switchBody: L('Records from Green Valley Farm are still on this phone. Switching now would leave them stuck.', 'Green Valley Farm 的记录仍在本机，现在切换会让它们无法上传。'),
    seeSaved: L('See saved work', '查看本机记录'),
    pastUploads: L('Past uploads', '已上传记录'),
    back: L('Back', '返回'), unitLabel: L('Unit', '单元')
  };
  const R = {
    pregnant: L('Pregnant', '已孕'), open: L('Not pregnant', '未孕'), recheck: L('Recheck in 7 days', '7 天后复检'),
    heat: L('In heat', '发情'), noHeat: L('Not in heat', '未发情'),
    litter: L('9 alive · 5 dead', '9 活 · 5 死'), penNote: L('Pen note', '栏位备注'),
    treatment: L('Treatment recorded', '已记录治疗'), note: L('Note added', '已添加备注')
  };
  // One record: who it is about, what was recorded, where, when and by whom.
  const rec = (id, what, unit, pen, at) => ({ id, what, unit, pen, at });
  const TASKS = [
    { id: 'preg31', title: L('Pregnancy check', '孕检'), line: L('Batch 31', '31 批'), records: [
      rec('000320', R.pregnant, '7', 'A1', '12:40'), rec('000318', R.pregnant, '7', 'B2', '12:38'), rec('000316', R.open, '7', 'C3', '12:36'),
      rec('000412', R.recheck, '7', 'B3', '12:34'), rec('000308', R.recheck, '7', 'B1', '12:32'),
      rec('000352', R.pregnant, '8', 'C1', '12:20'), rec('000350', R.pregnant, '8', 'C2', '12:18'), rec('000347', R.open, '8', 'A4', '12:16'), rec('000344', R.pregnant, '8', 'A2', '12:14')
    ], past: [
      { day: 'today', records: [rec('000296', R.pregnant, '7', 'A1', '07:50'), rec('000295', R.pregnant, '7', 'A1', '07:48'), rec('000294', R.open, '7', 'A1', '07:46')] },
      { day: 'yesterday', records: [rec('000288', R.pregnant, '7', 'A1', '16:20'), rec('000287', R.open, '7', 'A1', '16:18'), rec('000285', R.pregnant, '8', 'C4', '16:11')] }
    ], notAccepted: [
      { group: 'already', id: '000412', kept: R.open, yours: R.pregnant, at: '08:04' },
      { group: 'refused', id: L('Unit 7', '7 号单元'), what: L('Finished checks', '完成检查'), reason: L('Sow 000267 had already left the unit', '母猪 000267 已离开该单元'), at: '08:04' }
    ] },
    { id: 'ret30', title: L('Return-heat check', '返情检查'), line: L('Batch 30', '30 批'), records: [
      rec('000281', R.noHeat, '7', 'A2', '11:10'), rec('000279', R.heat, '7', 'A3', '11:06'), rec('000276', R.noHeat, '7', 'B1', '11:02')
    ], past: [], notAccepted: [] },
    { id: 'farrow28', title: L('Farrowing', '分娩'), line: L('Week 42', '第 42 周'), records: [
      rec('000418', R.litter, '7', 'B1', '09:32'), rec('B2', R.penNote, '8', 'B2', '09:35')
    ], past: [], notAccepted: [] },
    { id: 'other', title: L('Other records', '其他记录'), line: L('Notes and treatments', '备注与治疗'), records: [
      rec('000267', R.treatment, '7', 'C1', '10:12'), rec('C2', R.note, '8', 'C2', '10:20')
    ], past: [], notAccepted: [] }
  ];
  const taskOf = (id) => TASKS.find((x) => x.id === id);
  const online = () => state.scenario === 'syncing' && !state.signedOut;
  const empty = () => state.scenario === 'done';
  const recordsOf = (x) => (empty() ? [] : x.records);
  const unitsOf = (x) => [...new Set(recordsOf(x).map((r) => r.unit))];
  const entry = (r, withUnit) => ({
    title: `${t(r.id)} · ${t(r.what)}`,
    detail: [withUnit ? t(C.unit(r.unit)) : '', r.pen, r.at, 'G.H'].filter(Boolean).join(' · ')
  });

  // ---- pages ----
  const page = (title, line, body, { pageAction = null } = {}) => S.sheet({ variant: 'page', title, line: line ? { text: line } : null, back: { action: 'back', label: t(C.back) }, pageAction, body, footer: false });
  const clock = (scope) => ({ icon: I.icon('clock'), label: t(C.pastUploads), action: 'past', value: scope });
  const bar = (x) => {
    if (state.signedOut) return S.toast(t(C.signIn), { detail: t(C.safe), tone: 'attention', standing: { action: 'open-reauth', value: '' } });
    const n = x ? x.notAccepted.length : 0;
    return n && !empty() ? S.toast(t(C.notAcceptedN(n)), { tone: 'notice', standing: { action: 'not-accepted', value: x.id } }) : '';
  };
  const stack = (...parts) => `<div class="sync-stack">${parts.filter(Boolean).join('')}</div>`;

  function phonePage() {
    if (empty()) return page(t(C.title), '', stack(S.statusLine([{ text: t(C.done) }])), { pageAction: clock('phone') });
    const rows = TASKS.filter((x) => recordsOf(x).length).map((x) => S.row({
      title: t(x.title),
      description: x.notAccepted.length ? [{ text: t(x.line) }, { text: t(C.notAcceptedShort(x.notAccepted.length)) }] : t(x.line),
      trailing: { text: String(recordsOf(x).length) }, action: 'open-task', value: x.id, wrap: true
    })).join('');
    return page(t(C.title), '', stack(state.signedOut ? bar(null) : '', S.rowGroup(rows, { title: t(online() ? C.uploading : C.waiting) })), { pageAction: clock('phone') });
  }
  function taskPage() {
    const x = taskOf(state.task);
    const all = recordsOf(x), list = state.unit ? all.filter((r) => r.unit === state.unit) : all;
    const scope = S.segment({ variant: 'scope', action: 'scope', ariaLabel: t(C.unitLabel), active: state.unit ? 'unit' : 'all', options: [
      ['all', t(C.allUnits), { count: all.length }],
      ['unit', state.unit ? t(C.unit(state.unit)) : t(C.chooseUnit), state.unit ? { count: list.length, door: true } : { door: true }]
    ] });
    const log = list.length ? S.log([{ label: t(C.today), entries: list.map((r) => entry(r, !state.unit)) }]) : S.statusLine([{ text: t(C.done) }]);
    return page(t(x.title), t(x.line), stack(bar(x), scope, log), { pageAction: clock(x.id) });
  }
  function pastPage() {
    const scope = state.pastScope;
    const x = scope && scope !== 'phone' ? taskOf(scope) : null;
    const days = (x ? [x] : TASKS).flatMap((y) => y.past).reduce((m, g) => { (m[g.day] = m[g.day] || []).push(...g.records); return m; }, {});
    const groups = ['today', 'yesterday'].filter((d) => days[d]).map((d) => ({ label: t(C[d]), entries: days[d].map((r) => entry(r, true)) }));
    const line = `${x ? t(x.title) + ' · ' : ''}${t(C.lastDays)}`;
    return page(t(C.past), line, stack(S.log(groups)));
  }
  function notAcceptedPage() {
    const x = taskOf(state.notAcceptedTask);
    const g = (k) => x.notAccepted.filter((n) => n.group === k);
    const groups = [
      { label: t(C.already), entries: g('already').map((n) => ({ title: `${t(n.id)} · ${t(n.kept)}`, detail: `${t(C.youRecorded(n.yours))} · ${n.at} · G.H` })) },
      { label: t(C.refused), entries: g('refused').map((n) => ({ title: `${t(n.id)} · ${t(n.what)}`, detail: `${t(n.reason)} · ${n.at} · G.H` })) }
    ];
    return page(t(C.notAccepted), `${t(x.title)} · ${t(x.line)}`, stack(S.log(groups)));
  }

  // ---- overlays ----
  function unitDrawer() {
    const x = taskOf(state.task);
    const rows = unitsOf(x).map((u) => S.row({ variant: 'navigation', icon: I.icon('grid'), title: t(C.unit(u)), description: t(C.onPhone(recordsOf(x).filter((r) => r.unit === u).length)), trail: 'none', attrs: state.unit === u ? { 'aria-current': 'location' } : {}, action: 'pick-unit', value: u })).join('');
    return S.sheet({ title: t(C.unitChooser), surface: 'menu', label: t(C.unitChooser), body: S.rowGroup(rows), footer: S.sheetFooter({ back: { action: 'close-units' } }), close: { action: 'close-units' }, scrim: { action: 'close-units', label: t(C.back) } });
  }
  function dialog() {
    if (state.dialog === 'switch') return S.sheet({ variant: 'dialog', title: t(C.switchTitle), description: t(C.switchBody), body: '', footer: S.sheetFooter({ back: { action: 'close-dialog' }, primary: { label: t(C.seeSaved), action: 'close-dialog' } }) });
    if (state.dialog === 'reauth') return S.sheet({ variant: 'dialog', title: t(C.continueAs), description: t(C.continueBody), body: '', footer: S.sheetFooter({ back: { action: 'close-dialog' }, primary: { label: t(C.signInAct), action: 'complete-reauth' } }) });
    return '';
  }

  function render() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    app.innerHTML = state.view === 'task' ? taskPage() : state.view === 'past' ? pastPage() : state.view === 'not-accepted' ? notAcceptedPage() : phonePage();
    overlay.innerHTML = (state.drawer ? unitDrawer() : '') + dialog();
    app.inert = !!(state.drawer || state.dialog); // the page under a drawer or dialog is out of reach and out of the reading order
    window.AtlasBare && window.AtlasBare.watch(atlasScreen);
  }
  const atlasScreen = () => state.dialog === 'switch' ? 'data-sync.switch' : state.signedOut ? 'data-sync.auth' : state.drawer ? 'data-sync.units' : state.view === 'past' ? 'data-sync.history' : state.view === 'not-accepted' ? 'data-sync.not-accepted' : state.view === 'task' ? (state.unit ? 'data-sync.unit' : 'data-sync.task-list') : empty() ? 'data-sync.upload' : online() ? 'data-sync.syncing' : 'data-sync.list';

  const go = (view, extra = {}) => { state.back.push({ view: state.view, task: state.task, unit: state.unit, pastScope: state.pastScope, notAcceptedTask: state.notAcceptedTask }); Object.assign(state, { view }, extra); };
  function goBack() {
    const prev = state.back.pop();
    if (prev) { Object.assign(state, prev); return; }
    if (state.from === 'task') location.assign(new URL('farrowing-astra-concept.html?layout=focus&taskSync=offline', location.href).href);
    else if (state.from === 'home') location.assign(new URL('home-astra-prototype.html?section=gestation', location.href).href);
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action, value = button.dataset.value;
    if (action === 'back') goBack();
    else if (action === 'open-task') go('task', { task: value, unit: '' });
    else if (action === 'past') go('past', { pastScope: value });
    else if (action === 'not-accepted') go('not-accepted', { notAcceptedTask: value });
    else if (action === 'scope') { if (value === 'all') state.unit = ''; else state.drawer = true; }
    else if (action === 'pick-unit') { state.unit = value; state.drawer = false; }
    else if (action === 'close-units') state.drawer = false;
    else if (action === 'open-reauth') state.dialog = 'reauth';
    else if (action === 'complete-reauth') { state.dialog = ''; state.signedOut = false; state.scenario = 'syncing'; }
    else if (action === 'close-dialog') state.dialog = '';
    else return;
    render();
  });
  scenarioSelect.addEventListener('change', () => {
    const v = scenarioSelect.value;
    Object.assign(state, { scenario: SCENARIOS[v] || 'offline', view: 'phone', task: '', unit: '', back: [], drawer: false, dialog: v === 'switch' ? 'switch' : '', signedOut: v === 'expired' });
    render();
  });
  languageSelect.addEventListener('change', () => { state.lang = languageSelect.value; render(); });
  // The badge follows records, not the connection (owner, 2026-10-18): getting a connection back starts the upload.
  window.addEventListener('online', () => { if (state.scenario === 'offline') { state.scenario = 'syncing'; render(); } });
  window.addEventListener('offline', () => { if (state.scenario === 'syncing') { state.scenario = 'offline'; render(); } });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.dialog) state.dialog = ''; else if (state.drawer) state.drawer = false; else return;
    render();
  });
  render();
})();
