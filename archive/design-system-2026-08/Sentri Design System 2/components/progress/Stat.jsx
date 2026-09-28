import React from 'react';
export function Stat({value,label,tone='default',suffix,style}){
  const inks={default:'var(--ink-1)',overdue:'var(--status-overdue)',due:'var(--amber-600)',done:'var(--status-done)',muted:'var(--ink-3)'};
  return <div style={{display:'flex',flexDirection:'column',gap:4,...style}}>
    <div style={{font:'var(--text-count)',color:inks[tone]||inks.default,whiteSpace:'nowrap'}}>
      {value==null?'—':value}{suffix&&<span style={{font:'var(--fw-semibold) var(--fs-title)/1 var(--font-display)',color:'var(--ink-3)'}}> {suffix}</span>}
    </div>
    <div style={{font:'var(--fw-semibold) var(--fs-caption)/1.2 var(--font-body)',textTransform:'uppercase',letterSpacing:'var(--ls-label)',color:'var(--ink-3)',whiteSpace:'nowrap'}}>{label}</div>
  </div>;
}
