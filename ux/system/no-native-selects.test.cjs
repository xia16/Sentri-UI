const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const iconsContext = {};
vm.runInNewContext(read('sentri-icons.js'), iconsContext);
const uiContext = {};
vm.runInNewContext(read('sentri-components.js'), uiContext);
const icons = iconsContext.SentriIcons;
const ui = uiContext.SentriUI;

// The gallery scenario switcher is prototype chrome, not app UI; every other
// native <select> must have been replaced by the shared picker components.
const allowedSelect = /<select class="scenario"/;

for (const file of ['inspection-astra-concept.js', 'farrowing-astra-concept.js']) {
  test(`${file}: app markup contains no native selects`, () => {
    const occurrences = read(file).split('\n').filter(line => line.includes('<select'));
    for (const line of occurrences) assert.match(line, allowedSelect, `unexpected <select> in: ${line.trim()}`);
  });
}

test('icon registry: filter is a funnel, not the chevron fallback', () => {
  const filter = icons.icon('filter');
  assert.match(filter, /M4 5h16l-6 7v6l-4 2v-8z/);
  assert.doesNotMatch(filter, /m9 5 7 7-7 7|M9 5l7 7-7 7/);
  assert.equal(icons.icon('definitely-missing'), icons.icon('chevron'));
});

test('pickerField renders a button trigger with placeholder state, never a select', () => {
  const empty = ui.pickerField({label:'Method', value:'', placeholder:'Choose method', key:'method'});
  assert.match(empty, /<button type="button" class="st-picker-trigger is-placeholder" data-action="open-picker" data-picker-key="method">/);
  assert.match(empty, /Choose method/);
  assert.doesNotMatch(empty, /<select/);
  const chosen = ui.pickerField({label:'Method', value:'Injection', key:'method'});
  assert.match(chosen, /class="st-picker-trigger"/);
  assert.match(chosen, /Injection/);
  assert.doesNotMatch(chosen, /is-placeholder/);
});

test('pickerOptions marks exactly one selected row', () => {
  const result = ui.pickerOptions({options:[['Injection','Injection'],['Oral','Oral'],['Topical','Topical','On the skin']], selected:'Oral'});
  assert.equal((result.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(result, /data-action="picker-select" data-value="Oral"/);
  assert.match(result, /On the skin/);
  assert.equal((result.match(/aria-selected="false"/g) || []).length, 2);
});
