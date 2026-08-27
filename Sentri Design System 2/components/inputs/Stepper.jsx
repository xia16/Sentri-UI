import React from 'react';
import {Icon} from '../core/Icon.jsx';
function StepBtn({icon,onClick,disabled}){
  const [hover,setHover]=React.useState(false);
  return <button onClick={onClick} disabled={disabled} aria-label={icon==='minus'?'Decrease':'Increase'}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{width:'var(--control-h)',height:'var(--control-h)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
    border:'none',borderRadius:'var(--radius-full)',
    background:disabled?'var(--neutral-100)':hover?'var(--neutral-200)':'var(--surface-sunken)',
    color:disabled?'var(--ink-disabled)':'var(--ink-1)',cursor:disabled?'default':'pointer'}}>
    <Icon name={icon} size={22}/>
  </button>;
}
export function Stepper({label,value=0,onChange,min=0,max=999,step=1,unit,style}){
  const set=v=>onChange&&onChange(Math.min(max,Math.max(min,v)));
  return <div style={{display:'flex',flexDirection:'column',gap:6,...style}}>
    {label&&<span style={{font:'var(--text-label)',color:'var(--ink-2)'}}>{label}</span>}
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <StepBtn icon="minus" onClick={()=>set(value-step)} disabled={value<=min}/>
      <div style={{minWidth:72,textAlign:'center',font:'var(--fw-bold) var(--fs-heading)/1 var(--font-display)',color:'var(--ink-1)'}}>
        {value}{unit&&<span style={{font:'var(--text-caption)',color:'var(--ink-3)',marginLeft:4}}>{unit}</span>}
      </div>
      <StepBtn icon="plus" onClick={()=>set(value+step)} disabled={value>=max}/>
    </div>
  </div>;
}
