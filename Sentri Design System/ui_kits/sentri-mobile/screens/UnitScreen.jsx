function UnitScreen({onBack,showToast,task}){
  const {TopBar,TopBarAction,Tabs,AnimalRow,ActionBar,Sheet,Button,Select,ProgressBar,StatusBadge}=window.SentriDesignSystem_44ba05;
  const [tab,setTab]=React.useState('due');
  const [animals,setAnimals]=React.useState([
    {id:'SOW-04182',pen:'PEN 14',meta:'Parity 3 · Day 28',st:'due'},
    {id:'SOW-04186',pen:'PEN 14',meta:'Parity 1 · Day 28',st:'due'},
    {id:'SOW-04190',pen:'PEN 15',note:'On health watch',st:'due'},
    {id:'SOW-04193',pen:'PEN 15',meta:'Parity 4 · Day 29',st:'due'},
    {id:'SOW-04201',pen:'PEN 16',meta:'Parity 2 · Day 30',st:'due',overdue:true},
    {id:'SOW-04205',pen:'PEN 16',meta:'Parity 2 · Day 31',st:'due',overdue:true},
    {id:'SOW-04212',pen:'PEN 17',meta:'Parity 5 · Day 28',st:'due'},
    {id:'SOW-04218',pen:'PEN 18',meta:'No status recorded',st:'due',none:true},
    {id:'SOW-04220',pen:'PEN 19',meta:'Eligible in 4 days',st:'upcoming'},
    {id:'SOW-04223',pen:'PEN 19',meta:'Eligible in 4 days',st:'upcoming'},
    {id:'SOW-04174',pen:'PEN 12',meta:'Pregnant · M. Larsen · 09:42',st:'done'},
    {id:'SOW-04178',pen:'PEN 13',meta:'Pregnant · M. Larsen · 09:38',st:'done'},
  ]);
  const [sel,setSel]=React.useState({});
  const [sheet,setSheet]=React.useState(false);
  const [result,setResult]=React.useState('Pregnant');
  const groups={due:animals.filter(a=>a.st==='due'),upcoming:animals.filter(a=>a.st==='upcoming'),done:animals.filter(a=>a.st==='done')};
  const selIds=Object.keys(sel).filter(k=>sel[k]);
  const record=()=>{
    setAnimals(animals.map(a=>selIds.includes(a.id)?{...a,st:'done',none:false,overdue:false,meta:result+' · You · just now'}:a));
    setSel({});setSheet(false);
    showToast(selIds.length+(selIds.length===1?' result':' results')+' recorded');
  };
  const list=groups[tab];
  return <div style={{display:'flex',flexDirection:'column',height:'100%',minHeight:0}}>
    <TopBar title="Gestation 1" subtitle={'Section B · '+(task||'Pregnancy check')} onBack={onBack}
      actions={<TopBarAction icon="scan-line" label="Scan ear tag"/>}/>
    <div style={{padding:'12px 16px',background:'var(--surface-card)',borderBottom:'1px solid var(--line-2)'}}>
      <ProgressBar label={task||'Pregnancy check'} done={groups.done.length} total={groups.done.length+groups.due.length}/>
    </div>
    <Tabs style={{padding:'12px 16px',background:'var(--surface-card)'}} value={tab} onChange={t=>{setTab(t);setSel({});}}
      tabs={[{value:'due',label:'Due',count:groups.due.length},{value:'upcoming',label:'Upcoming',count:groups.upcoming.length},{value:'done',label:'Done',count:groups.done.length}]}/>
    <div style={{flex:1,overflowY:'auto',minHeight:0,background:'var(--surface-card)'}}>
      {list.length===0&&<div style={{padding:24,font:'var(--text-body)',color:'var(--ink-3)'}}>Nothing {tab==='due'?'due now':tab} in this unit.</div>}
      {list.map((a,i)=><React.Fragment key={a.id}>
        {i>0&&<div style={{height:1,background:'var(--line-2)'}}></div>}
        <AnimalRow id={a.id} pen={a.pen} meta={a.meta} note={a.note}
          status={a.none?'none':a.overdue?'overdue':a.st}
          statusLabel={a.none?'Not checked':a.overdue?'Overdue':a.st==='due'?'Day 28+':a.st==='upcoming'?'In 4 days':'Done'}
          selected={!!sel[a.id]}
          onSelect={tab==='due'?(v=>setSel({...sel,[a.id]:v})):undefined}/>
      </React.Fragment>)}
      <div style={{height:8}}></div>
    </div>
    {selIds.length>0&&<ActionBar message={selIds.length+' selected'}>
      <Button variant="secondary" onClick={()=>setSel({})}>Clear</Button>
      <Button icon="check" onClick={()=>setSheet(true)}>Record</Button>
    </ActionBar>}
    <Sheet open={sheet} onClose={()=>setSheet(false)} title={'Record result — '+selIds.length+' selected'}
      footer={<Button size="lg" full icon="check-check" onClick={record}>{'Record '+selIds.length+(selIds.length===1?' result':' results')}</Button>}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <Select label="Result" options={['Pregnant','Not pregnant','Recheck needed']} value={result} onChange={setResult}/>
        <div style={{font:'var(--text-caption)',color:'var(--ink-3)'}}>Same result is applied to all selected animals. Records save locally when offline.</div>
      </div>
    </Sheet>
  </div>;
}
Object.assign(window,{UnitScreen});
