import React from 'react';
export function Tabs({tabs=[],value,onChange,style}){
  return <div style={{display:'flex',gap:8,...style}}>
    {tabs.map(t=>{
      const tab=typeof t==='string'?{value:t,label:t}:t;
      const active=tab.value===value;
      return <button key={tab.value} onClick={()=>onChange&&onChange(tab.value)}
        style={{display:'flex',alignItems:'center',gap:6,padding:'9px 14px',border:'none',
        borderRadius:'var(--radius-full)',background:active?'var(--neutral-900)':'var(--surface-sunken)',
        color:active?'#fff':'var(--ink-2)',font:'var(--fw-semibold) var(--fs-label)/1 var(--font-body)',
        cursor:'pointer',whiteSpace:'nowrap',transition:'background var(--dur-fast) var(--ease-out)'}}>
        {tab.label}
        {tab.count!=null&&<span style={{fontWeight:700,opacity:active?.7:.55}}>{tab.count}</span>}
      </button>;
    })}
  </div>;
}
