import React from 'react';
import {Icon} from '../core/Icon.jsx';
import {StatusBadge} from '../status/StatusBadge.jsx';
import {ProgressBar} from '../progress/ProgressBar.jsx';
export function TaskCard({title,icon='clipboard-list',overdue=0,due=0,locations,progress,nextUp,onClick,style}){
  const [hover,setHover]=React.useState(false);
  const hasNow=(overdue||0)+(due||0)>0;
  return <div onClick={onClick} role={onClick?'button':undefined}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{display:'flex',flexDirection:'column',gap:12,padding:16,background:'var(--surface-card)',
    border:'none',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-card)',
    cursor:onClick?'pointer':'default',transition:'background var(--dur-fast) var(--ease-out)',
    ...(hover&&onClick?{background:'var(--paper)'}:{}),...style}}>
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <span style={{width:40,height:40,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
        borderRadius:'12px',background:hasNow?'var(--olive-100)':'var(--surface-sunken)',
        color:hasNow?'var(--olive-900)':'var(--ink-3)'}}><Icon name={icon} size={22}/></span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{font:'var(--text-title)',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{title}</div>
        {locations&&<div style={{font:'var(--text-caption)',color:'var(--ink-3)',display:'flex',alignItems:'center',gap:4,marginTop:2}}><Icon name="map-pin" size={13}/>{locations}</div>}
      </div>
      {onClick&&<Icon name="chevron-right" size={20} color="var(--ink-3)" style={{flexShrink:0}}/>}
    </div>
    {(overdue>0||due>0)&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      {overdue>0&&<StatusBadge status="overdue">{overdue} overdue</StatusBadge>}
      {due>0&&<StatusBadge status="due">{due} due</StatusBadge>}
    </div>}
    {progress&&progress.total>0&&<ProgressBar done={progress.done} total={progress.total}/>}
    {nextUp&&<div style={{display:'flex',alignItems:'center',gap:6,font:'var(--text-caption)',color:'var(--status-upcoming-text)'}}><Icon name="calendar-clock" size={14}/>{nextUp}</div>}
  </div>;
}
