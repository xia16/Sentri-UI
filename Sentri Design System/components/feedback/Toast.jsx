import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Toast({message,tone='neutral',icon,action,onAction,style}){
  const tones={
    neutral:{bg:'var(--neutral-900)',ink:'#fff',defIcon:'info'},
    success:{bg:'var(--neutral-900)',ink:'#fff',defIcon:'check'},
    error:{bg:'var(--red-700)',ink:'#fff',defIcon:'alert-triangle'},
  };
  const t=tones[tone]||tones.neutral;
  return <div role="status" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',
    borderRadius:'var(--radius-lg)',background:t.bg,color:t.ink,boxShadow:'var(--shadow-raised)',
    font:'var(--text-body)',maxWidth:420,...style}}>
    <Icon name={icon||t.defIcon} size={20} color={tone==='success'?'var(--green-100)':undefined}/>
    <span style={{flex:1}}>{message}</span>
    {action&&<button onClick={onAction} style={{border:'none',background:'transparent',color:'var(--amber-500)',
      font:'var(--fw-semibold) var(--fs-label)/1 var(--font-body)',cursor:'pointer',padding:'8px 4px',whiteSpace:'nowrap'}}>{action}</button>}
  </div>;
}
