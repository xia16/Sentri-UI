"use client";

import { useMemo, useState } from "react";

type TaskKey = "heat" | "vaccine" | "pregnancy" | "movement";
type Screen =
  | { name: "home" }
  | { name: "task-units"; task: TaskKey }
  | { name: "unit"; unitId: number }
  | { name: "worklist"; unitId: number; task: TaskKey; origin: "task" | "unit" };

type Animal = {
  id: string;
  pen: string;
  detail: Record<TaskKey, { signal: string; context: string; tone: string }>;
};

const taskConfig: Record<
  TaskKey,
  {
    name: string;
    category: string;
    description: string;
    primaryLabel: string;
    actions: string[];
    bulkAction?: string;
    count: number;
    units: number[];
  }
> = {
  heat: {
    name: "Heat detection",
    category: "Production",
    description: "Prioritised by estimated heat window",
    primaryLabel: "Estimated heat",
    actions: ["In heat", "Not in heat", "Recheck"],
    count: 23,
    units: [1, 2, 4],
  },
  vaccine: {
    name: "Vaccination",
    category: "Health",
    description: "One protocol, individual exceptions",
    primaryLabel: "Vaccine due",
    actions: ["Given", "Skip", "Not eligible"],
    bulkAction: "Give vaccine",
    count: 18,
    units: [1, 3],
  },
  pregnancy: {
    name: "Pregnancy check",
    category: "Production",
    description: "Record an outcome for every animal",
    primaryLabel: "Check window",
    actions: ["Pregnant", "Open", "Recheck"],
    count: 31,
    units: [2, 3, 4],
  },
  movement: {
    name: "Planned movement",
    category: "Movement",
    description: "Select eligible animals, then confirm",
    primaryLabel: "Movement status",
    actions: ["Select", "Hold", "Not found"],
    bulkAction: "Add to movement",
    count: 12,
    units: [4],
  },
};

const units = [
  { id: 1, name: "Unit 01", pigs: 86, pens: 8, tasks: ["heat", "vaccine"] as TaskKey[] },
  { id: 2, name: "Unit 02", pigs: 74, pens: 7, tasks: ["heat", "pregnancy"] as TaskKey[] },
  { id: 3, name: "Unit 03", pigs: 92, pens: 9, tasks: ["vaccine", "pregnancy"] as TaskKey[] },
  { id: 4, name: "Unit 04", pigs: 68, pens: 6, tasks: ["heat", "pregnancy", "movement"] as TaskKey[] },
];

const animals: Animal[] = [
  {
    id: "Sow 1042",
    pen: "Pen 08",
    detail: {
      heat: { signal: "Today", context: "Weaned 5d ago · Parity 3", tone: "urgent" },
      vaccine: { signal: "Due today", context: "Erysipelas · 2 ml · Batch 84A", tone: "urgent" },
      pregnancy: { signal: "Day 28", context: "Mated 16 Jul · Service 1", tone: "normal" },
      movement: { signal: "Eligible", context: "To Farrowing Unit 02 · 15 Aug", tone: "normal" },
    },
  },
  {
    id: "Sow 1087",
    pen: "Pen 09",
    detail: {
      heat: { signal: "Tomorrow", context: "Weaned 4d ago · Parity 2", tone: "normal" },
      vaccine: { signal: "Overdue 1 day", context: "Erysipelas · 2 ml · Batch 84A", tone: "urgent" },
      pregnancy: { signal: "Day 31", context: "Mated 13 Jul · Service 2", tone: "urgent" },
      movement: { signal: "Eligible", context: "To Farrowing Unit 02 · 15 Aug", tone: "normal" },
    },
  },
  {
    id: "Sow 1121",
    pen: "Pen 09",
    detail: {
      heat: { signal: "Today · high confidence", context: "Weaned 6d ago · Parity 4", tone: "urgent" },
      vaccine: { signal: "Due today", context: "Erysipelas · 2 ml · Batch 84A", tone: "normal" },
      pregnancy: { signal: "Day 26", context: "Mated 18 Jul · Service 1", tone: "normal" },
      movement: { signal: "Review restriction", context: "Treatment withdrawal until 16 Aug", tone: "warning" },
    },
  },
  {
    id: "Sow 1184",
    pen: "Pen 10",
    detail: {
      heat: { signal: "2 days", context: "Weaned 3d ago · Parity 1", tone: "quiet" },
      vaccine: { signal: "Due in 2 days", context: "Erysipelas · 2 ml · Batch 84A", tone: "quiet" },
      pregnancy: { signal: "Recheck due", context: "Unclear result on 11 Aug", tone: "warning" },
      movement: { signal: "Eligible", context: "To Farrowing Unit 02 · 15 Aug", tone: "normal" },
    },
  },
];

function Chevron() {
  return <span aria-hidden="true">›</span>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [homeMode, setHomeMode] = useState<"tasks" | "units">("tasks");
  const [selected, setSelected] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "remaining" | "done">("all");
  const [notice, setNotice] = useState("");

  const go = (next: Screen) => {
    setScreen(next);
    setSelected([]);
    setFilter("all");
    setNotice("");
  };

  const currentUnit = "unitId" in screen ? units.find((u) => u.id === screen.unitId) : undefined;
  const currentTask = "task" in screen ? taskConfig[screen.task] : undefined;

  const visibleAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const key = screen.name === "worklist" ? `${screen.unitId}-${screen.task}-${animal.id}` : animal.id;
      const isDone = Boolean(outcomes[key]);
      return filter === "all" || (filter === "done" ? isDone : !isDone);
    });
  }, [filter, outcomes, screen]);

  const back = () => {
    if (screen.name === "worklist" && screen.origin === "task") go({ name: "task-units", task: screen.task });
    else if (screen.name === "worklist") go({ name: "unit", unitId: screen.unitId });
    else go({ name: "home" });
  };

  const saveOutcome = (animalId: string, action: string) => {
    if (screen.name !== "worklist") return;
    const key = `${screen.unitId}-${screen.task}-${animalId}`;
    setOutcomes((current) => ({ ...current, [key]: action }));
    setSelected((current) => current.filter((id) => id !== animalId));
    setNotice(`${animalId}: ${action}`);
  };

  const runBulk = () => {
    if (screen.name !== "worklist" || !currentTask?.bulkAction || selected.length === 0) return;
    const result = screen.task === "vaccine" ? "Given" : screen.task === "movement" ? "Selected" : currentTask.bulkAction;
    setOutcomes((current) => {
      const next = { ...current };
      selected.forEach((animalId) => {
        next[`${screen.unitId}-${screen.task}-${animalId}`] = result;
      });
      return next;
    });
    setNotice(`${result} recorded for ${selected.length} animals`);
    setSelected([]);
  };

  return (
    <main className="prototype-stage">
      <section className="explainer" aria-label="Prototype explanation">
        <p className="eyebrow">INTERACTIVE WIREFRAME</p>
        <h1>One animal worklist.<br />A different lens for each task.</h1>
        <p>
          Try both routes. They lead to the same unit-owned work, but each task changes the
          information, outcomes, and bulk controls shown for each animal.
        </p>
        <div className="legend-card">
          <strong>Always consistent</strong>
          <span>Unit context · animal identity · progress · exceptions</span>
          <strong>Configured by task</strong>
          <span>Primary signal · supporting facts · outcomes · bulk rules</span>
        </div>
      </section>

      <section className="phone" aria-label="Mobile farm operations prototype">
        <div className="phone-status"><span>9:41</span><span>● ● ▰</span></div>

        {screen.name === "home" && (
          <>
            <header className="app-header">
              <div>
                <p className="breadcrumb">Green Valley Farm · North Zone</p>
                <h2>Gestation</h2>
              </div>
              <button className="icon-button" aria-label="Open more options">•••</button>
            </header>

            <div className="summary-strip">
              <div><strong>84</strong><span>actions left</span></div>
              <div><strong>7</strong><span>overdue</span></div>
              <div><strong>320</strong><span>pigs</span></div>
            </div>

            <div className="segmented" aria-label="Choose work view">
              <button className={homeMode === "tasks" ? "active" : ""} onClick={() => setHomeMode("tasks")}>By task</button>
              <button className={homeMode === "units" ? "active" : ""} onClick={() => setHomeMode("units")}>By unit</button>
            </div>

            <div className="screen-body">
              <div className="section-heading">
                <div><p className="eyebrow">SHARED WORK</p><h3>{homeMode === "tasks" ? "What needs doing" : "Where work is"}</h3></div>
                <button className="text-button">Filter</button>
              </div>

              {homeMode === "tasks" ? (
                <div className="stack">
                  {(Object.keys(taskConfig) as TaskKey[]).map((key) => {
                    const task = taskConfig[key];
                    return (
                      <button className="list-card task-card" key={key} onClick={() => go({ name: "task-units", task: key })}>
                        <span className={`task-mark ${key}`} aria-hidden="true" />
                        <span className="card-copy">
                          <span className="card-kicker">{task.category}</span>
                          <strong>{task.name}</strong>
                          <small>{task.description}</small>
                        </span>
                        <span className="count-block"><strong>{task.count}</strong><small>animals</small></span>
                        <Chevron />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="stack">
                  {units.map((unit) => (
                    <button className="list-card unit-card" key={unit.id} onClick={() => go({ name: "unit", unitId: unit.id })}>
                      <span className="unit-number">{String(unit.id).padStart(2, "0")}</span>
                      <span className="card-copy"><strong>{unit.name}</strong><small>{unit.pigs} pigs · {unit.pens} pens</small></span>
                      <span className="task-dots">{unit.tasks.map((task) => <i className={task} key={task} />)}</span>
                      <span className="count-block"><strong>{unit.tasks.length}</strong><small>tasks</small></span>
                      <Chevron />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {screen.name === "task-units" && currentTask && (
          <>
            <header className="detail-header">
              <button className="back-button" onClick={back} aria-label="Back">‹</button>
              <div><p className="breadcrumb">Task-first route</p><h2>{currentTask.name}</h2></div>
            </header>
            <div className="task-summary">
              <span className={`task-mark ${screen.task}`} />
              <div><strong>{currentTask.count} animals remaining</strong><small>across {currentTask.units.length} units · 7 completed</small></div>
            </div>
            <div className="screen-body">
              <div className="batch-plan">
                <div className="batch-plan-top"><span>Batch progress</span><strong>23%</strong></div>
                <div className="batch-track"><i style={{ width: "23%" }} /></div>
                <div className="batch-meta"><span>{currentTask.units.length} units affected</span><span>≈ {currentTask.count * 2} min work</span><span>1 overdue</span></div>
              </div>
              <div className="section-heading"><div><p className="eyebrow">PLAN ACROSS UNITS</p><h3>Choose where to continue</h3></div><button className="text-button">Sort route</button></div>
              <div className="stack">
                {units.filter((unit) => currentTask.units.includes(unit.id)).map((unit, index) => (
                  <button className="list-card unit-card batch-unit" key={unit.id} onClick={() => go({ name: "worklist", unitId: unit.id, task: screen.task, origin: "task" })}>
                    <span className="unit-number">{String(unit.id).padStart(2, "0")}</span>
                    <span className="card-copy"><strong>{unit.name}</strong><small>{index === 0 ? "Recommended next · 2 overdue" : `${unit.pigs} pigs · ${unit.pens} pens`}</small><span className="mini-progress"><i style={{ width: `${[0, 40, 18][index] ?? 0}%` }} /></span></span>
                    <span className="count-block"><strong>{[8, 6, 9][index] ?? 5}</strong><small>remaining</small></span>
                    <Chevron />
                  </button>
                ))}
              </div>
              <p className="planning-note">Completion in any unit updates this shared batch view for everyone.</p>
            </div>
          </>
        )}

        {screen.name === "unit" && currentUnit && (
          <>
            <header className="detail-header">
              <button className="back-button" onClick={back} aria-label="Back">‹</button>
              <div><p className="breadcrumb">Gestation · unit-first route</p><h2>{currentUnit.name}</h2></div>
              <button className="outline-button">Pens</button>
            </header>
            <div className="unit-stats">
              <div><strong>{currentUnit.pigs}</strong><span>pigs</span></div>
              <div><strong>{currentUnit.pens}</strong><span>pens</span></div>
              <div><strong>{currentUnit.tasks.length}</strong><span>tasks</span></div>
            </div>
            <div className="screen-body">
              <div className="section-heading"><div><p className="eyebrow">UNIT WORK</p><h3>Complete in this unit</h3></div></div>
              <div className="stack">
                {currentUnit.tasks.map((key, index) => {
                  const task = taskConfig[key];
                  return (
                    <button className="list-card task-card" key={key} onClick={() => go({ name: "worklist", unitId: currentUnit.id, task: key, origin: "unit" })}>
                      <span className={`task-mark ${key}`} />
                      <span className="card-copy"><span className="card-kicker">{task.category}</span><strong>{task.name}</strong><small>{task.primaryLabel} lens</small></span>
                      <span className="count-block"><strong>{[8, 12, 5][index] ?? 4}</strong><small>left</small></span>
                      <Chevron />
                    </button>
                  );
                })}
              </div>
              <button className="secondary-wide">View pens and all animals</button>
            </div>
          </>
        )}

        {screen.name === "worklist" && currentUnit && currentTask && (
          <>
            <header className="detail-header work-header">
              <button className="back-button" onClick={back} aria-label="Back">‹</button>
              <div><p className="breadcrumb">{screen.origin === "task" ? `${currentTask.units.indexOf(currentUnit.id) + 1} of ${currentTask.units.length} units in batch` : `${currentUnit.name} · unit work`}</p><h2>{currentTask.name}</h2></div>
              <button className="icon-button" aria-label="Open task options">•••</button>
            </header>
            <div className="lens-banner">
              <div><span>{currentUnit.name} · Task lens</span><strong>{currentTask.primaryLabel}</strong></div>
              <small>{screen.origin === "task" ? "Complete this unit, then return to the cross-unit batch." : "Complete this task, then return to the unit’s remaining work."}</small>
            </div>
            <div className="progress-row">
              <span><strong>{animals.length - Object.keys(outcomes).filter((key) => key.includes(`${screen.unitId}-${screen.task}`)).length}</strong> remaining</span>
              <div className="progress-track"><i style={{ width: `${(Object.keys(outcomes).filter((key) => key.includes(`${screen.unitId}-${screen.task}`)).length / animals.length) * 100}%` }} /></div>
            </div>
            <div className="filter-row" aria-label="Filter animal worklist">
              {(["all", "remaining", "done"] as const).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>)}
            </div>
            <div className="animal-list">
              {visibleAnimals.map((animal) => {
                const detail = animal.detail[screen.task];
                const outcomeKey = `${screen.unitId}-${screen.task}-${animal.id}`;
                const outcome = outcomes[outcomeKey];
                const canSelect = Boolean(currentTask.bulkAction) && !outcome;
                return (
                  <article className={`animal-row ${outcome ? "completed" : ""}`} key={animal.id}>
                    <div className="animal-topline">
                      {canSelect && <label className="check-wrap"><input type="checkbox" checked={selected.includes(animal.id)} onChange={() => setSelected((current) => current.includes(animal.id) ? current.filter((id) => id !== animal.id) : [...current, animal.id])} /><span /></label>}
                      <div className="animal-id"><strong>{animal.id}</strong><small>{animal.pen}</small></div>
                      {outcome ? <span className="outcome">✓ {outcome}</span> : <span className={`signal ${detail.tone}`}>{detail.signal}</span>}
                    </div>
                    <p className="animal-context">{detail.context}</p>
                    {!outcome && (
                      <div className="action-row">
                        {currentTask.actions.map((action, index) => <button className={index === 0 ? "primary-action" : ""} key={action} onClick={() => saveOutcome(animal.id, action)}>{action}</button>)}
                      </div>
                    )}
                  </article>
                );
              })}
              {visibleAnimals.length === 0 && <div className="empty-state">No animals in this filter.</div>}
            </div>
            {notice && <button className="toast" onClick={() => setNotice("")} aria-label="Dismiss notification">{notice}<span>×</span></button>}
            {selected.length > 0 && currentTask.bulkAction && (
              <div className="bulk-bar"><span>{selected.length} selected</span><button onClick={runBulk}>{currentTask.bulkAction}</button></div>
            )}
          </>
        )}

        <nav className="bottom-nav" aria-label="Primary navigation">
          <button className="active"><span>⌂</span>Work</button>
          <button><span>▦</span>Farm</button>
          <button><span>◎</span>Animals</button>
          <button><span>☷</span>More</button>
        </nav>
      </section>
    </main>
  );
}
