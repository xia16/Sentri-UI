import React from 'react';
export function Switch({checked=false,onChange,label,disabled=false,style}){
  return <label style={{display:'flex',alignItems:'center',gap:12,minHeight:'var(--touch-min)',cursor:disabled?'default':'pointer',userSelect:'none',...style}}
    onClick={e=>{e.preventDefault();!disabled&&onChange&&onChange(!checked);}}>
    <span style={{width:52,height:32,flexShrink:0,borderRadius:'var(--radius-full)',padding:3,boxSizing:'border-box',
      background:checked?'var(--olive-800)':'var(--neutral-300)',opacity:disabled?.5:1,
      transition:'background var(--dur-med) var(--ease-out)'}}>
      <span style={{display:'block',width:26,height:26,borderRadius:'50%',background:'#fff',
        boxShadow:'var(--shadow-card)',transform:checked?'translateX(20px)':'none',
        transition:'transform var(--dur-med) var(--ease-out)'}}></span>
    </span>
    {label&&<span style={{font:'var(--text-body)',color:disabled?'var(--ink-disabled)':'var(--ink-1)'}}>{label}</span>}
  </label>;
}
