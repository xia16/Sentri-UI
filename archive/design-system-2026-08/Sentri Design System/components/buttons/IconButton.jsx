import React from 'react';
import {Icon} from '../core/Icon.jsx';
const iconBtnVariants={
primary:{bg:'var(--olive-800)',ink:'#fff',border:'transparent',hover:'var(--olive-900)'},
secondary:{bg:'var(--surface-sunken)',ink:'var(--ink-1)',border:'transparent',hover:'var(--neutral-200)'},
ghost:{bg:'transparent',ink:'var(--ink-2)',border:'transparent',hover:'var(--surface-sunken)'},
};
export function IconButton({icon,label,variant='secondary',size='md',disabled=false,onClick,style}){
  const v=iconBtnVariants[variant]||iconBtnVariants.secondary;
  const d=size==='sm'?36:48;
  const [hover,setHover]=React.useState(false);
  const [press,setPress]=React.useState(false);
  return <button aria-label={label} title={label} onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false);setPress(false);}}
    onMouseDown={()=>setPress(true)} onMouseUp={()=>setPress(false)}
    style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:d,height:d,flexShrink:0,
    border:'1px solid '+v.border,borderRadius:'var(--radius-full)',
    background:disabled?'var(--surface-sunken)':(hover?v.hover:v.bg),
    color:disabled?'var(--ink-disabled)':v.ink,cursor:disabled?'default':'pointer',
    transform:press&&!disabled?'scale(.96)':'none',
    transition:'background var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out)',...style}}>
    <Icon name={icon} size={size==='sm'?18:22}/>
  </button>;
}
