import React from 'react';
import {Icon} from '../core/Icon.jsx';
import {Checkbox} from '../selection/Checkbox.jsx';
import {StatusBadge} from '../status/StatusBadge.jsx';
export function AnimalRow({id,pen,meta,status,statusLabel,note,selected,onSelect,onClick,style}){
  const [hover,setHover]=React.useState(false);
  const clickable=onSelect||onClick;
  return <div onClick={()=>{if(onSelect)onSelect(!selected);else if(onClick)onClick();}}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    role={clickable?'button':undefined}
    style={{display:'flex',alignItems:'center',gap:12,minHeight:'var(--touch-min)',padding:'8px 16px',
    background:selected?'var(--olive-50)':hover&&clickable?'var(--paper)':'var(--surface-card)',
    cursor:clickable?'pointer':'default',transition:'background var(--dur-fast) var(--ease-out)',...style}}>
    {onSelect&&<Checkbox checked={!!selected} onChange={v=>onSelect(v)} style={{minHeight:0,pointerEvents:'none'}}/>}
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:'flex',alignItems:'baseline',gap:10}}>
        <span style={{font:'var(--text-id)',color:'var(--ink-1)'}}>{id}</span>
        {pen&&<span style={{font:'var(--fw-medium) var(--fs-caption)/1.2 var(--font-mono)',color:'var(--ink-3)'}}>{pen}</span>}
      </div>
      {(meta||note)&&<div style={{font:'var(--text-caption)',color:note?'var(--amber-800)':'var(--ink-3)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{note||meta}</div>}
    </div>
    <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
      {status&&<StatusBadge status={status} size="sm" icon={false}>{statusLabel}</StatusBadge>}
      {onClick&&!onSelect&&<Icon name="chevron-right" size={18} color="var(--ink-3)"/>}
    </div>
  </div>;
}
