/* Data-sync design study. Fictional in-memory records; no server or shared queue. */
(() => {
  const S = window.SentriUI;
  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');
  const scenarioSelect = document.getElementById('scenario');
  const languageSelect = document.getElementById('language');
  const params = new URLSearchParams(location.search);
  const state = {
    scenario: params.get('scenario') || 'offline',
    taskScope: params.get('taskId') === 'farrow28' ? 'farrow28' : '',
    groupingMode: null,
    uploadedOne: false,
    lang: params.get('lang') === 'zh' ? 'zh' : 'en',
    detail: '',
    category: '',
    dialog: '',
    switchPromptShown: false,
    deleted: false,
    deletedDependent: false,
    retrying: false,
    retryResult: false,
    receiptResolved: params.get('receipt') === 'resolved'
  };
  scenarioSelect.value = state.scenario;
  languageSelect.value = state.lang;

  const copy = {
    en: {
      title: 'Saved work', detail: 'Record detail', back: 'Back', waiting: 'Waiting to upload',
      taskTitle: 'Farrowing · saved work', taskScopeHint: 'Only records from this Farrowing task, across its units and pens.', allPhone: 'All records on this phone', taskSaved: 'Farrowing count · sow 000418', taskNote: 'Pen note · B2', taskOther: 'Pregnancy check · sow 000308', taskPlace: 'Farrowing · Unit 7 · Pen B1', taskNotePlace: 'Farrowing · Unit 8 · Pen B2',
      production: 'Production work', inspection: 'Inspections', vaccination: 'Vaccinations', transfer: 'Transfers', other: 'Other work',
      categoryHint: 'Select a work category to find a saved record.', categoryWaiting: 'Records in this category upload automatically when connected.',
      categoryCount: 'waiting records',
      needs: 'Needs you', uploaded: 'Uploaded', uploadedRecent: 'Uploaded in last 30 days', syncing: 'Uploading automatically',
      offline: 'No connection · saved on this phone', online: 'Connection restored · uploading automatically',
      thresholdOffline: 'Connection unstable · work saved on this phone', thresholdOnline: 'Connection restored · one record confirmed',
      poor: 'Waiting for a usable connection', connected: 'Connection available', failed: 'Upload failed', conflict: 'Conflict',
      blocked: 'Waiting for an earlier operation', done: 'No records waiting on this phone',
      checkingReceipt: 'Checking server result', checking: 'Checking server result', checkingShort: 'Checking result', checkingReceiptHint: 'This record stays on this phone while its final result is checked. It will not be sent again yet.',
      reconciledHint: 'The server confirmed this operation was already received. The same operation was not sent again.',
      local: 'Saved on this phone', team: 'Received by the team', retry: 'Retry now',
      delete: 'Delete local record', deleteTitle: 'Delete this conflicted record?',
      deleteBody: 'This record cannot be restored and will never upload. Dependent records stay blocked; review and delete each one separately.',
      deleteBlockedTitle: 'Delete this blocked record?',
      deleteBlockedBody: 'The earlier record was deleted. This record cannot upload. Deleting it cannot be undone.',
      deleteConfirm: 'Delete record', switchTitle: 'Finish saved work first',
      switchBody: 'Records on this phone have not uploaded. Handle them before changing account or farm.',
      expiredTitle: 'Sign in to the original account', expiredHint: 'Upload is paused. These records belong to G. Hansen · Green Valley Farm and remain on this phone.',
      reauth: 'Sign in again', reauthTitle: 'Continue as G. Hansen',
      reauthBody: 'Use the original account at Green Valley Farm. After sign-in succeeds, saved records upload automatically.',
      review: 'View saved work', noDelete: 'Record kept on this phone',
      retrying: 'Retrying this record', retryResult: 'The server still reports a conflict. This record stays on this phone.',
      retryFailedResult: 'This attempt did not complete. The record remains on this phone.',
      received: 'Received at 09:41', saved: 'Saved at 09:32', reason: 'Reason',
      reasonFailed: 'The server could not process this record. Check the details, then retry.',
      reasonConflict: 'Another worker changed this task before this record arrived.',
      reasonBlocked: 'Pregnancy check for this pig is unresolved. This later operation has not been sent.',
      reasonBlockedDeleted: 'The earlier record was deleted. This later record will not upload. Review it, then delete it if you are ready.',
      blockedDeletedStatus: 'Blocked · review and delete',
      compare: 'Compare before retrying', phoneValue: 'On this phone', serverValue: 'On the server now',
      localChange: 'Pregnancy result: Pregnant · saved at 09:32', serverChange: 'Pregnancy result: Not pregnant · changed by M. Li at 09:36',
      safeRetry: 'Retry checks the server again. If these values still differ, the record stays in conflict; it never overwrites the team record.',
      work: 'Work', place: 'Place', status: 'Status', time: 'Saved time', account: 'Account', farm: 'Farm',
      first: 'Pregnancy check · 000308', second: 'Pen note · C2', third: 'Feed adjustment · 000267',
      p1: 'Gestation · Unit 7 · Batch 31', p2: 'Gestation · Unit 8', p3: 'Gestation · Unit 7 · Pen C1',
      waitingShort: 'Waiting', syncingShort: 'Uploading', failedShort: 'Failed',
      blockedShort: 'Blocked', conflictShort: 'Conflict', uploadedShort: 'Uploaded',
      pendingHint: 'These records upload automatically when connected.',
      syncingHint: 'You can leave this page while upload continues.',
      partialHint: 'Two records arrived. One still needs attention.',
      conflictHint: 'This record will not upload again unless you retry it.',
      deletedHint: 'The dependent record remains blocked. Review and delete it separately.',
      allResolvedHint: 'No records are waiting on this phone. The recent upload total is below.',
      blockedHint: 'Resolve the earlier operation before this one can upload.',
      doneHint: 'Only records saved on this phone are counted here.'
    },
    zh: {
      title: '本机记录', detail: '记录详情', back: '返回', waiting: '待上传',
      taskTitle: '分娩任务 · 本机记录', taskScopeHint: '仅展示本次分娩任务在各单元、栏位保存的记录。', allPhone: '查看本机全部记录', taskSaved: '分娩计数 · 母猪 000418', taskNote: '栏位备注 · B2', taskOther: '孕检 · 母猪 000308', taskPlace: '分娩 · 7 单元 · B1 栏', taskNotePlace: '分娩 · 8 单元 · B2 栏',
      production: '生产操作', inspection: '巡检', vaccination: '免疫', transfer: '转群', other: '其他操作',
      categoryHint: '按业务类别查看本机记录。', categoryWaiting: '本类别记录联网后会自动上传。',
      categoryCount: '条待上传记录',
      needs: '需要处理', uploaded: '已上传', uploadedRecent: '近30天已上传', syncing: '正在自动上传',
      offline: '无网络 · 已保存在本机', online: '网络已恢复 · 正在自动上传',
      thresholdOffline: '网络不稳定 · 记录已保存在本机', thresholdOnline: '网络已恢复 · 1 条已确认上传',
      poor: '等待可用网络', connected: '网络可用', failed: '上传失败', conflict: '冲突',
      blocked: '等待前置操作', done: '本机暂无待上传记录',
      checkingReceipt: '正在核对服务端结果', checking: '正在核对服务端结果', checkingShort: '核对结果中', checkingReceiptHint: '核对最终结果期间，记录仍保留在本机，暂不再次发送。',
      reconciledHint: '服务端确认已收到这条操作；本机没有再次发送同一操作。',
      local: '已保存在本机', team: '团队已收到', retry: '立即重试',
      delete: '删除本机记录', deleteTitle: '删除这条冲突记录？',
      deleteBody: '删除后无法恢复，也不会再上传。依赖它的后续记录仍受阻，需逐条查看并删除。',
      deleteBlockedTitle: '删除这条受阻记录？',
      deleteBlockedBody: '前置记录已删除，这条记录无法上传。删除后不能恢复。',
      deleteConfirm: '删除记录', switchTitle: '请先处理本机记录',
      switchBody: '本机还有未上传记录。处理完成后才能切换账号或猪场。',
      expiredTitle: '请重新登录原账号', expiredHint: '上传已暂停。这些记录属于 G. Hansen · Green Valley Farm，仍保存在本机。',
      reauth: '重新登录', reauthTitle: '以 G. Hansen 继续',
      reauthBody: '请使用 Green Valley Farm 的原账号。登录成功后，本机记录会继续自动上传。',
      review: '查看本机记录', noDelete: '记录仍保留在本机',
      retrying: '正在重试这条记录', retryResult: '服务端仍报告冲突，记录继续保留在本机。',
      retryFailedResult: '本次重试未完成，记录继续保留在本机。',
      received: '09:41 团队已收到', saved: '09:32 保存在本机', reason: '原因',
      reasonFailed: '服务端未能处理这条记录。查看内容后可重试。',
      reasonConflict: '另一位工人在本记录到达前修改了此任务。',
      reasonBlocked: '这头猪的孕检记录尚未解决，后续操作还未发送。',
      reasonBlockedDeleted: '前置记录已删除。这条后续记录不会上传，请查看后逐条删除。',
      blockedDeletedStatus: '受阻 · 查看并删除',
      compare: '重试前核对差异', phoneValue: '本机记录', serverValue: '服务端现值',
      localChange: '孕检结果：已怀孕 · 09:32 保存', serverChange: '孕检结果：未怀孕 · 李某 09:36 修改',
      safeRetry: '重试会再次核对服务端。若差异仍在，记录继续保留为冲突，不会覆盖团队记录。',
      work: '操作', place: '位置', status: '状态', time: '保存时间', account: '账号', farm: '猪场',
      first: '孕检 · 000308', second: '栏位备注 · C2', third: '饲喂调整 · 000267',
      p1: '妊娠区 · 7 单元 · 31 批', p2: '妊娠区 · 8 单元', p3: '妊娠区 · 7 单元 · C1 栏',
      waitingShort: '待上传', syncingShort: '上传中', failedShort: '失败',
      blockedShort: '受阻', conflictShort: '冲突', uploadedShort: '已上传',
      pendingHint: '网络恢复后会自动上传这些记录。',
      syncingHint: '离开此页后仍会继续上传。',
      partialHint: '2 条已上传，1 条仍需处理。',
      conflictHint: '这条记录不会自动重试，需由你手动处理。',
      deletedHint: '依赖它的后续记录仍受阻，需逐条查看并删除。',
      allResolvedHint: '本机暂无待上传记录；下方显示近期已上传总数。',
      blockedHint: '先处理前置操作，后续记录才会上传。',
      doneHint: '这里只统计这台手机保存的记录。'
    }
  };
  const t = key => copy[state.lang][key] || key;
  let dialogReturnAction = '';
  const records = () => {
    if (params.get('taskId') === 'farrow28') {
      const statuses = state.scenario === 'syncing' ? ['syncing','waiting','waiting','uploaded'] : state.scenario === 'partial' ? ['failed','waiting','waiting','uploaded'] : ['waiting','waiting','waiting','uploaded'];
      return [
        {id:'task-count',taskId:'farrow28',category:'production',titleEn:copy.en.taskSaved,titleZh:copy.zh.taskSaved,placeEn:copy.en.taskPlace,placeZh:copy.zh.taskPlace,at:'09:32',status:statuses[0]},
        {id:'task-note',taskId:'farrow28',category:'production',titleEn:copy.en.taskNote,titleZh:copy.zh.taskNote,placeEn:copy.en.taskNotePlace,placeZh:copy.zh.taskNotePlace,at:'09:35',status:statuses[1]},
        {id:'other-task',taskId:'preg31',category:'production',titleEn:copy.en.taskOther,titleZh:copy.zh.taskOther,placeEn:'Gestation · Unit 8',placeZh:'妊娠区 · 8 单元',at:'09:38',status:statuses[2]},
        {id:'inspection-task',taskId:'inspect7',category:'inspection',titleEn:'Unit inspection · 7',titleZh:'单元巡检 · 7',placeEn:'Unit 7',placeZh:'7 单元',at:'09:39',status:statuses[3]}
      ].map(item=>({...item,syncedAt:new Date(Date.now()-86400000).toISOString()}));
    }
    if (state.scenario === 'threshold') return Array.from({length:9}, (_,index)=>({
      id:'threshold-'+index, category:index%2?'inspection':'production',
      titleEn:(index%2?'Unit inspection':'Pregnancy check')+' · '+String(300+index).padStart(6,'0'),
      titleZh:(index%2?'单元巡检':'孕检')+' · '+String(300+index).padStart(6,'0'),
      placeEn:'Unit '+(7+index%2),placeZh:(7+index%2)+' 单元',at:'09:'+String(10+index).padStart(2,'0'),
      status:index===0&&state.uploadedOne?'uploaded':'waiting',syncedAt:new Date().toISOString()
    }));
    const base = [
      { id: 'first', at: '09:32', place: 'p1', category: 'production' },
      { id: 'second', at: '09:35', place: 'p2', category: 'inspection' },
      { id: 'third', at: '09:38', place: 'p3', category: 'production' }
    ];
    if (state.scenario === 'busy') {
      const types = [
        {category:'production', en:'Pregnancy check', zh:'孕检', type:'pregnancy'},
        {category:'inspection', en:'Unit inspection', zh:'单元巡检', type:'unit-inspection'},
        {category:'vaccination', en:'Vaccination', zh:'免疫', type:'vaccination'},
        {category:'transfer', en:'Transfer', zh:'转群', type:'transfer'}
      ];
      return Array.from({length:30}, (_, index) => {
        const kind = types[index === 1 ? 0 : index % types.length];
        const tag = String(300 + index).padStart(6, '0');
        return {id:'busy-'+index, category:kind.category, type:kind.type, titleEn:kind.en+' · '+tag,
          titleZh:kind.zh+' · '+tag, placeEn:'Unit '+(7 + index % 3), placeZh:(7 + index % 3)+' 单元',
          at:'09:'+String(10 + index).padStart(2,'0'), status:index===0?'failed':index===1?'conflict':index>=26?'uploaded':'waiting'};
      });
    }
    const modes = {
      offline: ['waiting','waiting','waiting'],
      syncing: ['syncing','waiting','waiting'],
      partial: ['uploaded','uploaded','failed'],
      conflict: ['conflict','blocked','uploaded'],
      blocked: ['failed','blocked','waiting'],
      done: ['uploaded','uploaded','uploaded'],
      history: ['uploaded','uploaded','uploaded'],
      switch: ['waiting','waiting','uploaded'],
      expired: ['waiting','waiting','waiting']
    };
    modes.uncertain = state.receiptResolved ? ['uploaded','uploaded','uploaded'] : ['checking','uploaded','uploaded'];
    const candidates = base.map((item, index) => ({...item, status: modes[state.scenario][index],
      dependsOn: item.id === 'second' ? ['first'] : [],
      syncedAt: state.scenario === 'history' ? new Date(Date.now() - [2,12,45][index] * 86400000).toISOString() : new Date(Date.now() - 86400000).toISOString()}))
      .filter(item => !(state.deleted && item.id === 'first') && !(state.deletedDependent && item.id === 'second'));
    const stillReferenced = new Set(candidates.filter(item => item.status !== 'uploaded').flatMap(item => item.dependsOn));
    const cutoff = Date.now() - 30 * 86400000;
    return candidates.filter(item => item.status !== 'uploaded' || Date.parse(item.syncedAt) >= cutoff || stillReferenced.has(item.id));
  };
  const humanStatus = status => status === 'blocked' && state.deleted ? t('blockedDeletedStatus') : t(status);
  const shortStatus = status => t(status + 'Short');
  const itemTitle = item => item[state.lang === 'zh' ? 'titleZh' : 'titleEn'] || t(item.id);
  const itemPlace = item => item[state.lang === 'zh' ? 'placeZh' : 'placeEn'] || t(item.place);
  const row = item => S.row({
    title: itemTitle(item),
    description: itemPlace(item) + ' · ' + item.at,
    trailing: {text: shortStatus(item.status), tone: item.status === 'failed' || item.status === 'conflict' ? 'red' : item.status === 'uploaded' ? 'green' : 'muted'},
    action: 'open-record', value: item.id, wrap: true,
    attrs: {'aria-label': itemTitle(item) + ' · ' + humanStatus(item.status)}
  });
  const group = (title, items) => items.length
    ? S.rowGroup(items.map(row).join(''), {title: title + ' · ' + items.length, level: 3}) : '';
  const categoryFor = item => ['production','inspection','vaccination','transfer'].includes(item.category) ? item.category : 'other';
  const categoryGroups = items => {
    const keys = ['production','inspection','vaccination','transfer','other'].filter(category => items.some(item => categoryFor(item) === category));
    return S.rowGroup(keys.map(category => {
      const count = items.filter(item => categoryFor(item) === category).length;
      return S.row({title:t(category), description:count + ' ' + t('categoryCount'),
        action:'open-category', value:category, wrap:true});
    }).join(''), {title:t('waiting')+' · '+items.length, level:3});
  };
  const recentUploadSummary = items => {
    const cutoff = Date.now() - 30 * 86400000;
    const count = items.filter(item => item.status === 'uploaded' && Date.parse(item.syncedAt) >= cutoff).length;
    return count ? `<p class="sync-uploaded-summary">${t('uploadedRecent')} · ${count}</p>` : '';
  };

  function listView() {
    const items = records().filter(item => !state.taskScope || item.taskId === state.taskScope && item.status !== 'uploaded');
    const needs = items.filter(x => x.status === 'failed' || x.status === 'conflict');
    const checking = items.filter(x => x.status === 'checking');
    const waiting = items.filter(x => x.status === 'waiting' || x.status === 'syncing' || x.status === 'blocked');
    if (state.category) {
      const categoryItems = waiting.filter(item => categoryFor(item) === state.category);
      const body = '<div class="sync-content"><div class="sync-intro">' +
        S.statusLine([{text:t('categoryWaiting')}]) + '</div><div class="sync-groups">' +
        group(t('waiting'), categoryItems) + '</div></div>';
      app.innerHTML = S.sheet({variant:'page',title:t(state.category),back:{action:'back-to-all'},body,
        footer:S.sheetFooter({back:{action:'back-to-all',label:t('back')}})});
      renderDialog();
      return;
    }
    const mode = state.scenario;
    const line = mode === 'threshold' ? t(state.uploadedOne ? 'thresholdOnline' : 'thresholdOffline') : mode === 'offline' || mode === 'switch' || mode === 'busy' ? t('offline') : mode === 'expired' ? t('expiredTitle') : mode === 'syncing' ? t('online') : mode === 'uncertain' ? t(state.receiptResolved ? 'done' : 'checkingReceipt') : mode === 'done' || mode === 'history' ? t('done') : t('connected');
    const hint = mode === 'busy' ? t('categoryHint') : mode === 'threshold' || mode === 'offline' || mode === 'switch' ? t('pendingHint') : mode === 'expired' ? t('expiredHint') : mode === 'syncing' ? t('syncingHint') : mode === 'uncertain' ? t(state.receiptResolved ? 'reconciledHint' : 'checkingReceiptHint') : mode === 'partial' ? t('partialHint') : mode === 'conflict' ? t(state.deletedDependent ? 'allResolvedHint' : state.deleted ? 'deletedHint' : 'conflictHint') : mode === 'blocked' ? t('blockedHint') : t('doneHint');
    const lead = S.statusLine([{text: line}], {className:'sync-summary-line'}) +
      S.statusLine([{text: state.taskScope ? t('taskScopeHint') : hint}], {className:'sync-summary-line'});
    const reauth = mode === 'expired' ? S.button({label:t('reauth'),register:'primary',action:'open-reauth'}) : '';
    const allPhone = state.taskScope ? `<button type="button" class="sync-all-phone" data-action="show-all">${t('allPhone')} · ${records().filter(item=>item.status!=='uploaded').length} →</button>` : '';
    if (state.groupingMode === null) state.groupingMode = waiting.length >= 9 && new Set(waiting.map(categoryFor)).size >= 2;
    const body = '<div class="sync-content"><div class="sync-intro">' + lead + reauth + allPhone + '</div>' +
      '<div class="sync-groups">' + group(t('needs'), needs) + group(t('checkingReceipt'), checking) +
      (state.groupingMode && !state.taskScope ? categoryGroups(waiting) : group(t('waiting'), waiting)) +
      recentUploadSummary(items) + '</div></div>';
    app.innerHTML = S.sheet({
      variant:'page', title:t(state.taskScope ? 'taskTitle' : 'title'), back:{action:'go-home'}, body,
      footer:S.sheetFooter({back:{action:'go-home',label:t('back')}})
    });
    if (state.scenario === 'switch' && !state.switchPromptShown) {
      state.dialog = 'switch';
      state.switchPromptShown = true;
    }
    renderDialog();
  }
  function detailView() {
    const item = records().filter(x => !state.taskScope || x.taskId === state.taskScope).find(x => x.id === state.detail);
    if (!item) { state.detail = ''; listView(); return; }
    const failed = item.status === 'failed', conflict = item.status === 'conflict';
    const reason = failed ? t('reasonFailed') : conflict ? t('reasonConflict') : item.status === 'blocked' ? t(state.deleted ? 'reasonBlockedDeleted' : 'reasonBlocked') : '';
    const facts = S.facts([
      {label:t('work'), value:itemTitle(item)},
      {label:t('status'), value:humanStatus(item.status)},
      {label:t('place'), value:itemPlace(item)},
      {label:t('account'), value:'G. Hansen'},
      {label:t('farm'), value:'Green Valley Farm'},
      {label:t('time'), value:item.at}
    ], {columns:1});
    const alert = reason ? S.banner({tone: conflict || failed ? 'danger' : 'notice', headline: t('reason'), consequence:reason}) : '';
    const retryResult = state.retryResult ? S.statusLine([{text:t(failed ? 'retryFailedResult' : 'retryResult')}]) : '';
    const deletion = conflict || (item.status === 'blocked' && state.deleted) ? '<div class="sync-detail-actions">' +
      S.button({label:t('delete'), register:'text', action:'ask-delete'}) + '</div>' : '';
    const receipt = S.statusLine([{text:item.status === 'uploaded' ? t('received') : t('saved')}]);
    const comparison = conflict ? '<div class="sync-compare">' +
      S.heading({title:t('compare'),kind:'section',level:3}) +
      S.facts([{label:t('phoneValue'),value:t('localChange')},{label:t('serverValue'),value:t('serverChange')}],{columns:1}) +
      S.statusLine([{text:t('safeRetry')}]) + '</div>' : '';
    const body = '<div class="sync-detail">' + receipt + alert + comparison + retryResult + facts + deletion + '</div>';
    const primary = failed || conflict
      ? {label:state.retrying ? t('retrying') : t('retry'), action:'retry', busy:state.retrying} : null;
    app.innerHTML = S.sheet({
      variant:'page', title:t('detail'), back:{action:'back-to-list'}, body,
      footer:S.sheetFooter({back:{action:'back-to-list',label:t('back')},primary})
    });
    renderDialog();
  }
  function renderDialog() {
    const hadDialog = Boolean(overlay.firstElementChild);
    overlay.innerHTML = '';
    app.toggleAttribute('inert', Boolean(state.dialog));
    if (!state.dialog) {
      if (hadDialog) app.querySelector(`[data-action="${dialogReturnAction}"]`)?.focus();
      return;
    }
    const deleting = state.dialog === 'delete', reauth = state.dialog === 'reauth';
    const dependent = deleting && state.detail === 'second' && state.deleted;
    const body = deleting ? t(dependent ? 'deleteBlockedBody' : 'deleteBody') : reauth ? t('reauthBody') : t('switchBody');
    overlay.innerHTML = S.sheet({
      variant:'dialog', title:deleting ? t(dependent ? 'deleteBlockedTitle' : 'deleteTitle') : reauth ? t('reauthTitle') : t('switchTitle'),
      subtitle:body,
      footer:S.sheetFooter({
        back:{action:deleting ? 'cancel-delete' : reauth ? 'cancel-reauth' : 'cancel-switch',label:t('back')},
        primary:deleting
          ? {label:t('deleteConfirm'), action:'confirm-delete', register:'danger'}
          : reauth ? {label:t('reauth'), action:'complete-reauth', register:'primary'}
          : {label:t('review'), action:'review-records', register:'primary'}
      })
    });
    overlay.querySelector('[role="dialog"]')?.focus();
  }
  function render() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    if (state.detail) detailView(); else listView();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || S.guard(button)) return;
    let action = button.dataset.action;
    // The page header's Back goes up one level, as the footer's does: record, then list, then categories, then where the page was opened from.
    if (action === 'back') action = state.detail ? 'back-to-list' : state.category ? 'back-to-all' : 'go-home';
    if (action === 'open-record') { state.detail = button.dataset.value; state.retryResult = false; }
    else if (action === 'open-category') state.category = button.dataset.value;
    else if (action === 'back-to-all') state.category = '';
    else if (action === 'back-to-list') state.detail = '';
    else if (action === 'show-all') { state.taskScope = ''; state.groupingMode = null; }
    else if (action === 'go-home') {
      if (params.get('from') === 'home' || params.get('from') === 'task') history.back();
      else location.href = 'home-astra-prototype.html?layout=focus';
    }
    else if (action === 'ask-delete') { dialogReturnAction = 'ask-delete'; state.dialog = 'delete'; }
    else if (action === 'open-reauth') { dialogReturnAction = 'open-reauth'; state.dialog = 'reauth'; }
    else if (action === 'cancel-delete' || action === 'cancel-switch' || action === 'cancel-reauth' || action === 'review-records') state.dialog = '';
    else if (action === 'complete-reauth') { state.dialog = ''; state.scenario = 'syncing'; }
    else if (action === 'confirm-delete') {
      if (state.detail === 'second' && state.deleted) state.deletedDependent = true;
      else state.deleted = true;
      state.detail = ''; state.dialog = '';
    }
    else if (action === 'retry') {
      state.retrying = true; render();
      window.setTimeout(() => { state.retrying = false; state.retryResult = true; render(); }, 700);
      return;
    }
    if (action === 'review-records') state.scenario = 'offline';
    render();
  });
  scenarioSelect.addEventListener('change', () => {
    state.scenario = scenarioSelect.value;
    state.groupingMode = null;
    state.detail = ''; state.category = ''; state.dialog = ''; state.switchPromptShown = false;
    state.deleted = false; state.deletedDependent = false; state.retrying = false; state.retryResult = false;
    state.receiptResolved = false;
    state.uploadedOne = false;
    render();
    scheduleReceiptResolution();
  });
  languageSelect.addEventListener('change', () => { state.lang = languageSelect.value; render(); });
  // Preview the handoff from an offline local queue to automatic upload. No server call is made.
  window.addEventListener('online', () => {
    if (state.scenario === 'threshold') { state.uploadedOne = true; render(); return; }
    if (state.scenario !== 'offline') return;
    state.scenario = 'syncing';
    render();
  });
  window.addEventListener('offline', () => {
    if (state.scenario !== 'syncing') return;
    state.scenario = 'offline';
    render();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (state.dialog) state.dialog = '';
    else if (state.detail) state.detail = '';
    else return;
    render();
  });
  function scheduleReceiptResolution() {
    if (state.scenario !== 'uncertain' || params.get('receipt') === 'hold' || state.receiptResolved) return;
    window.setTimeout(() => {
      if (state.scenario !== 'uncertain') return;
      state.receiptResolved = true;
      render();
    }, params.get('receipt') === 'delayed' ? 10000 : 850);
  }
  render();
  scheduleReceiptResolution();
})();
