function AnimalsScreen(){
  const {TopBar,TopBarAction,Input,AnimalRow}=window.SentriDesignSystem_44ba05;
  const all=[
    {id:'SOW-04182',pen:'GESTATION 1 · PEN 14',meta:'Parity 3 · Batch 24-31 · Day 28 pregnant'},
    {id:'SOW-04190',pen:'GESTATION 1 · PEN 15',note:'On health watch',st:'blocked',lbl:'Health watch'},
    {id:'SOW-04220',pen:'GESTATION 1 · PEN 19',meta:'Parity 1 · Batch 24-31'},
    {id:'SOW-03911',pen:'FARROWING 1 · PEN 03',meta:'Parity 4 · Farrowed 4 Aug · 13 piglets'},
    {id:'SOW-03924',pen:'FARROWING 1 · PEN 05',meta:'Parity 2 · Farrowed 6 Aug · 12 piglets'},
    {id:'GILT-00412',pen:'GESTATION 3 · PEN 02',meta:'No batch assigned',st:'none',lbl:'No status'},
  ];
  const [q,setQ]=React.useState('');
  const list=all.filter(a=>a.id.toLowerCase().includes(q.toLowerCase()));
  return <div style={{display:'flex',flexDirection:'column',height:'100%',minHeight:0}}>
    <TopBar title="Animals" subtitle="1,846 on site" actions={<TopBarAction icon="scan-line" label="Scan ear tag"/>}/>
    <div style={{padding:'12px 16px',background:'var(--surface-card)',borderBottom:'1px solid var(--line-2)'}}>
      <Input icon="search" placeholder="Search ear tag or ID" value={q} onChange={setQ}/>
    </div>
    <div style={{flex:1,overflowY:'auto',minHeight:0,background:'var(--surface-card)'}}>
      {list.length===0&&<div style={{padding:24,font:'var(--text-body)',color:'var(--ink-3)'}}>No animals match “{q}”.</div>}
      {list.map((a,i)=><React.Fragment key={a.id}>
        {i>0&&<div style={{height:1,background:'var(--line-2)'}}></div>}
        <AnimalRow id={a.id} pen={a.pen} meta={a.meta} note={a.note} status={a.st} statusLabel={a.lbl} onClick={()=>{}}/>
      </React.Fragment>)}
    </div>
  </div>;
}
Object.assign(window,{AnimalsScreen});
