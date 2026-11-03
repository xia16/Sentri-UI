/* Fictional Unit 7 snapshot shared by its entrance and inspection study. */
(() => {
  const findings = {
    '000267': [{name:'Thin',kind:'Body condition',day:12,triage:'Monitor',feedLinked:true}],
    '000306': [{name:'Fever',kind:'Symptom',day:2,triage:'Treat in place'},{name:'Poor appetite',kind:'Symptom',day:2,triage:'Monitor'}],
    '000801': [{name:'Diarrhoea',kind:'Symptom',day:1,triage:'Monitor'}]
  };
  const ongoing = {name:'Arthritis',kind:'Disease',day:120,issueStatus:'ongoing',triage:'None',recordedDate:'15 May 2026',recordedBy:'G. Hansen',note:'Condition recorded. No action needed.'};
  globalThis.SentriUnitSnapshot = {
    lastRecord: {time:'06:40',who:'G. Hansen'},   // the unit's last record (there is no check-in: owner, 2026-11-03)
    findings: id => structuredClone(findings[id] || []),
    ongoing: () => structuredClone(ongoing),
    health: Object.keys(findings).length + 1,
    feed: 3
  };
})();
