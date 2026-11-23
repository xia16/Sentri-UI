const ui = window.SentriUI;
const icon = SentriIcons.icon;
const phone = document.querySelector('.phone');
const params = new URLSearchParams(location.search);
const listFirst = params.get('option') === 'b';
const outside = params.has('outside');
const rooms = [
  { id: '7', name: 'Unit 7', section: '妊娠舍', lanes: ['A', 'B', 'C', 'D'], depth: 50 },
  { id: '8', name: 'Unit 8', section: '保育舍', lanes: ['A', 'B', 'C'], depth: 5 }
];
let selectedRoom = rooms[0];
let destination = outside ? 'C12' : '';
let query = '';
let view = listFirst && !outside ? 'search' : 'review';
let pickerParent = view;
let roomParent = view;
let targetBeforeEdit = null;
let mapOpen = false;
let message = '';

const status = () => '<div class="statusbar"><span>9:41</span><span class="status-icons">' +
  icon('signal') + icon('battery') + '</span></div>';
const back = action => ({ action, label: '返回' });
const page = (title, body, { above = '', footer = false } = {}) =>
  ui.sheet({ variant: 'page', title, above, body, bar: status(), back: back('back'), footer, inert: mapOpen });
const group = (...rows) => ui.rowGroup(rows.join(''));
const section = (title, content) => '<section class="mock-section">' +
  ui.heading({ title, kind: 'section', level: 3 }) + content + '</section>';
const nav = props => ui.row({ ...props, variant: 'navigation', wrap: true });
const roomRow = () => nav({
  title: selectedRoom.name, description: selectedRoom.section, icon: icon('grid'), action: 'rooms'
});
const targetRow = () => nav({
  title: destination ? selectedRoom.name + ' · ' + destination : '选择目标栏',
  description: destination ? '目标栏' : '目标房间 · ' + selectedRoom.name,
  action: listFirst ? 'search' : 'map'
});
const commit = () => ({ label: '确认转舍', action: 'confirm', waiting: !destination });
const codes = () => Array.from({ length: selectedRoom.depth }, (_, index) =>
  selectedRoom.lanes.map(lane => lane + (index + 1))).flat();
function unavailable(code) {
  if (selectedRoom.id !== '7') return '';
  if (!outside && ['C1', 'D4'].includes(code)) return '来源栏';
  return code === 'C5' ? '栏位已满' : '';
}

function review() {
  if (outside) {
    const origins = group(
      ui.row({ title: 'Unit 6 · A2', description: '来源栏', variant: 'plain' }),
      targetRow()
    );
    // The real Scan page is replaced here by the same shared rows and header so the proposed review can be walked.
    const scan = ui.sheet({
      variant: 'page', bar: status(), title: '扫描耳标', back: back('back'), inert: true,
      body: section('Unit 7', group(ui.row({ code: '000267', description: 'C1', variant: 'animal' }),
        ui.row({ code: '000306', description: 'C2', variant: 'animal' }))),
      footer: ui.sheetFooter({ back: false, primary: { label: '操作', action: 'back' } })
    });
    const background = '<div class="page-background" inert aria-hidden="true">' + scan + '</div>';
    if (mapOpen) return background;
    return background + ui.sheet({
      surface: 'menu', title: '核对转舍', line: { text: [{ text: '000430', mono: true }] },
      body: origins,
      footer: ui.sheetFooter({ back: back('back'), primary: commit() })
    });
  }
  const pigs = section('转舍对象 · 6 头', group(
    ui.row({ title: 'Unit 7 · C1', description: '耳号 000254', variant: 'plain' }),
    ui.row({ title: 'Unit 7 · D4', description: '无身份猪 5 头', variant: 'plain' })
  ));
  const pick = listFirst ? group(targetRow()) : group(roomRow(), nav({
    title: destination || '选择目标栏',
    description: destination ? '目标栏' : '查看栏位图',
    action: 'map'
  }), nav({ title: '按栏号查找', icon: icon('search'), action: 'search' }));
  const warning = ui.banner({
    tone: 'notice', headline: '清空 D4 无身份猪病症',
    consequence: '有无身份猪转出后，D4 所有无身份猪的当前疾病和症状会清空。'
  });
  return page('核对转舍', pigs + '<div class="mock-facts">' + section('目标位置', pick) + '</div>' + warning, {
    footer: ui.sheetFooter({ back: false, primary: commit() })
  });
}

function penResults() {
  const matches = codes().filter(code => code.toLowerCase().includes(query.trim().toLowerCase()));
  return matches.length ? group(...matches.map(code => {
    const reason = unavailable(code);
    return nav({
      title: code, mono: true, description: reason, action: 'pen', value: code,
      disabled: Boolean(reason), reason, attrs: destination === code ? { 'aria-current': 'true' } : {}
    });
  })) : ui.choiceEmpty('试试其他栏号。', { title: '没有匹配的栏位', icon: 'search' });
}

function findPen() {
  const map = nav({ title: '打开栏位图', icon: icon('grid'), action: 'map' });
  const search = ui.choiceSearch({
    label: '搜索栏号', placeholder: '例如 C12', value: query, attrs: { 'data-mock-search': '' },
    clear: { action: 'clear-search' }
  });
  const tools = '<div class="mock-stack mock-tools">' + (outside
    ? ui.statusLine([selectedRoom.name]) + group(map)
    : group(roomRow(), map)) + search + '</div>';
  return page('选择目标栏', '<div data-mock-results>' + penResults() + '</div>', { above: tools });
}

function roomList() {
  return page('选择房间', rooms.map(room => section(room.section, group(nav({
    title: room.name, description: room.lanes.length * room.depth + ' 个栏',
    action: 'room', value: room.id, icon: icon('grid')
  })))).join(''));
}

function penMapSheet() {
  const { lanes, depth } = selectedRoom;
  const pens = Object.fromEntries(codes().map(code => [code, 'plain']));
  const disabled = Object.fromEntries(codes().flatMap(code => {
    const reason = unavailable(code);
    return reason ? [[code, reason]] : [];
  }));
  const body = ui.penMap({
    lanes, depth, pens, disabled, selected: destination, current: destination, action: 'pen',
    key: 'move-pen-map', entrance: '入口',
    labels: { map: '栏位图', plain: '', whole: '整栋', byPen: '逐栏', pens: range => range + ' 栏' }
  });
  return ui.sheet({
    surface: 'menu', size: 'long', sizing: 'full', title: '选择目标栏',
    line: { text: selectedRoom.name }, body, layer: outside && view === 'review' ? 0 : 1,
    scrim: { action: 'close-map', label: '返回' }, footer: ui.penMapFooter({ back: back('close-map') })
  });
}

function render() {
  const content = view === 'search' ? findPen() : view === 'rooms' ? roomList() : review();
  phone.style.removeProperty('--toast-bottom');
  phone.innerHTML = content + (mapOpen ? penMapSheet() : '') +
    (message ? ui.toast(message, { tone: 'notice' }) : '');
  const drawer = phone.querySelector('.sheet[role="dialog"]');
  if (message && drawer) {
    const bottom = phone.getBoundingClientRect().bottom - drawer.getBoundingClientRect().top;
    const gap = getComputedStyle(phone).getPropertyValue('--space-12');
    phone.style.setProperty('--toast-bottom', 'calc(' + bottom + 'px + ' + gap + ')');
  }
}

phone.addEventListener('input', event => {
  if (!event.target.matches('[data-mock-search]')) return;
  query = event.target.value;
  phone.querySelector('[data-mock-results]').innerHTML = penResults();
});

phone.addEventListener('click', event => {
  if (event.target.closest('.st-pen-whole-toggle, .st-pen-group')) return;
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action, value } = button.dataset;
  message = '';
  switch (action) {
    case 'map': mapOpen = true; break;
    case 'close-map': mapOpen = false; break;
    case 'search':
      pickerParent = view;
      targetBeforeEdit = { room: selectedRoom, pen: destination, query };
      view = 'search';
      break;
    case 'clear-search': query = ''; break;
    case 'rooms': roomParent = view; view = 'rooms'; break;
    case 'room':
      if (value !== selectedRoom.id) {
        selectedRoom = rooms.find(room => room.id === value);
        destination = '';
        query = '';
      }
      view = roomParent;
      break;
    case 'pen':
      if (!codes().includes(value) || unavailable(value)) return;
      destination = value;
      mapOpen = false;
      targetBeforeEdit = null;
      view = 'review';
      break;
    case 'confirm':
      if (destination) message = '目标栏已满';
      break;
    case 'back':
      if (view === 'search' && targetBeforeEdit) {
        selectedRoom = targetBeforeEdit.room;
        destination = targetBeforeEdit.pen;
        query = targetBeforeEdit.query;
        targetBeforeEdit = null;
      }
      view = view === 'rooms' ? roomParent : view === 'search' ? pickerParent : listFirst ? 'search' : 'review';
      break;
    default: return;
  }
  render();
});

render();
