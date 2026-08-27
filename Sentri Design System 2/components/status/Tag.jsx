import React from 'react';
export function Tag({children,tone='neutral',mono=false,style}){
  const tones={neutral:{bg:'var(--surface-sunken)',ink:'var(--ink-2)'},brand:{bg:'var(--olive-100)',ink:'var(--olive-900)'}};
  const t=tones[tone]||tones.neutral;
  return <span style={{display:'inline-flex',alignItems:'center',padding:'4px 10px',
    borderRadius:'var(--radius-full)',background:t.bg,color:t.ink,
    font:(mono?'var(--fw-medium) var(--fs-caption)/1.2 var(--font-mono)':'var(--fw-medium) var(--fs-caption)/1.2 var(--font-body)'),
    whiteSpace:'nowrap',...style}}>{children}</span>;
}
