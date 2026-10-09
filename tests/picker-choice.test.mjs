import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("../ux/design-system/components/bundle.js");
const UI = globalThis.SentriUI;
const tree = [
  {
    value: "disease",
    label: "Diseases",
    children: [
      {
        value: "resp",
        label: "Respiratory",
        children: [{ value: "flu", label: "Influenza", aliases: ["pig flu"] }],
      },
    ],
  },
  {
    value: "symptom",
    label: "Symptoms",
    children: [
      {
        value: "general",
        label: "General appearance",
        children: [
          { value: "fever", label: "Fever" },
          { value: "weak", label: "Weakness" },
        ],
      },
    ],
  },
];
test("cascade-multi: ticks remain in the leaf catalogue; checkbox changes never navigate", () => {
  const html = UI.pickerBody({
    variant: "cascade-multi",
    items: tree,
    path: ["symptom", "general"],
    selected: ["fever"],
  });
  assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
  assert.equal((html.match(/ checked/g) || []).length, 1);
  assert.doesNotMatch(html, /<details|type="checkbox"[^>]*data-action/);
  assert.match(html, /data-action="picker-step" data-value="1"/);
  assert.match(html, /Weakness/);
});
test("search spans kinds, groups and aliases while another branch is open", () => {
  const html = UI.pickerBody({
    variant: "cascade-multi",
    items: tree,
    path: ["symptom", "general"],
    query: "pig flu",
    selected: ["fever"],
  });
  assert.match(html, /Influenza/);
  assert.match(html, /Diseases \/ Respiratory/);
  assert.doesNotMatch(html, /No options match/);
});
test("descendant counts persist across branches, with one exit pair", () => {
  const html = UI.pickerBody({
    variant: "cascade-multi",
    items: tree,
    selected: ["fever", "flu"],
  });
  assert.equal((html.match(/>1 selected</g) || []).length, 2);
  const footer = UI.pickerFooter({ multi: true, selected: ["fever", "flu"] });
  assert.equal((footer.match(/<button/g) || []).length, 2);
  assert.match(footer, /Done · 2/);
  assert.doesNotMatch(footer, /close|dismiss/);
});
test("trigger uses count or complete path, preserves labels and describes errors", () => {
  const multi = UI.pickerField({
    label: "Conditions",
    variant: "multi",
    selected: ["fever", "flu"],
    display: "Fever, Influenza",
  });
  assert.match(multi, /2 selected/);
  assert.doesNotMatch(multi, /Fever, Influenza/);
  const single = UI.pickerField({
    label: "Medicine",
    variant: "cascade",
    path: ["Antibiotics", "Amoxicillin"],
    error: "Select an available medicine.",
  });
  assert.match(single, /Antibiotics \/ Amoxicillin/);
  assert.match(single, /aria-invalid="true"/);
  assert.match(single, /aria-describedby/);
});
test("disabled rows retain reasons and selected custom leaves expose a separate removal action", () => {
  const html = UI.pickerBody({
    variant: "multi",
    items: [
      {
        value: "custom",
        label: "New condition",
        disabled: true,
        reason: "Unavailable offline",
        secondaryAction: { label: "Remove custom condition", action: "remove" },
      },
    ],
    selected: ["custom"],
  });
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /Unavailable offline/);
  assert.match(html, /data-action="remove"/);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 1);
});
test("compatibility adapter uses the shared single row; loading and empty have a status", () => {
  const html = UI.pickerOptions({
    options: [["a", "Amoxicillin"]],
    selected: "a",
  });
  assert.match(html, /data-ds="ChoiceList"/);
  assert.match(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /st-picker-option|role="option"/);
  assert.match(UI.pickerOptions({ options: [] }), /role="status"/);
  assert.match(UI.pickerBody({ loading: true }), /Loading options/);
});

test("flat multi keeps section headings without navigating levels", () => {
  const html = UI.pickerBody({
    variant: "multi",
    items: [
      { value: "a", label: "Fever", group: "Symptoms" },
      { value: "b", label: "Influenza", group: "Diseases" },
    ],
  });
  assert.match(html, /aria-label="Symptoms"/);
  assert.match(html, /aria-label="Diseases"/);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
  assert.doesNotMatch(html, /Chosen levels/);
});

require("../ux/system/astra-surfaces.js");
require("../ux/system/farrowing-astra-concept.js");
require("../ux/system/inspection-astra-concept.js");
test("migrated assistance choices preserve missing versus No in the record and edit draft", () => {
  const F = globalThis.FarrowingStudy,
    s = F.seed("before");
  F.act(s, "assistance", "false");
  assert.equal(s.assisted, false);
  F.act(s, "assistance-clear", "assistance");
  assert.equal(s.assisted, null);
  s.edit = { ...s };
  F.act(s, "editAssistance", "true");
  assert.equal(s.edit.assisted, true);
  assert.equal(s.assisted, null);
  F.act(s, "editAssistance-clear", "editAssistance");
  assert.equal(s.edit.assisted, null);
});
test("browsing a disease branch retains its kind when adding a custom condition", () => {
  const M = globalThis.InspectionStudy,
    c = M.seed();
  M.openBulkAction(c, "health", ["000267"]);
  c.view = "bulk-health-picker";
  const group = M.catalog.find((n) => n.kind === "Disease");
  M.handleRecordAction(c, "condition-level", "Disease");
  M.handleRecordAction(c, "condition-level", group.group);
  assert.equal(c.form.kind, "Disease");
  M.handleRecordAction(c, "health-add-custom", "Session sample condition");
  M.handleRecordAction(
    c,
    "health-custom-category",
    group.section + "|" + group.group,
  );
  assert.equal(c.form.conditionKinds["Session sample condition"], "Disease");
  assert.deepEqual(c.form.conditionPath, ["Disease", group.group]);
});

test("medicine path is display metadata; the recorded medicine value keeps its original name", () => {
  const M = globalThis.InspectionStudy,
    c = M.seed();
  M.openBulkAction(c, "treatment", ["000267"]);
  c.view = "medicine-picker";
  M.handleRecordAction(c, "medicine-select", "antibiotic-a");
  assert.equal(c.form.medicine, "Antibiotic A");
  assert.deepEqual(c.form.medicinePath, ["Antibiotics", "Antibiotic A"]);
  const html = M.overlay(c);
  assert.match(html, /Antibiotics \/ Antibiotic A/);
  c.form.conditionPath = ["Symptom", "General appearance"];
  c.form.search = "fever";
  c.form.conditions = ["Fever"];
  M.handleRecordAction(c, "condition-step", "1");
  assert.deepEqual(c.form.conditionPath, ["Symptom"]);
  assert.equal(c.form.search, "");
  assert.deepEqual(c.form.conditions, ["Fever"]);
});
