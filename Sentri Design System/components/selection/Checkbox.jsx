import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Checkbox({checked=false,onChange,label,sublabel,disabled=false,style}){
  return <label style={{display:'flex',alignItems:'center',gap:12,minHeight:'var(--touch-min)',cursor:disabled?'default':'pointer',userSelect:'none',...style}}
    onClick={e=>{e.preventDefault();!disabled&&onChange&&onChange(!checked);}}>
    <span style={{width:26,height:26,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
      borderRadius:'8px',border:'2px solid '+(checked?'var(--olive-800)':'var(--neutral-300)'),
      background:checked?'var(--olive-800)':'var(--surface-card)',
      opacity:disabled?.5:1,transition:'background var(--dur-fast) var(--ease-out)'}}>
      {checked&&<Icon name="check" size={18} color="#fff" strokeWidth={3}/>}
    </span>
    {(label||sublabel)&&<span style={{display:'flex',flexDirection:'column',gap:2}}>
      {label&&<span style={{font:'var(--text-body)',color:disabled?'var(--ink-disabled)':'var(--ink-1)'}}>{label}</span>}
      {sublabel&&<span style={{font:'var(--text-caption)',color:'var(--ink-3)'}}>{sublabel}</span>}
    </span>}
  </label>;
}
