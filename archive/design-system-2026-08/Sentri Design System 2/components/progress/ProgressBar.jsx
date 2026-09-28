import React from 'react';
export function ProgressBar({done=0,total=0,label,showCount=true,style}){
  const pct=total>0?Math.min(100,(done/total)*100):0;
  return <div style={{display:'flex',flexDirection:'column',gap:6,...style}}>
    {(label||showCount)&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12}}>
      {label&&<span style={{font:'var(--text-label)',color:'var(--ink-2)'}}>{label}</span>}
      {showCount&&<span style={{font:'var(--fw-semibold) var(--fs-label)/1.2 var(--font-display)',color:'var(--ink-1)',whiteSpace:'nowrap'}}>{done} of {total}</span>}
    </div>}
    <div style={{height:8,borderRadius:'var(--radius-full)',background:'var(--surface-sunken)',overflow:'hidden'}}>
      <div style={{width:pct+'%',height:'100%',borderRadius:'var(--radius-full)',background:'var(--status-done)',transition:'width var(--dur-med) var(--ease-out)'}}></div>
    </div>
  </div>;
}
