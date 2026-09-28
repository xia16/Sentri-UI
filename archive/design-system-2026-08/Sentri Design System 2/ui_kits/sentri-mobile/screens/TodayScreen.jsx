function TodayScreen({mode,setMode,onOpenUnit}){
  const {TopBar,TopBarAction,Stat,SegmentedControl,TaskCard,LocationRow,SyncPill}=window.SentriDesignSystem_44ba05;
  const units=[
    {name:'Gestation 1',sub:'24 pens · Batch 24-31',overdue:2,due:14},
    {name:'Gestation 2',sub:'24 pens · Batch 24-32',due:9},
    {name:'Gestation 3',sub:'20 pens · Batch 24-33',due:8,upcoming:6},
    {name:'Farrowing 1',sub:'12 pens · Batch 24-28',due:5,done:7},
    {name:'Nursery A',sub:'8 pens · Batch 24-25',upcoming:12},
  ];
  const tasks=[
    {title:'Pregnancy check',icon:'search-check',overdue:2,due:31,locations:'Gestation 1–3',progress:{done:18,total:31},nextUp:'18 eligible in 4 days'},
    {title:'Heat detection',icon:'flame',due:6,locations:'Gestation 2',progress:{done:2,total:6}},
    {title:'Vaccination',icon:'syringe',due:5,locations:'Farrowing 1',progress:{done:0,total:5}},
    {title:'Weaning',icon:'arrow-right-left',locations:'Farrowing 1',nextUp:'42 piglets due Thursday'},
    {title:'Feed adjustment',icon:'wheat',due:3,locations:'Gestation 3',progress:{done:0,total:3}},
  ];
  return <div style={{display:'flex',flexDirection:'column',height:'100%',minHeight:0}}>
    <TopBar title="Højgaard Farm" subtitle="Wednesday 13 August"
      actions={<React.Fragment><TopBarAction icon="scan-line" label="Scan ear tag"/><TopBarAction icon="bell" label="Alerts" badge={3}/></React.Fragment>}/>
    <div style={{flex:1,overflowY:'auto',minHeight:0}}>
      <div style={{padding:16,display:'flex',flexDirection:'column',gap:16}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'8px 12px'}}>
          <div style={{display:'flex',gap:24}}>
            <Stat value={45} label="Due now"/>
            <Stat value={2} label="Overdue" tone="overdue"/>
            <Stat value={20} suffix="of 45" label="Recorded"/>
          </div>
          <SyncPill state="pending" count={2}/>
        </div>
        <SegmentedControl value={mode} onChange={setMode}
          options={[{value:'task',label:'By task',icon:'clipboard-list'},{value:'location',label:'By location',icon:'map-pin'}]}/>
        {mode==='task'?
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {tasks.map(t=><TaskCard key={t.title} {...t} onClick={()=>onOpenUnit(t.title)}/>)}
          </div>
        :
          <div style={{background:'var(--surface-card)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-card)',overflow:'hidden'}}>
            <div style={{padding:'10px 16px 6px',font:'var(--fw-semibold) var(--fs-caption)/1.2 var(--font-body)',textTransform:'uppercase',letterSpacing:'var(--ls-label)',color:'var(--ink-3)'}}>Section B</div>
            {units.map((u,i)=><React.Fragment key={u.name}>
              {i>0&&<div style={{height:1,background:'var(--line-2)'}}></div>}
              <LocationRow name={u.name} sublabel={u.sub} overdue={u.overdue} due={u.due} upcoming={u.upcoming} done={u.done} onClick={()=>onOpenUnit('Pregnancy check')}/>
            </React.Fragment>)}
          </div>
        }
      </div>
    </div>
  </div>;
}
Object.assign(window,{TodayScreen});
