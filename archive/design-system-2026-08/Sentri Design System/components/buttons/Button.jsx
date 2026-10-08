import React from 'react';
import {Icon} from '../core/Icon.jsx';
const btnVariants={
primary:{bg:'var(--olive-800)',ink:'var(--ink-on-brand)',border:'transparent',hover:'var(--olive-900)'},
secondary:{bg:'var(--surface-sunken)',ink:'var(--ink-1)',border:'transparent',hover:'var(--neutral-200)'},
ghost:{bg:'transparent',ink:'var(--olive-700)',border:'transparent',hover:'var(--olive-50)'},
danger:{bg:'var(--red-600)',ink:'#fff',border:'transparent',hover:'var(--red-700)'},
};
const btnSizes={
sm:{h:'var(--control-h-sm)',pad:'0 12px',fs:'var(--fs-label)',icon:16},
md:{h:'var(--control-h)',pad:'0 20px',fs:'var(--fs-body)',icon:20},
lg:{h:'var(--control-h-lg)',pad:'0 24px',fs:'var(--fs-body-lg)',icon:22},
};
export function Button({variant='primary',size='md',icon,children,disabled=false,full=false,onClick,style}){
  const v=btnVariants[variant]||btnVariants.primary,s=btnSizes[size]||btnSizes.md;
  const [hover,setHover]=React.useState(false);
  const [press,setPress]=React.useState(false);
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false);setPress(false);}}
    onMouseDown={()=>setPress(true)} onMouseUp={()=>setPress(false)}
    style={{display:full?'flex':'inline-flex',width:full?'100%':undefined,alignItems:'center',justifyContent:'center',gap:8,
    height:s.h,padding:s.pad,border:'1px solid '+v.border,borderRadius:'var(--radius-full)',
    background:disabled?'var(--surface-sunken)':(hover?v.hover:v.bg),
    color:disabled?'var(--ink-disabled)':v.ink,
    font:'var(--fw-semibold) '+s.fs+'/1 var(--font-body)',cursor:disabled?'default':'pointer',
    transform:press&&!disabled?'scale(.98)':'none',
    transition:'background var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out)',
    whiteSpace:'nowrap',userSelect:'none',...style}}>
    {icon&&<Icon name={icon} size={s.icon}/>}{children}
  </button>;
}
