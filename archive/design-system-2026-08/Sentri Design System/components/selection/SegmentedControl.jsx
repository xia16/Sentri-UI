import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function SegmentedControl({options=[],value,onChange,full=true,style}){
  return <div style={{display:full?'flex':'inline-flex',padding:4,gap:2,background:'var(--surface-sunken)',
    borderRadius:'var(--radius-full)',...style}}>
    {options.map(o=>{
      const opt=typeof o==='string'?{value:o,label:o}:o;
      const active=opt.value===value;
      return <button key={opt.value} onClick={()=>onChange&&onChange(opt.value)}
        style={{flex:full?1:undefined,display:'flex',alignItems:'center',justifyContent:'center',gap:6,
        height:40,padding:'0 16px',border:'none',
        borderRadius:'var(--radius-full)',
        background:active?'var(--surface-card)':'transparent',
        boxShadow:active?'var(--shadow-card)':'none',
        color:active?'var(--ink-1)':'var(--ink-3)',
        font:'var(--fw-semibold) var(--fs-label)/1 var(--font-body)',cursor:'pointer',whiteSpace:'nowrap',
        transition:'background var(--dur-fast) var(--ease-out)'}}>
        {opt.icon&&<Icon name={opt.icon} size={18}/>}{opt.label}
      </button>;
    })}
  </div>;
}
