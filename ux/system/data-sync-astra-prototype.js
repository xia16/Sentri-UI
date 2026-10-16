/* Data-sync design study. Fictional in-memory records; no server or shared queue. */
(() => {
  const S = window.SentriUI;
  const I = window.SentriIcons;
  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');
  const scenarioSelect = document.getElementById('scenario');
  const languageSelect = document.getElementById('language');
  const studyLabel = document.getElementById('sync-study-label');
  const params = new URLSearchParams(location.search);
  const variants = ['status', 'inbox', 'timeline', 'tabs', 'chains'];
  const state = {
    scenario: params.get('scenario') || 'offline',
    variant: variants.includes(params.get('variant')) ? params.get('variant') : 'status',
    taskScope: params.get('taskId') === 'farrow28' ? 'farrow28' : '',
    groupingMode: null,
    uploadedOne: false,
    lang: params.get('lang') === 'zh' ? 'zh' : 'en',
    detail: '',
    historyView: params.get('view') === 'history' && !params.has('taskId'),
    queueTab: params.get('tab') === 'synced' ? 'synced' : 'active',
    selectedTask: params.get('task') || '',
    expandedChains: new Set(params.get('expand') ? [params.get('expand')] : []),
    taskQuery: '',
    statusFilter: 'all',
    taskIndexScrollTop: 0,
    listScrollTop: 0,
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
      categoryCount: 'records waiting to sync',
      needs: 'Needs you', uploaded: 'Uploaded', uploadedRecent: 'Uploaded in last 30 days', syncing: 'Uploading automatically',
      offline: 'No connection · saved on this phone', online: 'Connection restored · uploading automatically',
      thresholdOffline: 'Connection unstable · work saved on this phone', thresholdOnline: 'Connection restored · one record confirmed',
      poor: 'Waiting for a usable connection', connected: 'Connection available', failed: 'Upload failed', conflict: 'Conflict',
      blocked: 'Waiting for an earlier operation', done: 'No records waiting to sync on this phone',
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
      ,networkOffline: 'No connection', networkOnline: 'Connected', networkUnstable: 'Connection unstable', networkPaused: 'Upload paused',
      networkOfflineDetail: 'Records are saved on this phone. Upload resumes automatically when connected.',
      networkOnlineDetail: 'Saved records upload automatically when the connection is usable.',
      networkUnstableDetail: 'Your work stays on this phone until a usable connection returns.',
      networkPausedDetail: 'G. Hansen · Green Valley Farm. Sign in to the original account to continue uploading.',
      recordsHere: 'records', recordHere: 'record',
      needsAttention: 'Needs attention', checkingGroup: 'Checking result', uploadingGroup: 'Uploading', waitingGroup: 'Waiting to upload', blockedGroup: 'Waiting on earlier work',
      needsAttentionHint: 'Review these records before they can upload.',
      checkingGroupHint: 'The server result is being checked. These records are not sent again.',
      uploadingGroupHint: 'Sending now. You can leave this page.',
      waitingGroupHint: 'Saved here. Upload starts when possible.',
      blockedGroupHint: 'These records wait for an earlier operation.',
      reviewRecord: 'Review record', retryRecord: 'Open to retry',
      layoutStatus: 'Status first', layoutInbox: 'Action inbox', layoutTimeline: 'Activity rail',
      localQueue: 'Not yet synced', stateSummary: 'In progress', waitingTotal: 'Waiting / blocked', noAttention: 'Nothing needs action',
      recordsSaved: 'Your records remain on this phone until confirmed by the server.',
      errorGroup: 'Conflict or error', errorGroupHint: 'Open a record to see what needs resolving.',
      syncingSimple: 'Syncing', syncingSimpleHint: 'Sending or checking the server result.',
      pendingSimple: 'Waiting to sync', pendingSimpleHint: 'Saved here until it can sync.',
      attentionSimple: 'Needs attention', checkingDetail: 'Checking the server result. This record will not be sent again yet.',
      blockedDetail: 'Waiting for an earlier record to be resolved.',
      syncedTitle: 'Synced', syncedListTitle: 'Synced records', syncedRecent: 'Last 30 days', syncedCount: 'records',
      syncedEmpty: 'No synced records from this phone in the last 30 days.',
      syncedScope: 'Only records confirmed by the server and retained on this phone appear here.',
      syncedAt: 'Synced', savedAt: 'Saved at', viewSynced: 'View synced records',
      layoutTabs: 'Task tabs', tabActive: 'Not synced', tabSynced: 'Synced',
      manyTasks: 'tasks', manyRecords: 'records', taskBack: 'All tasks',
      taskSearch: 'Search pig ID or operation', taskSearchEmpty: 'No records match this search',
      filterAll: 'All', filterError: 'Need action', filterSyncing: 'Syncing', filterPending: 'Waiting',
      multiRecord: 'pigs in one operation', taskRecords: 'operations', unknownTask: 'Other records',
      layoutChains: 'Operation chains', chainOrder: 'Saved order', chainWaitingFor: 'Waiting for step',
      chainActive: 'not synced', chainSynced: 'synced', chainSteps: 'steps', chainSingle: 'Independent operations',
      chainHint: 'Linked records sync in dependency order. A later operation waits for its prerequisites.'
    },
    zh: {
      title: '本机记录', detail: '记录详情', back: '返回', waiting: '待上传',
      taskTitle: '分娩任务 · 本机记录', taskScopeHint: '仅展示本次分娩任务在各单元、栏位保存的记录。', allPhone: '查看本机全部记录', taskSaved: '分娩计数 · 母猪 000418', taskNote: '栏位备注 · B2', taskOther: '孕检 · 母猪 000308', taskPlace: '分娩 · 7 单元 · B1 栏', taskNotePlace: '分娩 · 8 单元 · B2 栏',
      production: '生产操作', inspection: '巡检', vaccination: '免疫', transfer: '转群', other: '其他操作',
      categoryHint: '按业务类别查看本机记录。', categoryWaiting: '本类别记录联网后会自动上传。',
      categoryCount: '条待同步记录',
      needs: '需要处理', uploaded: '已上传', uploadedRecent: '近30天已上传', syncing: '正在自动上传',
      offline: '无网络 · 已保存在本机', online: '网络已恢复 · 正在自动上传',
      thresholdOffline: '网络不稳定 · 记录已保存在本机', thresholdOnline: '网络已恢复 · 1 条已确认上传',
      poor: '等待可用网络', connected: '网络可用', failed: '上传失败', conflict: '冲突',
      blocked: '等待前置操作', done: '本机暂无待同步记录',
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
      ,networkOffline: '当前无网络', networkOnline: '网络可用', networkUnstable: '网络不稳定', networkPaused: '上传已暂停',
      networkOfflineDetail: '操作已保存在本机。联网后会自动同步。',
      networkOnlineDetail: '网络可用时，本机记录会自动上传。',
      networkUnstableDetail: '网络恢复可用前，操作会保留在本机。',
      networkPausedDetail: 'G. Hansen · Green Valley Farm。请登录原账号后继续上传。',
      recordsHere: '条记录', recordHere: '条记录',
      needsAttention: '需要处理', checkingGroup: '核对结果中', uploadingGroup: '正在上传', waitingGroup: '待上传', blockedGroup: '等待前置操作',
      needsAttentionHint: '查看记录后再处理上传问题。',
      checkingGroupHint: '正在核对服务端结果，暂不重复发送。',
      uploadingGroupHint: '正在发送；离开此页后仍会继续。',
      waitingGroupHint: '已保存在本机，条件满足后会自动上传。',
      blockedGroupHint: '前置操作处理完成后才能上传。',
      reviewRecord: '查看记录', retryRecord: '打开并重试',
      layoutStatus: '状态优先', layoutInbox: '待办分区', layoutTimeline: '进度轨道',
      localQueue: '尚未同步', stateSummary: '处理中', waitingTotal: '待上传 / 受阻', noAttention: '暂无需要处理的记录',
      recordsSaved: '服务端确认收到前，记录会一直保留在本机。',
      errorGroup: '冲突或错误', errorGroupHint: '打开记录查看原因和处理方式。',
      syncingSimple: '同步中', syncingSimpleHint: '正在发送或核对服务端结果。',
      pendingSimple: '待同步', pendingSimpleHint: '已保存在本机，满足条件后自动同步。',
      attentionSimple: '需处理', checkingDetail: '正在核对服务端结果，暂不重复发送。',
      blockedDetail: '正在等待前置记录处理完成。',
      syncedTitle: '已同步', syncedListTitle: '已同步记录', syncedRecent: '最近30天', syncedCount: '条记录',
      syncedEmpty: '这台手机最近30天暂无已同步记录。',
      syncedScope: '这里只显示服务端已确认、仍保留在这台手机上的记录。',
      syncedAt: '同步于', savedAt: '保存于', viewSynced: '查看已同步记录',
      layoutTabs: '任务分组', tabActive: '未同步', tabSynced: '已同步',
      manyTasks: '项任务', manyRecords: '条记录', taskBack: '全部任务',
      taskSearch: '搜索耳号或操作', taskSearchEmpty: '没有符合条件的记录',
      filterAll: '全部', filterError: '需处理', filterSyncing: '同步中', filterPending: '待同步',
      multiRecord: '头猪合并为一条操作', taskRecords: '条操作', unknownTask: '其他记录',
      layoutChains: '操作链', chainOrder: '保存顺序', chainWaitingFor: '等待第',
      chainActive: '未同步', chainSynced: '已同步', chainSteps: '步操作', chainSingle: '独立操作',
      chainHint: '关联操作按依赖关系同步；前置未解决，后续不会发送。'
    }
  };
  const t = key => copy[state.lang][key] || key;
  let dialogReturnAction = '';
  // Design fixture mirrors the old OfflineCommand hierarchy: category → taskType → taskId → operations.
  // One row is one queued command. A multi-pig submission remains one row, with target count in its summary.
  const volumeTasks = [
    {id:'preg31', zh:'孕检 · 31 批', en:'Pregnancy check · Batch 31', actionZh:'孕检', actionEn:'Pregnancy check', areaZh:'妊娠区', areaEn:'Gestation', category:'production', type:'pregnancy', count:18, synced:6, errors:2, syncing:1, units:[7,8]},
    {id:'vacc21', zh:'免疫 · V-21 计划', en:'Vaccination · Plan V-21', actionZh:'接种', actionEn:'Vaccination', areaZh:'保育区', areaEn:'Nursery', category:'vaccination', type:'vaccination', count:14, synced:4, errors:1, syncing:2, units:[3,4]},
    {id:'transfer08', zh:'转群 · T-08', en:'Transfer · T-08', actionZh:'转群', actionEn:'Transfer', areaZh:'妊娠区', areaEn:'Gestation', category:'transfer', type:'transfer', count:12, synced:3, errors:1, syncing:1, units:[6,7]},
    {id:'inspect07', zh:'单元巡检 · 妊娠区', en:'Unit inspection · Gestation', actionZh:'单元巡检', actionEn:'Unit inspection', areaZh:'妊娠区', areaEn:'Gestation', category:'inspection', type:'unit-inspection', count:10, synced:3, errors:1, syncing:0, units:[7,8]},
    {id:'sample12', zh:'采样 · S-12', en:'Sampling · S-12', actionZh:'采样', actionEn:'Sampling', areaZh:'育肥区', areaEn:'Finishing', category:'sampling', type:'sampling', count:9, synced:3, errors:0, syncing:1, units:[2,3]},
    {id:'therapy15', zh:'治疗 · 15 号医嘱', en:'Treatment · Order 15', actionZh:'治疗记录', actionEn:'Treatment', areaZh:'保育区', areaEn:'Nursery', category:'advice', type:'therapy', count:8, synced:4, errors:0, syncing:0, units:[3]},
    {id:'mating32', zh:'配种 · 32 批', en:'Mating · Batch 32', actionZh:'配种', actionEn:'Mating', areaZh:'配种区', areaEn:'Breeding', category:'production', type:'mating', count:7, synced:2, errors:0, syncing:1, units:[1,2]},
    {id:'piglet16', zh:'仔猪处理 · 16 批', en:'Piglet care · Batch 16', actionZh:'仔猪处理', actionEn:'Piglet care', areaZh:'分娩区', areaEn:'Farrowing', category:'production', type:'piglet', count:8, synced:3, errors:0, syncing:0, units:[4,5]},
    {id:'outbound04', zh:'出库 · O-04', en:'Outbound · O-04', actionZh:'出库', actionEn:'Outbound', areaZh:'育肥区', areaEn:'Finishing', category:'outbound', type:'outbound', count:6, synced:2, errors:0, syncing:0, units:[2]},
    {id:'semen06', zh:'精液出库 · 06', en:'Semen picking · 06', actionZh:'精液拣货', actionEn:'Semen picking', areaZh:'公猪舍', areaEn:'Boar house', category:'semen', type:'semen', count:5, synced:2, errors:0, syncing:0, units:[1]}
  ];
  const volumeRecords = () => volumeTasks.flatMap((task, taskIndex) => Array.from({length:task.count}, (_,index) => {
    const oneBatch = task.id === 'vacc21' && index === 5;
    const chainA = task.id === 'preg31' && index <= 2;
    const chainB = task.id === 'preg31' && index >= 4 && index <= 6;
    const transferChain = task.id === 'transfer08' && index <= 2;
    const pigId = chainA ? '000308' : chainB ? index===5?'000313':'000312' : String(308 + taskIndex * 40 + index).padStart(6,'0');
    const unit = chainA ? 7 : chainB ? 8 : transferChain ? 6 : task.units[index % task.units.length];
    const pregnancyStatuses = ['uploaded','failed','blocked','conflict','uploaded','syncing','waiting'];
    const status = task.id === 'preg31' && index < pregnancyStatuses.length ? pregnancyStatuses[index]
      : task.id === 'preg31' && (index === 12 || index === 17) ? 'waiting'
      : task.id === 'transfer08' && index === 3 ? 'syncing'
      : index < task.errors ? index % 2 ? 'conflict' : 'failed'
      : index < task.errors + (task.id === 'transfer08' ? 0 : task.syncing) ? index % 2 ? 'checking' : 'syncing'
      : task.id === 'preg31' && index === 3 ? 'blocked'
      : index >= task.count - task.synced ? 'uploaded' : 'waiting';
    const chainTitlesZh = ['记录孕检 · 000308','提交 7 单元孕检','继续检查 · 000308','','记录孕检 · 000312','记录孕检 · 000313','提交 8 单元孕检 · 2 头'];
    const chainTitlesEn = ['Record check · 000308','Submit Unit 7 checks','Continue check · 000308','','Record check · 000312','Record check · 000313','Submit Unit 8 checks · 2 pigs'];
    const transferTitlesZh = ['转出 · T-08A','补录转群猪只 · T-08A','转入 · T-08A'];
    const transferTitlesEn = ['Transfer out · T-08A','Add transfer target · T-08A','Transfer in · T-08A'];
    const titleZh = oneBatch ? '提交免疫结果 · 12 头' : transferChain ? transferTitlesZh[index] : task.id === 'preg31' && chainTitlesZh[index] ? chainTitlesZh[index] : `${task.actionZh} · ${pigId}`;
    const titleEn = oneBatch ? 'Submit vaccination · 12 pigs' : transferChain ? transferTitlesEn[index] : task.id === 'preg31' && chainTitlesEn[index] ? chainTitlesEn[index] : `${task.actionEn} · ${pigId}`;
    const placeZh = `${task.areaZh} · ${unit} 单元${task.id === 'preg31' ? ' · 31 批' : ''}`;
    const placeEn = `${task.areaEn} · Unit ${unit}${task.id === 'preg31' ? ' · Batch 31' : ''}`;
    const id = `${task.id}-${index}`;
    const dependsOn = chainA && index > 0 ? [`preg31-${index-1}`]
      : chainB && index === 6 ? ['preg31-4','preg31-5'] : [];
    const minuteOffset=index*4;
    const at=`${String(8+Math.floor(minuteOffset/60)).padStart(2,'0')}:${String(minuteOffset%60).padStart(2,'0')}`;
    return {id, operationId:`op-${id}`, taskId:task.id, taskType:task.type, category:task.category,
      entityType:oneBatch||transferChain||task.id==='preg31'&&(index===1||index===6)?'task':'pig', entityId:oneBatch?task.id:transferChain?'T-08A':pigId,
      groupKey:transferChain?'transferTask:T-08A':task.id==='preg31'&&(index===1||index===6)?`pregnancySubmit:${task.id}:${unit}:${id}`:oneBatch?`task:${task.id}`:`pig:${pigId}`,
      dependsOn, status,
      taskTitleZh:task.zh, taskTitleEn:task.en, unit,
      titleZh, titleEn, placeZh, placeEn, at, createdAt:`2026-10-16T${at}:00`,
      syncedAt:new Date(Date.now()-(1+index%12)*86400000).toISOString(),
      summary:{titleZh,titleEn,placeZh,placeEn,targetCount:oneBatch?12:1}
    };
  }));
  const records = () => {
    if (state.scenario === 'volume') return volumeRecords();
    if (state.scenario === 'mixed' && !state.taskScope) return [
      {id:'mixed-failed',category:'production',titleEn:'Pregnancy check · 000308',titleZh:'孕检 · 000308',placeEn:'Gestation · Unit 7 · Batch 31',placeZh:'妊娠区 · 7 单元 · 31 批',at:'09:32',status:'failed'},
      {id:'mixed-conflict',category:'inspection',titleEn:'Pen note · C2',titleZh:'栏位备注 · C2',placeEn:'Gestation · Unit 8',placeZh:'妊娠区 · 8 单元',at:'09:35',status:'conflict'},
      {id:'mixed-checking',category:'production',titleEn:'Feed adjustment · 000267',titleZh:'饲喂调整 · 000267',placeEn:'Gestation · Unit 7 · Pen C1',placeZh:'妊娠区 · 7 单元 · C1 栏',at:'09:38',status:'checking'},
      {id:'mixed-blocked',category:'production',titleEn:'Follow-up check · 000308',titleZh:'后续检查 · 000308',placeEn:'Gestation · Unit 7',placeZh:'妊娠区 · 7 单元',at:'09:39',status:'blocked',dependsOn:['mixed-failed']},
      {id:'mixed-waiting',category:'vaccination',titleEn:'Vaccination · Plan V-21',titleZh:'免疫 · V-21 计划',placeEn:'Gestation · Unit 8',placeZh:'妊娠区 · 8 单元',at:'09:40',status:'waiting'}
    ];
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
  const displayGroup = status => status === 'failed' || status === 'conflict' ? 'error'
    : status === 'syncing' || status === 'checking' ? 'syncing'
    : status === 'uploaded' ? 'synced' : 'pending';
  const displayStatus = status => t({error:'attentionSimple',syncing:'syncingSimple',pending:'pendingSimple',synced:'syncedTitle'}[displayGroup(status)]);
  const itemTitle = item => item[state.lang === 'zh' ? 'titleZh' : 'titleEn'] || t(item.id);
  const itemPlace = item => item[state.lang === 'zh' ? 'placeZh' : 'placeEn'] || t(item.place);
  const categoryFor = item => ['production','inspection','vaccination','transfer'].includes(item.category) ? item.category : 'other';
  const recentUploads = items => {
    const cutoff = Date.now() - 30 * 86400000;
    return items.filter(item => item.status === 'uploaded' && Date.parse(item.syncedAt) >= cutoff);
  };
  const syncedCountText = count => state.lang === 'zh' ? `${count} 条记录` : `${count} ${count === 1 ? 'record' : 'records'}`;
  const recentUploadEntry = items => state.taskScope ? '' : `<button type="button" class="sync-history-entry" data-action="open-history" data-count="${recentUploads(items).length}" aria-label="${safe(t('viewSynced'))} · ${recentUploads(items).length}">
    <span class="sync-history-entry-icon" aria-hidden="true">${I.icon('check')}</span>
    <span class="sync-history-entry-copy"><strong>${safe(t('syncedListTitle'))}</strong><small>${safe(t('syncedRecent'))} · ${safe(syncedCountText(recentUploads(items).length))}</small></span>
    <span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span>
  </button>`;

  const safe = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const activeStatuses = ['failed','conflict','checking','syncing','blocked','waiting'];
  const statusIcon = {error:'alert',syncing:'upload',pending:'clock'};
  const statusOrder = [
    {key:'error',statuses:['failed','conflict'],title:'errorGroup',hint:'errorGroupHint'},
    {key:'syncing',statuses:['syncing','checking'],title:'syncingSimple',hint:'syncingSimpleHint'},
    {key:'pending',statuses:['waiting','blocked'],title:'pendingSimple',hint:''}
  ];
  const networkFor = mode => mode === 'offline' || mode === 'switch' || mode === 'busy' ? 'offline'
    : mode === 'threshold' && !state.uploadedOne ? 'unstable'
    : mode === 'expired' ? 'paused' : 'online';
  const networkText = kind => ({offline:['networkOffline','networkOfflineDetail'],online:['networkOnline','networkOnlineDetail'],unstable:['networkUnstable','networkUnstableDetail'],paused:['networkPaused','networkPausedDetail']}[kind]);
  const networkPanel = (kind, compact=false) => {
    const [title,detail] = networkText(kind);
    return `<div class="sync-network sync-network--${kind}${compact?' sync-network--compact':''}">
      <span class="sync-network-icon" aria-hidden="true">${I.icon(kind === 'online' ? 'signal' : kind === 'paused' ? 'alert' : 'offline')}</span>
      <div class="sync-network-copy"><strong>${safe(t(title))}</strong><span>${safe(t(detail))}</span></div>
    </div>`;
  };
  const statusPill = status => `<span class="sync-pill sync-pill--${displayGroup(status)}"><span class="sync-pill-dot" aria-hidden="true"></span>${safe(displayStatus(status))}</span>`;
  const statusRow = (item, variant) => `<button type="button" class="sync-record sync-record--${variant} sync-record--${displayGroup(item.status)}" data-action="open-record" data-value="${safe(item.id)}" aria-label="${safe(itemTitle(item) + ' · ' + displayStatus(item.status))}">
    <span class="sync-record-mark sync-record-mark--${displayGroup(item.status)}" aria-hidden="true">${I.icon(statusIcon[displayGroup(item.status)]||'record')}</span>
    <span class="sync-record-main"><strong>${safe(itemTitle(item))}</strong><small>${safe(itemPlace(item))} · ${safe(item.at)}</small>${statusPill(item.status)}${item.status === 'blocked' ? `<small class="sync-record-context">${safe(t('blockedDetail'))}</small>` : item.status === 'checking' ? `<small class="sync-record-context">${safe(t('checkingDetail'))}</small>` : ''}</span>
    <span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span>
  </button>`;
  const categoryCards = waiting => {
    const keys = ['production','inspection','vaccination','transfer','other'].filter(category => waiting.some(item => categoryFor(item) === category));
    return `<div class="sync-category-list">${keys.map(category => {
      const count = waiting.filter(item => categoryFor(item) === category).length;
      return `<button type="button" class="sync-category-row" data-action="open-category" data-value="${category}"><span class="sync-category-icon" aria-hidden="true">${I.icon('grid')}</span><span><strong>${safe(t(category))}</strong><small>${count} ${safe(t('categoryCount'))}</small></span><span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span></button>`;
    }).join('')}</div>`;
  };
  const groupedRecords = (items, variant, grouped) => statusOrder.map(group => {
    const entries = items.filter(item => group.statuses.includes(item.status));
    if (!entries.length) return '';
    const rows = group.key === 'pending' && grouped && !state.taskScope
      ? categoryCards(entries.filter(item => item.status === 'waiting')) + entries.filter(item => item.status === 'blocked').map(item => statusRow(item,variant)).join('')
      : entries.map(item => statusRow(item,variant)).join('');
    return `<section class="sync-status-section sync-status-section--${group.key}" data-count="${entries.length}">
      <header class="sync-section-heading"><div><h3>${safe(t(group.title))}</h3>${group.hint?`<p>${safe(t(group.hint))}</p>`:''}</div><span>${entries.length}</span></header>
      <div class="sync-record-list">${rows}</div>
    </section>`;
  }).join('');
  const statusCounts = items => ({attention:items.filter(x=>x.status==='failed'||x.status==='conflict').length,
    processing:items.filter(x=>x.status==='checking'||x.status==='syncing').length,
    waiting:items.filter(x=>x.status==='waiting'||x.status==='blocked').length});
  const taskKey = item => item.taskId || '__other__';
  const taskName = (key, items) => {
    const known = volumeTasks.find(task => task.id === key);
    if (known) return state.lang === 'zh' ? known.zh : known.en;
    if (key === 'farrow28') return t('taskTitle');
    const first = items[0];
    return first?.[state.lang === 'zh' ? 'taskTitleZh' : 'taskTitleEn'] || t('unknownTask');
  };
  const taskArea = key => {
    const known = volumeTasks.find(task => task.id === key);
    return known ? state.lang === 'zh' ? known.areaZh : known.areaEn : '';
  };
  const taskGroups = items => {
    const grouped = new Map();
    items.forEach(item => { const key = taskKey(item); if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(item); });
    return [...grouped].sort((left,right) => {
      if (state.queueTab === 'active') {
        const a = statusCounts(left[1]).attention, b = statusCounts(right[1]).attention;
        if (a !== b) return b-a;
      }
      return volumeTasks.findIndex(task=>task.id===left[0])-volumeTasks.findIndex(task=>task.id===right[0]);
    });
  };
  const taskSummary = (items, synced) => {
    if (synced) return `${items.length} ${t('manyRecords')}`;
    const counts = statusCounts(items);
    return [counts.attention&&`${t('filterError')} ${counts.attention}`,counts.processing&&`${t('filterSyncing')} ${counts.processing}`,counts.waiting&&`${t('filterPending')} ${counts.waiting}`].filter(Boolean).join(' · ');
  };
  const taskStatusHtml = items => {
    const counts = statusCounts(items);
    return `<span class="sync-task-row-status">${[
      counts.attention&&`<span class="sync-task-row-alert">${safe(t('filterError'))} ${counts.attention}</span>`,
      counts.processing&&`<span>${safe(t('filterSyncing'))} ${counts.processing}</span>`,
      counts.waiting&&`<span>${safe(t('filterPending'))} ${counts.waiting}</span>`
    ].filter(Boolean).join('<span aria-hidden="true"> · </span>')}</span>`;
  };
  const tabbedRecordRow = item => {
    const synced = item.status === 'uploaded';
    const meta = synced ? `${t('syncedAt')} ${formatSyncedAt(item.syncedAt)}` : `${itemPlace(item)} · ${item.at}`;
    return `<button type="button" class="sync-tab-record sync-tab-record--${displayGroup(item.status)}" data-action="open-record" data-value="${safe(item.id)}" aria-label="${safe(itemTitle(item)+' · '+displayStatus(item.status))}">
      <span class="sync-tab-record-copy"><strong>${safe(itemTitle(item))}</strong><small>${safe(meta)}</small>${!synced&&item.status==='blocked'?`<small class="sync-tab-record-reason">${safe(t('blockedDetail'))}</small>`:''}${!synced&&item.status==='checking'?`<small class="sync-tab-record-reason">${safe(t('checkingDetail'))}</small>`:''}</span>
      ${!synced?statusPill(item.status):''}<span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span>
    </button>`;
  };
  const tabbedTaskRows = items => {
    const groups = taskGroups(items);
    if (!groups.length) return `<p class="sync-empty-state">${safe(t(state.queueTab==='synced'?'syncedEmpty':'done'))}</p>`;
    return `<div class="sync-task-list">${groups.map(([key, entries]) => {
      const area = taskArea(key);
      const units = new Set(entries.map(item=>item.unit).filter(Boolean)).size;
      const location = [area,units>1 ? state.lang==='zh'?`涉及 ${units} 个单元`:`Across ${units} units`:''].filter(Boolean).join(' · ');
      return `<button type="button" class="sync-task-row" data-action="open-task-records" data-value="${safe(key)}" aria-label="${safe(taskName(key,entries)+' · '+taskSummary(entries,state.queueTab==='synced'))}">
        <span class="sync-task-row-copy"><strong>${safe(taskName(key,entries))}</strong>${location?`<small>${safe(location)}</small>`:''}${state.queueTab==='active'?taskStatusHtml(entries):''}</span>
        <span class="sync-task-row-count"><strong>${entries.length}</strong><small>${safe(t('manyRecords'))}</small></span><span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span>
      </button>`;
    }).join('')}</div>`;
  };
  const tabbedTaskDetail = (items, key) => {
    const own = items.filter(item=>taskKey(item)===key);
    const active = own.filter(item=>activeStatuses.includes(item.status));
    const uploaded = recentUploads(own);
    const source = state.queueTab==='synced' ? uploaded : active;
    const query = state.taskQuery.trim().toLocaleLowerCase();
    const matches = source.filter(item=>!query || [itemTitle(item),itemPlace(item),item.entityId,item.operationId].some(value=>String(value||'').toLocaleLowerCase().includes(query)));
    const counts = statusCounts(active);
    const filters = state.queueTab==='active' ? `<div class="sync-task-filter">${S.segment({variant:'two-line-lens',options:[
      ['all',safe(t('filterAll')),{count:active.length}],
      ['error',safe(t('filterError')),{count:counts.attention}],
      ['syncing',safe(t('filterSyncing')),{count:counts.processing}],
      ['pending',safe(t('filterPending')),{count:counts.waiting}]
    ],active:state.statusFilter,action:'filter-task-status',ariaLabel:t('tabActive')})}</div>` : '';
    const visible = state.queueTab==='active' && state.statusFilter!=='all' ? matches.filter(item=>displayGroup(item.status)===state.statusFilter) : matches;
    visible.sort((a,b)=>state.queueTab==='synced' ? Date.parse(b.syncedAt)-Date.parse(a.syncedAt)
      : ['error','syncing','pending'].indexOf(displayGroup(a.status))-['error','syncing','pending'].indexOf(displayGroup(b.status)));
    const manyUnits = visible.length>=9 && new Set(visible.map(item=>item.unit).filter(Boolean)).size>1;
    const rows = manyUnits ? [...new Set(visible.map(item=>item.unit))].map(unit=>{
      const unitItems=visible.filter(item=>item.unit===unit);
      return `<section class="sync-tab-unit"><h3>${safe(state.lang==='zh'?`${unit} 单元`:`Unit ${unit}`)} <span>${unitItems.length}</span></h3><div class="sync-tab-record-list">${unitItems.map(tabbedRecordRow).join('')}</div></section>`;
    }).join('') : `<div class="sync-tab-record-list">${visible.map(tabbedRecordRow).join('')}</div>`;
    return `<div class="sync-task-detail"><button type="button" class="sync-task-back" data-action="back-to-tasks">‹ ${safe(t('taskBack'))}</button>
      <div class="sync-task-title"><h2>${safe(taskName(key,own))}</h2><p>${safe(taskArea(key))} · ${source.length} ${safe(t('taskRecords'))}</p></div>
      <label class="sync-task-search"><span class="visually-hidden">${safe(t('taskSearch'))}</span><input type="search" data-sync-task-search placeholder="${safe(t('taskSearch'))}" value="${safe(state.taskQuery)}"></label>
      ${filters}${visible.length?`<div class="sync-tab-detail-rows">${rows}</div>`:`<p class="sync-empty-state">${safe(query?t('taskSearchEmpty'):state.queueTab==='synced'?t('syncedEmpty'):t('done'))}</p>`}
    </div>`;
  };
  // A task is a scope, not a single queue. Connected commands share an ordering key or an explicit dependency.
  const commandGroupKeys = item => [...new Set((item.groupKeys?.length?item.groupKeys:[item.groupKey||`command:${item.id}`]).filter(Boolean))];
  const commandsShareGroup = (a,b) => commandGroupKeys(a).some(key=>commandGroupKeys(b).includes(key));
  const operationChains = own => {
    const parent = new Map(own.map(item=>[item.id,item.id]));
    const find = id => { const p=parent.get(id); return p===id?id:find(p); };
    const join = (a,b) => { const aa=find(a),bb=find(b); if(aa!==bb) parent.set(bb,aa); };
    own.forEach((item,i)=>own.slice(i+1).forEach(other=>{
      const shared=commandsShareGroup(item,other);
      const dependent=item.dependsOn?.includes(other.id)||other.dependsOn?.includes(item.id);
      if(shared||dependent) join(item.id,other.id);
    }));
    const groups=new Map();
    own.forEach(item=>{ const root=find(item.id); if(!groups.has(root)) groups.set(root,[]); groups.get(root).push(item); });
    return [...groups.values()].map(entries=>entries.sort((a,b)=>(a.createdAt||a.at).localeCompare(b.createdAt||b.at)||a.id.localeCompare(b.id)))
      .sort((a,b)=>{
        const rank=entries=>entries.some(item=>displayGroup(item.status)==='error')?0:entries.some(item=>displayGroup(item.status)==='syncing')?1:2;
        return rank(a)-rank(b)||b.length-a.length||a[0].at.localeCompare(b[0].at);
      });
  };
  const operationChainName = entries => {
    const first=entries[0], pigIds=[...new Set(entries.filter(item=>item.entityType==='pig').map(item=>item.entityId))];
    if(pigIds.length>1) return state.lang==='zh'?`${first.unit} 单元 · ${pigIds.length} 头关联操作`:`Unit ${first.unit} · ${pigIds.length} pigs`;
    if(first.entityType==='task'&&entries.every(item=>item.entityId===first.entityId))
      return state.lang==='zh'?`${first.category==='transfer'?'转群':'任务'} · ${first.entityId}`
        :`${first.category==='transfer'?'Transfer':'Task'} · ${first.entityId}`;
    const samePig=entries.every(item=>item.entityId===first.entityId);
    if(samePig&&first.entityType==='pig') return state.lang==='zh'?`母猪 ${first.entityId}`:`Sow ${first.entityId}`;
    const pig=entries.find(item=>item.entityType==='pig');
    if(pig) return state.lang==='zh'?`母猪 ${pig.entityId} · 关联操作`:`Sow ${pig.entityId} · linked work`;
    return state.lang==='zh'?`${first.unit} 单元 · 关联操作`:`Unit ${first.unit} · linked work`;
  };
  const operationChainStep = (item,index,entries) => {
    const predecessor=entries.findIndex((previous,position)=>position<index&&previous.status!=='uploaded'&&
      (item.dependsOn?.includes(previous.id)||commandsShareGroup(item,previous)));
    const needsHandling=predecessor>=0&&['failed','conflict'].includes(entries[predecessor].status);
    const waitingFor=item.status==='blocked'&&predecessor>=0
      ? state.lang==='zh'?`等待第 ${predecessor+1} 步处理`:`Waiting for step ${predecessor+1}`
      : item.status==='waiting'&&predecessor>=0
      ? state.lang==='zh'?`等待第 ${predecessor+1} 步${needsHandling?'处理':'完成'}`:`Waiting for step ${predecessor+1}`:'';
    const exactStatus=item.status==='failed'?t('failed'):item.status==='conflict'?t('conflict')
      :item.status==='blocked'?t('blocked'):displayStatus(item.status);
    return `<li class="sync-chain-step sync-chain-step--${displayGroup(item.status)}"><button type="button" data-action="open-record" data-value="${safe(item.id)}" aria-label="${safe(`${index+1}. ${itemTitle(item)} · ${exactStatus}`)}">
      <span class="sync-chain-dot" aria-hidden="true">${item.status==='uploaded'?I.icon('check'):index+1}</span>
      <span class="sync-chain-step-copy"><strong>${safe(itemTitle(item))}</strong><small>${safe(item.at)} · ${safe(exactStatus)}</small>${waitingFor?`<em>${safe(waitingFor)}</em>`:''}</span>
      <span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span>
    </button></li>`;
  };
  const chainTaskDetail = (items,key) => {
    if(state.queueTab==='synced') return tabbedTaskDetail(items,key);
    const own=items.filter(item=>taskKey(item)===key), active=own.filter(item=>activeStatuses.includes(item.status));
    const counts=statusCounts(active), query=state.taskQuery.trim().toLocaleLowerCase();
    const groups=operationChains(own).filter(entries=>{
      const activeEntries=entries.filter(item=>activeStatuses.includes(item.status));
      if(!activeEntries.length) return false;
      if(state.statusFilter!=='all'&&!activeEntries.some(item=>displayGroup(item.status)===state.statusFilter)) return false;
      return !query||entries.some(item=>[itemTitle(item),itemPlace(item),item.entityId,item.operationId].some(value=>String(value||'').toLocaleLowerCase().includes(query)));
    });
    const filters=S.segment({variant:'two-line-lens',options:[
      ['all',safe(t('filterAll')),{count:active.length}],['error',safe(t('filterError')),{count:counts.attention}],
      ['syncing',safe(t('filterSyncing')),{count:counts.processing}],['pending',safe(t('filterPending')),{count:counts.waiting}]
    ],active:state.statusFilter,action:'filter-task-status',ariaLabel:t('tabActive')});
    const cards=groups.map(entries=>{
      const pending=entries.filter(item=>activeStatuses.includes(item.status));
      if(entries.length===1) return `<div class="sync-chain-single">${tabbedRecordRow(entries[0])}</div>`;
      const id=entries[0].id, expanded=state.expandedChains.has(id);
      const alert=entries.some(item=>displayGroup(item.status)==='error');
      const status=alert?t('filterError'):entries.some(item=>displayGroup(item.status)==='syncing')?t('filterSyncing'):t('filterPending');
      return `<section class="sync-chain-card ${expanded?'is-expanded':''} ${alert?'has-error':''}">
        <button type="button" class="sync-chain-header" data-action="toggle-chain" data-value="${safe(id)}" aria-expanded="${expanded}">
          <span class="sync-chain-header-main"><strong>${safe(operationChainName(entries))}</strong><small>${safe(state.lang==='zh'?`${entries[0].unit} 单元`:`Unit ${entries[0].unit}`)} · ${entries.length} ${safe(t('chainSteps'))}</small><span>${pending.length} ${safe(t('chainActive'))} · ${entries.length-pending.length} ${safe(t('chainSynced'))}</span></span>
          <span class="sync-chain-header-side"><span class="sync-chain-head-status">${safe(status)}</span><span aria-hidden="true" class="sync-chain-chevron">⌄</span></span>
        </button>
        ${expanded?`<div class="sync-chain-body"><p class="sync-chain-order">${safe(entries.some(item=>item.dependsOn?.length>1)
          ? state.lang==='zh'?'前置检查可并行 · 提交等待全部完成':'Checks may sync in parallel · submission waits for all'
          : `${t('chainOrder')} · 1 → ${entries.length}`)}</p><ol class="sync-chain-steps">${entries.map((item,index)=>operationChainStep(item,index,entries)).join('')}</ol></div>`:''}
      </section>`;
    }).join('');
    return `<div class="sync-task-detail sync-chain-detail"><button type="button" class="sync-task-back" data-action="back-to-tasks">‹ ${safe(t('taskBack'))}</button>
      <div class="sync-task-title"><h2>${safe(taskName(key,own))}</h2><p>${safe(taskArea(key))} · ${active.length} ${safe(t('taskRecords'))}</p></div>
      <p class="sync-chain-hint">${safe(t('chainHint'))}</p>
      <label class="sync-task-search"><span class="visually-hidden">${safe(t('taskSearch'))}</span><input type="search" data-sync-task-search placeholder="${safe(t('taskSearch'))}" value="${safe(state.taskQuery)}"></label>
      <div class="sync-task-filter">${filters}</div>
      ${groups.length?`<div class="sync-chain-list">${cards}</div>`:`<p class="sync-empty-state">${safe(query?t('taskSearchEmpty'):t('done'))}</p>`}
    </div>`;
  };
  function tabbedList(items, mode, reauth, allPhone) {
    const scopeItems = state.selectedTask ? items.filter(item=>taskKey(item)===state.selectedTask) : items;
    const active = scopeItems.filter(item=>activeStatuses.includes(item.status));
    const uploaded = recentUploads(scopeItems);
    const source = state.queueTab==='synced' ? uploaded : active;
    const taskCount = taskGroups(source).length;
    const tabs = S.segment({variant:'two-line-lens',options:[
      ['active',safe(t('tabActive')),{count:active.length}],
      ['synced',safe(t('tabSynced')),{count:uploaded.length}]
    ],active:state.queueTab,action:'switch-queue-tab',ariaLabel:t('title')});
    return `<div class="sync-tabbed"><div class="sync-tab-sticky">${tabs}</div>
      ${state.queueTab==='active'?networkPanel(networkFor(mode),true):''}
      ${reauth}${allPhone}
      ${state.selectedTask ? state.variant==='chains'?chainTaskDetail(items,state.selectedTask):tabbedTaskDetail(items,state.selectedTask) : `<div class="sync-task-index"><p class="sync-task-index-summary">${taskCount} ${safe(t('manyTasks'))} · ${source.length} ${safe(t('manyRecords'))}</p>${tabbedTaskRows(source)}</div>`}
    </div>`;
  }
  function designedList(items, mode, reauth, allPhone) {
    if (state.variant === 'tabs' || state.variant === 'chains') return tabbedList(items,mode,reauth,allPhone);
    const active = items.filter(item => activeStatuses.includes(item.status));
    const count = active.length;
    const network = networkFor(mode);
    const counts = statusCounts(active);
    const grouped = state.groupingMode && !state.taskScope;
    const sections = groupedRecords(active,state.variant,grouped);
    const recent = recentUploadEntry(items);
    const scope = state.taskScope ? `<p class="sync-scope">${safe(t('taskScopeHint'))}</p>` : '';
    const extra = reauth + allPhone;
    if (state.variant === 'inbox') return `<div class="sync-study sync-study--inbox">
      ${networkPanel(network,true)}
      <div class="sync-inbox-hero"><span class="sync-overline">${safe(t('localQueue'))}</span><div class="sync-inbox-number">${count}<span>${safe(t(count===1?'recordHere':'recordsHere'))}</span></div><p>${safe(t('recordsSaved'))}</p></div>
      ${scope}<div class="sync-inbox-totals"><div class="${counts.attention?'sync-total--attention':''}"><strong>${counts.attention}</strong><span>${safe(t('errorGroup'))}</span></div><div><strong>${counts.processing}</strong><span>${safe(t('syncingSimple'))}</span></div><div><strong>${counts.waiting}</strong><span>${safe(t('pendingSimple'))}</span></div></div>
      ${extra}<div class="sync-study-groups">${sections || `<p class="sync-empty-state">${safe(t('done'))}</p>`}${recent}</div>
    </div>`;
    if (state.variant === 'timeline') return `<div class="sync-study sync-study--timeline">
      ${networkPanel(network,true)}
      <div class="sync-timeline-summary"><div><span class="sync-overline">${safe(t('localQueue'))}</span><strong>${count}</strong><span>${safe(t(count===1?'recordHere':'recordsHere'))}</span></div><p>${safe(t('recordsSaved'))}</p></div>
      ${scope}${extra}<div class="sync-study-groups">${sections || `<p class="sync-empty-state">${safe(t('done'))}</p>`}${recent}</div>
    </div>`;
    return `<div class="sync-study sync-study--status">
      ${networkPanel(network)}
      <div class="sync-queue-summary"><span class="sync-overline">${safe(t('localQueue'))}</span><div class="sync-queue-number"><strong>${count}</strong><span>${safe(t(count===1?'recordHere':'recordsHere'))}</span></div></div>
      ${scope}${extra}<div class="sync-study-groups">${sections || `<p class="sync-empty-state">${safe(t('done'))}</p>`}${recent}</div>
    </div>`;
  }

  function listView() {
    const items = records().filter(item => !state.taskScope || item.taskId === state.taskScope && item.status !== 'uploaded');
    const waiting = items.filter(x => x.status === 'waiting');
    if (state.category) {
      const categoryItems = waiting.filter(item => categoryFor(item) === state.category);
      const body = `<div class="sync-study sync-study--${state.variant}"><p class="sync-scope">${safe(t('categoryWaiting'))}</p><div class="sync-study-groups">${groupedRecords(categoryItems,state.variant,false)}</div></div>`;
      app.innerHTML = S.sheet({variant:'page',title:t(state.category),body,
        footer:S.sheetFooter({back:{action:'back-to-all',label:t('back')}})});
      renderDialog();
      return;
    }
    const mode = state.scenario;
    const reauth = mode === 'expired' ? S.button({label:t('reauth'),register:'primary',action:'open-reauth'}) : '';
    const allPhone = state.taskScope ? `<button type="button" class="sync-all-phone" data-action="show-all">${t('allPhone')} · ${records().filter(item=>item.status!=='uploaded').length} →</button>` : '';
    if (state.groupingMode === null) state.groupingMode = waiting.length >= 9 && new Set(waiting.map(categoryFor)).size >= 2;
    const body = designedList(items,mode,reauth,allPhone);
    app.innerHTML = S.sheet({
      variant:'page', title:t(state.taskScope ? 'taskTitle' : 'title'), body,
      footer:S.sheetFooter({back:{action:'go-home',label:t('back')}})
    });
    if (state.scenario === 'switch' && !state.switchPromptShown) {
      state.dialog = 'switch';
      state.switchPromptShown = true;
    }
    renderDialog();
  }
  const formatSyncedAt = value => new Intl.DateTimeFormat(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
    month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
  }).format(new Date(value));
  function historyView() {
    const uploaded = recentUploads(records());
    const body = `<div class="sync-history-page">
      <div class="sync-history-intro"><strong>${safe(t('syncedRecent'))} · ${safe(syncedCountText(uploaded.length))}</strong><p>${safe(t('syncedScope'))}</p></div>
      ${uploaded.length ? `<div class="sync-history-list">${uploaded.map(item => `<button type="button" class="sync-history-row" data-action="open-record" data-value="${safe(item.id)}" aria-label="${safe(itemTitle(item) + ' · ' + t('syncedTitle'))}">
        <span class="sync-history-mark" aria-hidden="true">${I.icon('check')}</span><span class="sync-history-main"><strong>${safe(itemTitle(item))}</strong><small>${safe(itemPlace(item))}</small><small>${safe(t('syncedAt'))} ${safe(formatSyncedAt(item.syncedAt))}</small></span><span class="sync-record-chevron" aria-hidden="true">${I.icon('chevron')}</span>
      </button>`).join('')}</div>` : `<p class="sync-history-empty">${safe(t('syncedEmpty'))}</p>`}
    </div>`;
    app.innerHTML = S.sheet({variant:'page',title:t('syncedTitle'),body,
      footer:S.sheetFooter({back:{action:'back-from-history',label:t('back')}})});
    renderDialog();
  }
  function detailView() {
    const item = records().filter(x => !state.taskScope || x.taskId === state.taskScope).find(x => x.id === state.detail);
    if (!item) { state.detail = ''; listView(); return; }
    const failed = item.status === 'failed', conflict = item.status === 'conflict';
    const reason = failed ? t('reasonFailed') : conflict ? t('reasonConflict') : item.status === 'blocked' ? t(state.deleted ? 'reasonBlockedDeleted' : 'reasonBlocked') : '';
    const facts = S.facts([
      {label:t('work'), value:itemTitle(item)},
      {label:t('status'), value:displayStatus(item.status)},
      {label:t('place'), value:itemPlace(item)},
      {label:t('account'), value:'G. Hansen'},
      {label:t('farm'), value:'Green Valley Farm'},
      {label:t('time'), value:item.at}
    ], {columns:1});
    const alert = reason ? S.banner({tone: conflict || failed ? 'danger' : 'notice', headline: t('reason'), consequence:reason})
      : item.status === 'checking' ? S.banner({tone:'notice',headline:t('syncingSimple'),consequence:t('checkingDetail')}) : '';
    const retryResult = state.retryResult ? S.statusLine([{text:t(failed ? 'retryFailedResult' : 'retryResult')}]) : '';
    const deletion = conflict || (item.status === 'blocked' && state.deleted) ? '<div class="sync-detail-actions">' +
      S.button({label:t('delete'), register:'text', action:'ask-delete'}) + '</div>' : '';
    const receipt = S.statusLine([{text:item.status === 'uploaded' ? `${t('syncedAt')} ${formatSyncedAt(item.syncedAt)}` : `${t('savedAt')} ${item.at}`}]);
    const comparison = conflict ? '<div class="sync-compare">' +
      S.heading({title:t('compare'),kind:'section',level:3}) +
      S.facts([{label:t('phoneValue'),value:t('localChange')},{label:t('serverValue'),value:t('serverChange')}],{columns:1}) +
      S.statusLine([{text:t('safeRetry')}]) + '</div>' : '';
    const body = '<div class="sync-detail">' + receipt + alert + comparison + retryResult + facts + deletion + '</div>';
    const primary = failed || conflict
      ? {label:state.retrying ? t('retrying') : t('retry'), action:'retry', busy:state.retrying} : null;
    app.innerHTML = S.sheet({
      variant:'page', title:t('detail'), body,
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
    studyLabel.textContent = `${variants.indexOf(state.variant)+1}/${variants.length} · ${t('layout' + state.variant[0].toUpperCase() + state.variant.slice(1))}`;
    if (state.detail) detailView(); else if (state.variant === 'tabs' || state.variant === 'chains') listView(); else if (state.historyView) historyView(); else listView();
  }
  function changeVariant(delta) {
    const index = variants.indexOf(state.variant);
    state.variant = variants[(index + delta + variants.length) % variants.length];
    state.category = '';
    state.selectedTask = '';
    state.expandedChains.clear();
    state.taskQuery = '';
    state.statusFilter = 'all';
    const url = new URL(location.href);
    url.searchParams.set('variant', state.variant);
    url.searchParams.delete('task');
    url.searchParams.delete('expand');
    history.replaceState(null,'',url);
    render();
  }
  function setHistoryView(open) {
    state.historyView = open;
    const url = new URL(location.href);
    if (open) url.searchParams.set('view','history');
    else url.searchParams.delete('view');
    history.replaceState(null,'',url);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || S.guard(button)) return;
    const action = button.dataset.action;
    if (action === 'previous-variant' || action === 'next-variant') { changeVariant(action === 'next-variant' ? 1 : -1); return; }
    if (action === 'switch-queue-tab') {
      state.queueTab = button.dataset.value;
      state.statusFilter = 'all'; state.taskQuery = '';
      const url = new URL(location.href);
      url.searchParams.set('tab',state.queueTab);
      history.replaceState(null,'',url);
      render(); return;
    }
    if (action === 'open-task-records' || action === 'back-to-tasks') {
      if (action === 'open-task-records') state.taskIndexScrollTop = app.querySelector('.sheet-body')?.scrollTop || 0;
      state.selectedTask = action === 'open-task-records' ? button.dataset.value : '';
      state.expandedChains.clear();
      state.taskQuery = ''; state.statusFilter = 'all';
      const url = new URL(location.href);
      if (state.selectedTask) url.searchParams.set('task',state.selectedTask);
      else url.searchParams.delete('task');
      url.searchParams.delete('expand');
      history.replaceState(null,'',url);
      render();
      if (action === 'back-to-tasks' && app.querySelector('.sheet-body')) app.querySelector('.sheet-body').scrollTop = state.taskIndexScrollTop;
      return;
    }
    if (action === 'toggle-chain') {
      const scrollTop = app.querySelector('.sheet-body')?.scrollTop || 0;
      if (state.expandedChains.has(button.dataset.value)) state.expandedChains.delete(button.dataset.value);
      else state.expandedChains.add(button.dataset.value);
      render();
      if (app.querySelector('.sheet-body')) app.querySelector('.sheet-body').scrollTop = scrollTop;
      return;
    }
    if (action === 'filter-task-status') {
      state.statusFilter = button.dataset.value;
      if(state.variant==='chains'&&state.selectedTask){
        const first=operationChains(records().filter(item=>taskKey(item)===state.selectedTask))
          .find(entries=>entries.length>1&&entries.some(item=>activeStatuses.includes(item.status)&&
            (state.statusFilter==='all'||displayGroup(item.status)===state.statusFilter)));
        if(first) state.expandedChains.add(first[0].id);
      }
      render(); return;
    }
    if (action === 'open-record') { state.listScrollTop = app.querySelector('.sheet-body')?.scrollTop || 0; state.detail = button.dataset.value; state.retryResult = false; }
    else if (action === 'open-history') setHistoryView(true);
    else if (action === 'back-from-history') setHistoryView(false);
    else if (action === 'open-category') state.category = button.dataset.value;
    else if (action === 'back-to-all') state.category = '';
    else if (action === 'back-to-list') {
      state.detail = '';
      render();
      if ((state.variant === 'tabs' || state.variant === 'chains') && app.querySelector('.sheet-body')) app.querySelector('.sheet-body').scrollTop = state.listScrollTop;
      return;
    }
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
    const url = new URL(location.href);
    url.searchParams.set('scenario', state.scenario);
    url.searchParams.delete('view');
    url.searchParams.delete('task');
    url.searchParams.delete('tab');
    url.searchParams.delete('expand');
    history.replaceState(null,'',url);
    state.groupingMode = null;
    state.detail = ''; state.category = ''; state.dialog = ''; state.switchPromptShown = false;
    state.historyView = false;
    state.queueTab = 'active'; state.selectedTask = ''; state.taskQuery = ''; state.statusFilter = 'all';
    state.expandedChains.clear();
    state.deleted = false; state.deletedDependent = false; state.retrying = false; state.retryResult = false;
    state.receiptResolved = false;
    state.uploadedOne = false;
    render();
    scheduleReceiptResolution();
  });
  languageSelect.addEventListener('change', () => {
    state.lang = languageSelect.value;
    const url = new URL(location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState(null,'',url);
    render();
  });
  document.addEventListener('input', event => {
    if (!event.target.matches('[data-sync-task-search]')) return;
    const caret = event.target.selectionStart;
    state.taskQuery = event.target.value;
    render();
    const input = document.querySelector('[data-sync-task-search]');
    input?.focus();
    input?.setSelectionRange(caret,caret);
  });
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
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        !event.altKey && !event.ctrlKey && !event.metaKey &&
        !event.target.closest('input,select,textarea,[contenteditable="true"]')) {
      changeVariant(event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (event.key !== 'Escape') return;
    if (state.dialog) state.dialog = '';
    else if (state.detail) state.detail = '';
    else if (state.historyView) setHistoryView(false);
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
