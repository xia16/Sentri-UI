import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function TopBar({title,subtitle,onBack,actions,style}){
  return <div style={{display:'flex',alignItems:'center',gap:10,minHeight:64,padding:'10px 16px',background:'var(--bg-app)',color:'var(--ink-1)',...style}}>
    {onBack&&<button onClick={onBack} aria-label="Back" style={{width:44,height:44,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'var(--surface-card)',color:'var(--ink-1)',cursor:'pointer',borderRadius:'var(--radius-full)',boxShadow:'var(--shadow-card)'}}><Icon name="chevron-left" size={24}/></button>}
    <div style={{flex:1,minWidth:0}}>
      <div style={{font:'var(--fw-extrabold) 20px/1.2 var(--font-display)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</div>
      {subtitle&&<div style={{font:'var(--text-caption)',color:'var(--ink-3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginTop:1}}>{subtitle}</div>}
    </div>
    {actions&&<div style={{display:'flex',gap:8,alignItems:'center'}}>{actions}</div>}
  </div>;
}
export function TopBarAction({icon,label,onClick,badge}){
  return <button onClick={onClick} aria-label={label} title={label} style={{position:'relative',width:44,height:44,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'var(--surface-card)',color:'var(--ink-1)',cursor:'pointer',borderRadius:'var(--radius-full)',boxShadow:'var(--shadow-card)'}}>
    <Icon name={icon} size={22}/>
    {badge!=null&&<span style={{position:'absolute',top:-2,right:-2,minWidth:18,height:18,padding:'0 5px',boxSizing:'border-box',borderRadius:'var(--radius-full)',background:'var(--status-overdue)',color:'#fff',font:'var(--fw-bold) 11px/18px var(--font-display)',textAlign:'center'}}>{badge}</span>}
  </button>;
}
