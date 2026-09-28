import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Select({label,value,onChange,options=[],placeholder,disabled=false,style}){
  const [focus,setFocus]=React.useState(false);
  return <label style={{display:'flex',flexDirection:'column',gap:6,...style}}>
    {label&&<span style={{font:'var(--text-label)',color:'var(--ink-2)'}}>{label}</span>}
    <span style={{position:'relative',display:'block'}}>
      <select value={value??''} disabled={disabled} onChange={e=>onChange&&onChange(e.target.value)}
        onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        style={{width:'100%',height:'var(--control-h)',padding:'0 40px 0 14px',appearance:'none',WebkitAppearance:'none',
        background:disabled?'var(--neutral-100)':focus?'var(--surface-card)':'var(--surface-sunken)',
        border:'1.5px solid '+(focus?'var(--focus)':'transparent'),borderRadius:'var(--radius-md)',
        boxShadow:focus?'0 0 0 3px var(--olive-100)':'none',font:'var(--text-body)',
        color:value?'var(--ink-1)':'var(--ink-3)',cursor:disabled?'default':'pointer'}}>
        {placeholder&&<option value="" disabled>{placeholder}</option>}
        {options.map(o=>{const v=typeof o==='string'?{value:o,label:o}:o;return <option key={v.value} value={v.value}>{v.label}</option>;})}
      </select>
      <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'var(--ink-3)',display:'flex'}}><Icon name="chevron-down" size={20}/></span>
    </span>
  </label>;
}
