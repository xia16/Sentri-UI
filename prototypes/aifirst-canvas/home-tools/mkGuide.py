import sys, html
out = sys.argv[1]
H = int(sys.argv[2]) if len(sys.argv) > 2 else 2400

def e(t):
    return html.escape(t, quote=False)

def sec(title, body, span=1):
    return (f'<section style="grid-column: span {span}; min-width: 0; padding: 22px 24px 24px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 0 0 1px #E6E9E2">'
            f'<h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em">{e(title)}</h2>{body}</section>')

def p(t):
    return f'<p style="margin: 0 0 10px; font-size: 14px; line-height: 21px; color: #3B4540">{t}</p>'

def ul(items):
    li = ''.join(f'<li style="margin: 0 0 6px; padding-left: 2px">{t}</li>' for t in items)
    return f'<ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 21px; color: #3B4540">{li}</ul>'

def table(head, rows, cols):
    th = ''.join(f'<span style="font-size: 12px; font-weight: 600; color: #5D665F">{e(h)}</span>' for h in head)
    body = ''
    for r in rows:
        body += f'<span style="display: contents">' + ''.join(f'<span style="padding: 8px 0; border-top: 1px solid #F0F1EC; font-size: 13.5px; line-height: 19px; color: #1B211C">{c}</span>' for c in r) + '</span>'
    return f'<div style="display: grid; grid-template-columns: {cols}; column-gap: 18px; row-gap: 0">{th}{body}</div>'

def sw(col, name, use):
    return (f'<span style="display: flex; align-items: center; gap: 10px; font-size: 13px; line-height: 18px"><span style="width: 22px; height: 22px; flex: none; border-radius: 6px; background: {col}; box-shadow: inset 0 0 0 1px rgba(17,21,17,.08)"></span>'
            f'<span style="display: flex; flex-direction: column"><span style="font-weight: 600">{e(name)} <span style="font-weight: 400; color: #8A938C">{col}</span></span><span style="color: #5D665F">{e(use)}</span></span></span>')

b = lambda t: f'<b style="font-weight: 600; color: #1B211C">{t}</b>'

DATA_TIP = '''<span style="display: inline-flex; flex-direction: column; gap: 6px; min-width: 190px; padding: 7px 10px 8px; border-radius: 8px; border: 1px solid #E6E9E2; background: #FFFFFF; box-shadow: 0 20px 25px -5px rgba(17,21,17,.10), 0 8px 10px -6px rgba(17,21,17,.10); font-size: 12px; line-height: 16px">
<span style="font-weight: 500">Born alive a litter · goal 13.5</span>
<span style="display: flex; align-items: center; gap: 8px"><span style="width: 10px; height: 10px; border-radius: 2px; background: #F0C273"></span><span style="color: #5D665F">W45</span><span style="margin-left: auto; font-weight: 500; font-variant-numeric: tabular-nums">13.0</span></span>
<span style="display: flex; align-items: center; gap: 8px"><span style="width: 10px; height: 10px; border-radius: 2px; background: #C98A1F"></span><span style="color: #5D665F">W46</span><span style="margin-left: auto; font-weight: 500; font-variant-numeric: tabular-nums">13.1</span></span>
<span style="padding-top: 6px; border-top: 1px solid #F0F1EC; font-weight: 500; color: #8A5A12">Under goal since W38</span></span>'''
LABEL_TIP = '<span style="display: inline-flex; font-size: 11.5px; font-weight: 600; line-height: 20px; padding: 0 7px; border-radius: 6px; background: #1E2A22; color: #FFFFFF">W41 · 28.7</span>'

secs = []
secs.append(sec('What Home is for', p('Home shows the farm as it is now, against plan. The daily report explains what changed (board <i>Home and the daily report</i>). Actions are asked for in the chat, never started from Home.') +
    p('Home sits in the right pane beside the chat. It is read in a few seconds, so every part answers one question and nothing is said twice. When something already shows on another Home card, it is left off this one: the broken fan is in Decide, so it is not on the Farm card.')))
secs.append(sec('Top to bottom', table(['Part', 'What it answers', 'Rule'], [
    [b('Decide'), 'What needs me?', 'One decision at a time, a new one every 10 s; the count is all waiting, amber marks due today. Click opens it.'],
    [b('Day plan'), 'Who works today?', 'Jobs and people today. Opens the Work schedule.'],
    [b('Task schedule, Initiatives'), 'How much is planned?', 'A count each; they open as tabs.'],
    [b('Area tabs'), 'Which part of the farm?', 'Production, Health, Farm; one open at a time.'],
    [b('Dashboard card'), 'Is it on goal?', 'One card per area, built the same way (below).'],
    [b('Feature list'), 'Where do I go?', 'The area’s doors; Farm groups them as Running the farm and Setup.']], '170px 170px minmax(0, 1fr)')))
secs.append(sec('The dashboard card', p('Every area’s card is built from the same parts, in this order. A part with nothing to say is left out.') + ul([
    b('Header') + ': the line filter (Production, when the farm has more than one line) or the period (This week, November). › opens the area’s full dashboard.',
    b('Headline') + ': one number and a short unit (28.6 PSY, 212 sold this week). It turns amber when it is off goal.',
    b('Trend') + ': 26 weeks as a line with a dashed goal; the goal’s value sits in the right gutter. No axis labels.',
    b('Figures') + ': up to four. Each is a label, this week’s value and six weeks as bars. A dashed line marks the goal; bars on goal are green, off goal amber, grey when there is no goal.',
    b('List') + ': one line a row: the batch, a bar for how far along it is, where it goes and a count. Amber when short or over goal.']) +
    p('<span style="color: #8A5A12; font-weight: 600">Never on the card:</span> a title (the tab says it), captions, axis labels, legends (the spend key is the one exception), goal text, dates, a second line on a row, a status chip next to a coloured number.'), 2))
secs.append(sec('What hover holds', p('The card shows the shape; hover gives the words. Everything that was cut from the card lives here, so nothing is lost.') + table(['Hover on', 'Shows'], [
    ['Headline number', 'Full name, goal, 26 weeks ago, the gap (amber row)'],
    ['Trend', 'A crosshair with that week’s value'],
    ['A figure', 'Full name and goal, then each of the six weeks with its bar colour, then any note'],
    ['A list row', 'The route (Heat check → Breeding → Gestation), counts, the line, any warning'],
    ['Spend bar', 'Each category with its colour'],
    ['Line in the filter menu', 'Its type, under its name']], '200px minmax(0, 1fr)')))
secs.append(sec('Tooltips', p(b('Data tooltip') + ' (anything with numbers), as shadcn’s chart tooltip: white, 1px border #E6E9E2, 8px corners, large soft shadow, 12px text. Title in medium weight; each row a colour square (the bar’s or category’s colour), the name in grey, the value right-aligned with fixed-width digits. A warning is the last row, amber, under a hairline.') +
    f'<div style="margin: 4px 0 14px">{DATA_TIP}</div>' +
    p(b('Label tooltip') + ' (one short line), as shadcn’s plain tooltip: dark #1E2A22, white text. Used for the trend’s crosshair value.') + f'<div>{LABEL_TIP}</div>'))
secs.append(sec('Production lines', ul([
    'A farm can run several lines (two sow lines and a finishing line in one farm). Lines are not farms: farms switch at the top left.',
    b('Together by default') + ': All lines. Lines of the same type add up, weighted by size (PSY 29.2 from 28.6 and 30.4). Mixed lines show what the farm is: sow lines feeding a finishing line make farrow to finish, so the card shows PSY, the sow figures and every batch moving.',
    b('The filter') + ' sits in the header as “All lines” with a small arrow; picking one narrows the card to that line. A farm with one line never sees it.',
    'A batch’s line is in its hover, not on the row.',
    b('Figures follow the stages') + ': sow lines show PSY, farrowing rate, born alive, stillborn and deaths before weaning, then Moving this week. A finishing line shows pigs sold a week, nursery and finishing deaths, days on site and sale weight, then Open batches.'])))
secs.append(sec('Each area', table(['Area', 'Headline', 'Figures', 'List'], [
    [b('Production · sow'), 'PSY against 30', 'Farrowing rate, Born alive, Stillborn, Pre-wean deaths', 'Moving this week'],
    [b('Production · finishing'), 'Pigs sold a week against plan', 'Nursery deaths, Finishing deaths, Days on site, Sale weight', 'Open batches'],
    [b('Health'), '% died this week against 1.0 %', 'Tagged, On treatment, In withdrawal', '—'],
    [b('Farm'), 'Spend this month against pace', 'Cost per kg, Feed a day, Feed vs plan', '—']], '170px 190px minmax(0, 1fr) 130px'), 2))
secs.append(sec('Colour', '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px">' + ''.join([
    sw('#F6F7F1', 'Tint', 'pane background'), sw('#FFFFFF', 'Card', 'every card, on the tint'), sw('#E6E9E2', 'Ring', 'card and tooltip edge'), sw('#1B211C', 'Ink', 'numbers, names'),
    sw('#5D665F', 'Muted', 'labels, units'), sw('#8A938C', 'Soft', 'goal values'), sw('#1F5C3F', 'Green', 'trend line, this week on goal'), sw('#9CCBB0', 'Green, light', 'past weeks on goal'),
    sw('#C98A1F', 'Amber', 'this week off goal, short bars'), sw('#F0C273', 'Amber, light', 'past weeks off goal'), sw('#8A5A12', 'Amber ink', 'numbers and words off goal'), sw('#D5DAD3', 'Grey', 'bars with no goal')]) + '</div>' +
    p('<span style="display: block; margin-top: 14px">Colour only where it means something: green on goal, amber off goal. One status colour per row.</span>')))
secs.append(sec('Type and size', table(['Use', 'Size', 'Weight'], [
    ['Headline number', '30px', '600'], ['Figure value', '17px', '600'], ['Row count', '13.5px', '600'], ['Row text, menu items', '12.5–13px', '400–500'],
    ['Figure label, tooltip text', '11.5–12px', '400'], ['Smallest text (goal value, units)', '11px', '400']], 'minmax(0, 1fr) 90px 70px') +
    p('<span style="display: block; margin-top: 12px">Geist throughout; numbers use fixed-width digits. Cards have 16px corners and 14px side padding; menus and tooltips 8–10px corners.</span>')))
secs.append(sec('Still open', ul([
    'A quiet week: farms that batch every 2–4 weeks will have weeks with nothing moving.',
    'The daily report’s format.',
    'Health and Farm cards follow the same parts but have not been reviewed on their own.',
    'The Work schedule: rooms given to people, read by task (board on the Work schedule page).'])))

secs = secs[:6] + [secs[9]] + secs[6:9]
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Home UI guide</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&amp;display=swap" rel="stylesheet">
<style>body{{margin:0}}</style>
</helmet>
<div id="guide" style="width: 1400px; min-height: {H}px; box-sizing: border-box; padding: 48px; background: #F3F4F1; font-family: 'Geist', system-ui, sans-serif; color: #1B211C; -webkit-font-smoothing: antialiased">
  <h1 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.02em">Home UI guide</h1>
  <p style="margin: 8px 0 28px; font-size: 14px; line-height: 21px; color: #5D665F; max-width: 1000px">How Home is built and why, in one place. 10 Nov. It describes the mock-ups on this page (Home G beside the chat); rulings the owner has made are written as rules, the rest is listed under Still open.</p>
  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start">
    {''.join(secs)}
  </div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1400,"height":{H}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
open(out, 'w', encoding='utf-8').write(page)
print('ok')
