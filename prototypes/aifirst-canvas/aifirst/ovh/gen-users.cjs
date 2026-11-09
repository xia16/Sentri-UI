// Users: the product design of adding people and agents (who's who, setup journey, access profiles, seats, agents, lifecycle). Proposal board.
const fs = require('fs'), path = require('path');
const S = __dirname;
const C = { ink: '#111511', body: '#3B4540', muted: '#5D665F', line: '#E6E9E2', rule: '#EEF0EA', page: '#F3F4F1', green: '#28734F', greenW: '#E3F0E8', blueW: '#EAF1FC', blue: '#3972B7', amberW: '#FCF4E2', amber: '#7A5410' };
const card = (title, sub, inner, o) => { o = o || {}; return '<section style="background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px ' + C.line + '; padding: 24px 28px 22px; ' + (o.span ? 'grid-column: ' + o.span + ';' : '') + '"><div style="display: flex; align-items: baseline; gap: 12px;"><span style="font: 600 13px Geist; color: ' + C.muted + ';">' + (o.n || '') + '</span><h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.015em;">' + title + '</h2></div>' + (sub ? '<p style="margin: 6px 0 16px; font-size: 15px; line-height: 23px; color: ' + C.muted + '; max-width: 1300px;">' + sub + '</p>' : '<div style="height: 14px;"></div>') + inner + '</section>'; };
const table = (cols, head, rows, o) => { o = o || {}; const g = 'display: grid; grid-template-columns: ' + cols + '; gap: 18px;';
  return '<div style="' + g + ' padding: 0 0 8px; font-size: 12.5px; font-weight: 600; color: ' + C.muted + '; border-bottom: 1px solid ' + C.line + ';">' + head.map((h) => '<span>' + h + '</span>').join('') + '</div>' +
    rows.map((r) => '<div style="' + g + ' padding: 11px 0; border-bottom: 1px solid ' + C.rule + '; font-size: 14.5px; line-height: 21px; color: ' + C.body + ';">' + r.map((c, i) => '<span' + (i === 0 ? ' style="color: ' + C.ink + '; font-weight: 600;"' : '') + '>' + c + '</span>').join('') + '</div>').join(''); };
const pill = (t, bg, ink) => '<span style="display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 6px; background: ' + bg + '; color: ' + ink + '; font-size: 12.5px; font-weight: 600; white-space: nowrap;">' + t + '</span>';
const yes = (t) => '<span style="color: ' + C.ink + ';">' + t + '</span>', no = (t) => '<span style="color: #9aa19b;">' + (t || 'No') + '</span>';

// 1 · who's who
const kinds = card('Who&rsquo;s who', 'Five kinds of people and one kind of agent. The kind sets the starting access profile and the seat; nothing else.', table('210px 230px 1fr 1fr 1fr', ['Kind', 'Uses', 'Seat (prices are placeholders)', 'Added by', 'Example'], [
  ['Owner (admin)', 'Console and phone', 'In the platform fee', 'Creates the farm at sign-up; can make a manager an admin too', 'Adam'],
  ['Manager', 'Console and phone', 'Console seat, a small monthly fee', 'An admin', 'Li Wei, Zhao Min, Wang Fang'],
  ['Worker', 'Phone', 'Billed by active day (a day they record anything)', 'An admin, or the manager of their team', 'Liu Yang, Sun Qing, Ma Lin, Gao Feng'],
  ['Temp', 'Phone', 'Billed by active day; ends on a set date', 'An admin, or the manager of their team', 'Harvest help for two weeks'],
  ['Vet or advisor', 'Console or phone, their area only', 'Open: a console seat, or free while they only read and approve', 'An admin', 'Dr. Chen'],
  ['Agent', 'Works in the background, talks in chat', 'General Manager included; others each have a monthly budget', 'An admin only', 'Vet, Production, Biosecurity, Equipment']
]) + '<div style="margin-top: 12px; font-size: 14px; line-height: 21px; color: ' + C.muted + ';">Visitors and contractors are not users: they stay on People &rsaquo; Coming, approved by whoever Who decides names.</div>', { n: '1' });

// 2 · the journey, two lanes
const step = (n, t, s, tone) => '<div style="flex: 1; min-width: 0; border-radius: 12px; padding: 14px 16px; background: ' + (tone === 'phone' ? C.blueW : tone === 'done' ? C.greenW : '#F6F7F3') + ';"><div style="font-size: 12px; font-weight: 600; color: ' + (tone === 'phone' ? C.blue : tone === 'done' ? C.green : C.muted) + ';">' + n + '</div><div style="font-size: 15px; font-weight: 600; margin-top: 3px;">' + t + '</div><div style="font-size: 13.5px; line-height: 20px; color: ' + C.body + '; margin-top: 4px;">' + s + '</div></div>';
const arrow = '<div style="flex: none; width: 22px; display: grid; place-items: center; color: #9aa19b; font-size: 18px;">&rarr;</div>';
const lane = (label, steps) => '<div style="display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: stretch; margin-bottom: 14px;"><div style="font-size: 13px; font-weight: 600; color: ' + C.muted + '; padding-top: 14px;">' + label + '</div><div style="display: flex; gap: 0; align-items: stretch;">' + steps.map((x, i) => (i ? (x && steps[i - 1] ? arrow : '<div style="flex: none; width: 22px;"></div>') : '') + (x || '<div style="flex: 1;"></div>')).join('') + '</div></div>';
const journey = card('The setup journey: an admin adds, the person fills in what they do', 'About a minute in the console, then two short screens on the person&rsquo;s phone. Nobody fills in a form for someone else beyond their name, kind and rooms.',
  lane('Console', [step('1 · Admin or manager', 'Add a person', 'Name, phone, kind, rooms. Access comes from the kind; the cost of their seat shows before sending.'), step('2', 'Invite goes out', 'A text or WeChat link, good for 7 days. They show on People as Invited; no seat yet.'), null, null, null, step('7', 'They&rsquo;re in', 'Active on People; the seat starts on this first sign-in. The Work schedule plans them from tomorrow.', 'done')]) +
  lane('Their phone', [null, null, step('3 · The person', 'Open the link, sign in', 'A code by text. Name and farm already there.', 'phone'), step('4', 'What I do', 'Rooms, the jobs I can do, my usual hours. Filled in from the invite; confirm or change.', 'phone'), step('5', 'What I can access', 'Their access profile in plain words, read-only. &ldquo;Ask for more&rdquo; sends the admin an Approve.', 'phone'), step('6', 'First day', 'My day shows their jobs; the walk and the to-do list work as before.', 'phone')]) +
  '<div style="display: flex; gap: 24px; margin-top: 8px; font-size: 14px; line-height: 21px; color: ' + C.muted + ';"><span><b style="color: ' + C.ink + ';">Whole team at once:</b> farm set-up imports the old system&rsquo;s staff list and sends every invite in one go; each person still does 3 to 5.</span><span><b style="color: ' + C.ink + ';">Later:</b> &ldquo;What I do&rdquo; stays theirs to change; Sentri suggests from their records, a manager can correct.</span></div>', { n: '2', span: '1 / -1' });

// 3 · access profiles
const access = card('Access profiles: one preset per kind, exceptions written under it', 'The person sees their own profile in plain words. Pages hide what someone can&rsquo;t do (principles &sect;10); they never show a lock. Only an admin changes a profile; a manager can give up to Worker inside their team.',
  table('230px repeat(5, 1fr)', ['', 'Admin (owner)', 'Manager', 'Worker', 'Temp', 'Vet or advisor'], [
    ['Console', yes('Yes'), yes('Yes'), no('Phone only'), no('Phone only'), yes('Yes, their area')],
    ['Sees', yes('Whole farm'), yes('Whole farm'), yes('Their rooms'), yes('Their rooms'), yes('Health, farm-wide')],
    ['Plans and directions', yes('Everything'), yes('Their team&rsquo;s moves and work schedule'), no(), no(), yes('Treatments, vaccination plans')],
    ['Prescriptions', no('No'), no('No'), no(), no(), yes('Issues them')],
    ['Records on the floor', yes('Yes'), yes('Yes'), yes('Yes'), yes('Yes'), yes('When on the farm')],
    ['People and access', yes('Adds anyone, sets access'), yes('Adds workers and temps to their team'), no(), no(), no()],
    ['Agents and billing', yes('Hires agents, sets budgets, sees the bill'), yes('Sees what agents did'), no(), no(), no()]
  ]) + '<div style="display: flex; gap: 10px; align-items: center; margin-top: 14px; font-size: 14px; color: ' + C.body + ';">' + pill('Exception', C.amberW, C.amber) + 'Written under the preset on the person&rsquo;s profile, e.g. &ldquo;Li Wei can also stop a treatment&rdquo;. If a farm needs many exceptions, the preset is wrong, not the person.</div>', { n: '3' });

// 4 · who fills what
const fills = card('Who fills in what', 'The admin sets what the farm decides (access, seat); the person says what they do. Each fact has one home.', table('260px 1fr 1fr', ['Field', 'Filled in by', 'Then'], [
  ['Name, phone, kind', 'Admin or manager, when adding', 'The person can fix their name'],
  ['Access profile', 'Comes from the kind; admin changes it', 'The person sees it, can ask for more'],
  ['Rooms they work in', 'Adding person suggests, the person confirms', 'Sentri suggests from records; a manager can correct'],
  ['Jobs they can do', 'The person, on first sign-in', 'Same; the Work schedule plans only with these'],
  ['Usual hours', 'The farm&rsquo;s working week by default', 'The person or a manager changes theirs'],
  ['What they decide', 'Who decides (the sentences), by an admin', 'Shown on their profile, never stored there']
]), { n: '4' });

// 5 · seats and the bill
const seats = card('Seats and the bill', 'Small to start, priced by use. The admin sees the cost before adding anyone, and the monthly agent report is the bill.',
  table('260px 1fr', ['What', 'How it&rsquo;s counted'], [
    ['Platform', 'A small monthly fee; includes the owner&rsquo;s seat and the General Manager agent'],
    ['Console seat', 'Per manager or admin, monthly; starts on first sign-in, ends when they leave'],
    ['Phone worker or temp', 'Per active day: a day with at least one record. A temp stops on their end date'],
    ['Specialist agent', 'Its own monthly budget: a protected watch part (fixed) and a capped explore part'],
    ['AI proposals', 'Charged only when the farm adopts one; anything a fixed rule can do is a free notification']
  ]) + '<div style="margin-top: 14px; padding: 12px 14px; border-radius: 10px; background: #F6F7F3; font-size: 14px; line-height: 21px; color: ' + C.body + ';"><b style="color: ' + C.ink + ';">When adding someone:</b> one line under the form, e.g. &ldquo;Phone, billed by active day: about $X this month at 22 days.&rdquo; <b style="color: ' + C.ink + ';">Billing page (admin only):</b> this month so far by line, the agents&rsquo; budgets used, adopted proposals. Metering runs in shadow mode before anyone is charged.</div>', { n: '5' });

// 6 · agents
const agents = card('Agents: only an admin hires them', 'Everyone sees the team of agents and what they did; only an admin adds, removes or sets a budget. Others get &ldquo;Ask Adam to add an agent&rdquo;.',
  '<div style="display: flex; gap: 0; align-items: stretch;">' + [step('1', 'Pick a specialist', 'Vet, Production, Biosecurity, Equipment. The General Manager is always there.'), step('2', 'What it watches', 'Its default watch list for this farm, editable.'), step('3', 'Monthly budget', 'Watch (protected, fixed) + explore (capped). At the cap explore stops, watch keeps going; one Inbox note before.'), step('4', 'Who it answers to', 'From Who decides; its own access profile: reads farm data, acts only by drafts, never prescribes.', 'done')].join(arrow) + '</div>', { n: '6', span: '1 / -1' });

// 7 · lifecycle
const st8 = (t, s, bg, ink) => '<div style="flex: 1; min-width: 0;"><div>' + pill(t, bg, ink) + '</div><div style="font-size: 13.5px; line-height: 20px; color: ' + C.body + '; margin-top: 8px;">' + s + '</div></div>';
const life = card('A person&rsquo;s states', 'What People shows, and what each state does to the seat.', '<div style="display: flex; gap: 14px; align-items: flex-start;">' + [
  st8('Invited', 'Link sent, 7 days. Resend or cancel. No seat.', '#F1F1EE', C.ink), st8('Active', 'Signed in. Seat running. Planned by the Work schedule.', C.greenW, C.green), st8('Temp, ends Fri 20 Nov', 'Stops by itself on the date; extend in one tap.', C.blueW, C.blue),
  st8('Left the farm', 'Seat stops; record stays; can come back.', '#F1F1EE', C.muted), st8('Ended', 'No longer staff; history stays.', '#F1F1EE', C.muted), st8('Deleted', 'Only for someone added by mistake; past records keep the name.', '#FBECEA', '#B34B43')].join('<div style="flex: none; padding-top: 2px; color: #9aa19b;">&rarr;</div>') + '</div>', { n: '7' });

// 8 · open
const open = card('Yours to decide', null, '<ol style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 24px; color: ' + C.body + ';">' + [
  'Vets and advisors: a paid console seat, or free while they only read and approve their own items?',
  'Can a manager add workers and temps to their team without an admin? My call: yes; it shows on the bill and on People.',
  'An active day: any record, or just signing in? My call: any record.',
  'Where the agents live in the console: a section on People next to the people, or under Farm settings? My call: People, so the team is one list.',
  'Can a person change their own rooms and jobs after set-up? My call: yes, and a manager sees the change; access stays the admin&rsquo;s.'].map((x) => '<li style="margin-bottom: 6px;">' + x + '</li>').join('') + '</ol><div style="margin-top: 10px; font-size: 14px; color: ' + C.muted + ';">Next, once these are settled: the screens. People (list with seats), Add a person, the two phone set-up screens, an access profile, Hire an agent, Billing.</div>', { n: '8' });

const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Users</title>\n<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&display=swap" rel="stylesheet">\n<style>body{margin:0}</style>\n</helmet>\n' +
  '<div style="width: 3008px; padding: 44px 48px 60px; box-sizing: border-box; background: ' + C.page + '; font-family: Geist, system-ui, sans-serif; color: ' + C.ink + '; -webkit-font-smoothing: antialiased;">' +
  '<h1 style="margin: 0; font-size: 30px; line-height: 38px; font-weight: 600; letter-spacing: -.025em;">Users: adding people and agents, their access and their seats (product design, before screens)</h1>' +
  '<p style="margin: 8px 0 32px; font-size: 16px; line-height: 24px; color: ' + C.muted + '; max-width: 2200px;">An admin adds a person with a name, a kind and rooms; the person fills in what they do on their phone. The kind sets the access profile and the seat. Only an admin hires agents and sets their budgets. Prices follow the business model and are placeholders until the April 2027 pilot.</p>' +
  '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px;">' + kinds + fills + journey + access + seats + agents + life + open + '</div></div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":3008,"height":2270}}\'>\nclass Component extends DCLogic {\n  renderVals() { return {}; }\n}\n</script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(S, 'pub/project/UsersDesign.dc.html'), html);
console.log('board', Math.round(html.length / 1024) + ' KB');
