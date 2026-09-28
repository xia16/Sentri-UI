import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function SyncPill({state='synced',count,style}){
  const states={
    synced:{icon:'check-check',label:'Synced',ink:'var(--ink-3)',bg:'transparent',border:'transparent'},
    pending:{icon:'refresh-cw',label:(count||0)+' waiting to sync',ink:'var(--amber-800)',bg:'var(--amber-50)',border:'var(--amber-100)'},
    offline:{icon:'cloud-off',label:'Offline — saving locally',ink:'var(--ink-2)',bg:'var(--surface-sunken)',border:'transparent'},
  };
  const s=states[state]||states.synced;
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 10px',
    borderRadius:'var(--radius-full)',border:'1px solid '+s.border,background:s.bg,color:s.ink,
    font:'var(--fw-medium) var(--fs-caption)/1.2 var(--font-body)',whiteSpace:'nowrap',...style}}>
    <Icon name={s.icon} size={14}/>{s.label}
  </span>;
}
