import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Sheet({open=false,onClose,title,children,footer,style}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(28,27,24,.4)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:100}}>
    <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:480,maxHeight:'85%',display:'flex',flexDirection:'column',
      background:'var(--surface-card)',borderRadius:'28px 28px 0 0',boxShadow:'var(--shadow-sheet)',...style}}>
      <div style={{width:36,height:4,flexShrink:0,borderRadius:'var(--radius-full)',background:'var(--neutral-200)',margin:'10px auto 0'}}></div>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px 0 20px'}}>
        <span style={{flex:1,font:'var(--text-title)'}}>{title}</span>
        <button onClick={onClose} aria-label="Close" style={{width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',color:'var(--ink-2)',cursor:'pointer',borderRadius:'var(--radius-md)'}}><Icon name="x" size={24}/></button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:20}}>{children}</div>
      {footer&&<div style={{padding:'4px 20px 24px',display:'flex',gap:12}}>{footer}</div>}
    </div>
  </div>;
}
