import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function BottomNav({items=[],value,onChange,style}){
  return <div style={{display:'flex',background:'var(--surface-card)',boxShadow:'0 -4px 16px rgba(23,25,22,.06)',padding:'6px 8px 10px',...style}}>
    {items.map(it=>{
      const active=it.value===value;
      return <button key={it.value} onClick={()=>onChange&&onChange(it.value)}
        style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 0',
        border:'none',background:'transparent',cursor:'pointer',
        color:active?'var(--olive-900)':'var(--ink-3)'}}>
        <span style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',width:56,height:32,
          borderRadius:'var(--radius-full)',background:active?'var(--olive-100)':'transparent',
          transition:'background var(--dur-med) var(--ease-out)'}}>
          <Icon name={it.icon} size={22} strokeWidth={active?2.4:2}/>
          {it.badge!=null&&<span style={{position:'absolute',top:-3,right:6,minWidth:16,height:16,padding:'0 4px',boxSizing:'border-box',borderRadius:'var(--radius-full)',background:'var(--status-overdue)',color:'#fff',font:'var(--fw-bold) 10px/16px var(--font-display)',textAlign:'center'}}>{it.badge}</span>}
        </span>
        <span style={{font:'var(--fw-'+(active?'bold':'medium')+') 11px/1 var(--font-body)'}}>{it.label}</span>
      </button>;
    })}
  </div>;
}
