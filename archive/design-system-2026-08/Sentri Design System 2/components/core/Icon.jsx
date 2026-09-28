import React from 'react';
const iconPascal=n=>n.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('');
export function Icon({name,size=20,strokeWidth=2,color,style}){
  const [,tick]=React.useReducer(x=>x+1,0);
  React.useEffect(()=>{
    if(window.lucide)return;
    const t=setInterval(()=>{if(window.lucide){clearInterval(t);tick();}},60);
    return()=>clearInterval(t);
  },[]);
  const lib=window.lucide&&(window.lucide.icons||window.lucide);
  const node=lib&&(lib[iconPascal(name)]||lib[name]);
  if(!Array.isArray(node))return <svg width={size} height={size} style={{flexShrink:0,...style}} aria-hidden="true"></svg>;
  // Supports both lucide node shapes: ["svg",attrs,[children]] (UMD) and [[tag,attrs],...] (icon-node list)
  const kids=node[0]==='svg'?(node[2]||[]):node;
  const renderNode=(n,i)=>Array.isArray(n)?React.createElement(n[0],{...n[1],key:i},Array.isArray(n[2])?n[2].map(renderNode):undefined):null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,...style}} aria-hidden="true">{kids.map(renderNode)}</svg>;
}
