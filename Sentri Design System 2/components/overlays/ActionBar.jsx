import React from 'react';
export function ActionBar({message,children,style}){
  return <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
    background:'var(--surface-card)',boxShadow:'var(--shadow-sheet)',...style}}>
    {message&&<span style={{flex:1,font:'var(--fw-semibold) var(--fs-body)/1.3 var(--font-body)',color:'var(--ink-1)'}}>{message}</span>}
    <div style={{display:'flex',gap:10,flex:message?undefined:1}}>{children}</div>
  </div>;
}
