import React from 'react';
import {Icon} from '../core/Icon.jsx';
import {CountPill} from '../status/CountPill.jsx';
export function LocationRow({name,sublabel,overdue,due,upcoming,done,onClick,style}){
  const [hover,setHover]=React.useState(false);
  return <div onClick={onClick} role={onClick?'button':undefined}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{display:'flex',alignItems:'center',gap:12,minHeight:'var(--touch-min)',padding:'10px 16px',
    background:hover&&onClick?'var(--paper)':'var(--surface-card)',cursor:onClick?'pointer':'default',
    transition:'background var(--dur-fast) var(--ease-out)',...style}}>
    <div style={{flex:1,minWidth:0}}>
      <div style={{font:'var(--fw-semibold) var(--fs-body)/1.3 var(--font-display)',color:'var(--ink-1)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</div>
      {sublabel&&<div style={{font:'var(--text-caption)',color:'var(--ink-3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{sublabel}</div>}
    </div>
    <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
      {overdue!=null&&overdue>0&&<CountPill count={overdue} status="overdue" size="sm"/>}
      {due!=null&&due>0&&<CountPill count={due} status="due" size="sm"/>}
      {upcoming!=null&&upcoming>0&&<CountPill count={upcoming} status="upcoming" size="sm"/>}
      {done!=null&&done>0&&<CountPill count={done} status="done" size="sm"/>}
      {onClick&&<Icon name="chevron-right" size={20} color="var(--ink-3)"/>}
    </div>
  </div>;
}
