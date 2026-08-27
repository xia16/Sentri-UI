import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Input({label,value,onChange,placeholder,type='text',icon,suffix,error,hint,disabled=false,style}){
  const [focus,setFocus]=React.useState(false);
  return <label style={{display:'flex',flexDirection:'column',gap:6,...style}}>
    {label&&<span style={{font:'var(--text-label)',color:'var(--ink-2)'}}>{label}</span>}
    <span style={{display:'flex',alignItems:'center',gap:10,height:'var(--control-h)',padding:'0 14px',
      background:disabled?'var(--neutral-100)':focus?'var(--surface-card)':'var(--surface-sunken)',
      border:'1.5px solid '+(error?'var(--red-600)':focus?'var(--focus)':'transparent'),
      borderRadius:'var(--radius-md)',boxShadow:focus?'0 0 0 3px var(--olive-100)':'none',
      transition:'border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)'}}>
      {icon&&<Icon name={icon} size={20} color="var(--ink-3)"/>}
      <input type={type} value={value} placeholder={placeholder} disabled={disabled}
        onChange={e=>onChange&&onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        style={{flex:1,minWidth:0,border:'none',outline:'none',background:'transparent',
        font:'var(--text-body)',color:disabled?'var(--ink-disabled)':'var(--ink-1)'}}/>
      {suffix&&<span style={{font:'var(--text-caption)',color:'var(--ink-3)',flexShrink:0}}>{suffix}</span>}
    </span>
    {(error||hint)&&<span style={{font:'var(--text-caption)',color:error?'var(--red-700)':'var(--ink-3)'}}>{error||hint}</span>}
  </label>;
}
