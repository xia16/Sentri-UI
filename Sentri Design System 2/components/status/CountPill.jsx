import React from 'react';
import {statusStyles} from './StatusBadge.jsx';
export function CountPill({count,status='due',size='md',style}){
  const s=statusStyles[status]||statusStyles.due;
  const sm=size==='sm';
  return <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',
    minWidth:sm?22:28,height:sm?22:28,padding:'0 8px',boxSizing:'border-box',
    borderRadius:'var(--radius-full)',border:'1px '+(s.dashed?'dashed':'solid')+' '+s.border,
    background:s.bg,color:s.ink,
    font:'var(--fw-bold) '+(sm?'12px':'14px')+'/1 var(--font-display)',...style}}>
    {count==null?'—':count}
  </span>;
}
