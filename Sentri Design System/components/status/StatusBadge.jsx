import React from 'react';
import {Icon} from '../core/Icon.jsx';
export const statusStyles={
overdue:{bg:'var(--status-overdue)',ink:'var(--status-overdue-ink)',border:'transparent',icon:'alert-triangle',label:'Overdue'},
due:{bg:'var(--status-due)',ink:'var(--status-due-ink)',border:'transparent',icon:'clock',label:'Due now'},
upcoming:{bg:'var(--status-upcoming-bg)',ink:'var(--status-upcoming-text)',border:'var(--blue-100)',icon:'calendar-clock',label:'Upcoming'},
done:{bg:'var(--status-done-bg)',ink:'var(--status-done-text)',border:'var(--green-100)',icon:'check',label:'Done'},
blocked:{bg:'var(--status-blocked-bg)',ink:'var(--status-blocked-text)',border:'transparent',icon:'octagon-pause',label:'Blocked'},
none:{bg:'var(--paper)',ink:'var(--ink-3)',border:'var(--neutral-300)',dashed:true,icon:'help-circle',label:'No status'},
};
export function StatusBadge({status='due',children,icon=true,size='md',style}){
  const s=statusStyles[status]||statusStyles.due;
  const sm=size==='sm';
  return <span style={{display:'inline-flex',alignItems:'center',gap:sm?4:6,
    padding:sm?'3px 8px':'5px 12px',borderRadius:'var(--radius-full)',
    border:'1px '+(s.dashed?'dashed':'solid')+' '+s.border,background:s.bg,color:s.ink,
    font:'var(--fw-semibold) '+(sm?'11px':'var(--fs-caption)')+'/1.2 var(--font-body)',whiteSpace:'nowrap',...style}}>
    {icon&&<Icon name={s.icon} size={sm?12:14} strokeWidth={2.5}/>}
    {children||s.label}
  </span>;
}
