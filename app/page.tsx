"use client";

import { useState } from "react";

type TaskKey = "mating" | "returnCheck" | "pregnancy" | "vaccine" | "movement";
type WorkMode = "guided" | "rapid" | "batch";
type ProgressKind = "bounded" | "window";
type Screen =
  | { name: "home" }
  | { name: "checkin" }
  | { name: "checkin-unit"; unit: number }
  | { name: "task"; task: TaskKey }
  | { name: "unit"; task: TaskKey; unit: number }
  | { name: "review"; task: TaskKey }
  | { name: "complete"; task: TaskKey };

type Unit = { id: number; name: string; pigs: number; pens: number };
type Animal = { id: string; state: "ready" | "waiting" | "done" | "exception"; note: string };
type StatusOption = { key: string; label: string; count: number };
type UnitCheck = {
  unit: number;
  recency: string;
  checkedBy: string;
  healthWatch: number;
  feedActions: number;
  maintenanceActions: number;
};
type ProductionBatch = {
  id: string;
  phase: string;
  day: number;
  unitPigs: Record<number, number>;
};
type UnitTaskMetric = {
  due: number;
  completed: number;
  total: number;
  pens: number;
  detail: string;
};
type TaskWorkGroup = {
  name: string;
  context: string;
  due: number;
  total: number;
  completed: number;
  units: number[];
  unitDue: Record<number, number>;
  windowDay?: number;
  windowDays?: number;
};

const units: Unit[] = [
  { id: 1, name: "Gestation 1", pigs: 86, pens: 8 },
  { id: 2, name: "Gestation 2", pigs: 74, pens: 7 },
  { id: 3, name: "Gestation 3", pigs: 92, pens: 9 },
  { id: 4, name: "Farrow 1", pigs: 68, pens: 6 },
  { id: 5, name: "Farrow 2", pigs: 80, pens: 8 },
];

const unitChecks: UnitCheck[] = [
  { unit: 1, recency: "3 days ago", checkedBy: "Li Wei", healthWatch: 11, feedActions: 2, maintenanceActions: 1 },
  { unit: 2, recency: "Yesterday", checkedBy: "Zhang Min", healthWatch: 0, feedActions: 0, maintenanceActions: 1 },
  { unit: 3, recency: "Today at 08:35", checkedBy: "Chen Yu", healthWatch: 0, feedActions: 0, maintenanceActions: 0 },
  { unit: 4, recency: "4 days ago", checkedBy: "Li Wei", healthWatch: 1, feedActions: 0, maintenanceActions: 0 },
  { unit: 5, recency: "Yesterday", checkedBy: "Wang Lei", healthWatch: 3, feedActions: 1, maintenanceActions: 0 },
];

const productionBatches: ProductionBatch[] = [
  { id: "G-081", phase: "Mid gestation", day: 68, unitPigs: { 1: 45, 2: 42, 3: 50 } },
  { id: "G-094", phase: "Post-service", day: 24, unitPigs: { 1: 25, 2: 20, 3: 27 } },
  { id: "B-107", phase: "Service week", day: 2, unitPigs: { 1: 10, 2: 8, 3: 10 } },
  { id: "F-036", phase: "Farrowing", day: 3, unitPigs: { 4: 34, 5: 41 } },
  { id: "F-041", phase: "Pre-farrow", day: 110, unitPigs: { 4: 29, 5: 33 } },
];

const unbatchedPigs: Record<number, number> = { 1: 6, 2: 4, 3: 5, 4: 5, 5: 6 };

const sectionLifecycle = [
  { phase: "Post-service", batches: 3, pigs: 100, tone: "service" },
  { phase: "Gestating", batches: 3, pigs: 137, tone: "early" },
  { phase: "Pre-farrow", batches: 2, pigs: 62, tone: "mid" },
  { phase: "Farrowing", batches: 2, pigs: 75, tone: "late" },
  { phase: "Unbatched", batches: 0, pigs: 26, tone: "idle" },
];

const tasks: Record<TaskKey, {
  name: string;
  category: string;
  summary: string;
  mode: WorkMode;
  units: number[];
  total: number;
  completed: number;
  due: number;
  waiting: number;
  exceptions: number;
  actions: string[];
  primary: string;
  cadence: string;
  progressKind: ProgressKind;
  progressLabel: string;
  sectionDetail: string;
  sectionPens: number;
  windowDay?: number;
  windowDays?: number;
  workGroups: TaskWorkGroup[];
  unitMetrics: Record<number, UnitTaskMetric>;
}> = {
  mating: {
    name: "Mating",
    category: "Production",
    summary: "12 ready now · 9 waiting for interval",
    mode: "guided",
    units: [1, 2, 3],
    total: 28,
    completed: 7,
    due: 12,
    waiting: 9,
    exceptions: 2,
    actions: ["Record mating"],
    primary: "Record & next",
    cadence: "Individual record · keep semen lot for the pen",
    progressKind: "bounded",
    progressLabel: "Sows fully serviced",
    sectionDetail: "7 first service · 5 repeat",
    sectionPens: 7,
    workGroups: [
      { name: "Current service", context: "Main weekly group", due: 8, total: 20, completed: 6, units: [1, 2, 3], unitDue: { 1: 3, 2: 2, 3: 3 } },
      { name: "Return / re-service", context: "From earlier service groups", due: 3, total: 5, completed: 1, units: [1, 3], unitDue: { 1: 1, 3: 2 } },
      { name: "Replacement gilts", context: "Separate entry schedule", due: 1, total: 3, completed: 0, units: [2], unitDue: { 2: 1 } },
    ],
    unitMetrics: {
      1: { due: 4, completed: 3, total: 10, pens: 2, detail: "3 first · 1 repeat" },
      2: { due: 3, completed: 2, total: 8, pens: 2, detail: "2 first · 1 repeat" },
      3: { due: 5, completed: 2, total: 10, pens: 3, detail: "2 first · 3 repeat" },
    },
  },
  returnCheck: {
    name: "Return check",
    category: "Production",
    summary: "42 pigs in active monitoring",
    mode: "rapid",
    units: [1, 2, 3],
    total: 42,
    completed: 32,
    due: 10,
    waiting: 0,
    exceptions: 2,
    actions: ["No return signs", "Return signs", "Recheck"],
    primary: "Apply result",
    cadence: "Record the current check · monitoring continues",
    progressKind: "window",
    progressLabel: "Return monitoring",
    sectionDetail: "42 pigs monitored · 2 return signs",
    sectionPens: 8,
    windowDay: 3,
    windowDays: 7,
    workGroups: [
      { name: "Early window", context: "Serviced 18–20 days ago", due: 4, total: 16, completed: 12, units: [1, 2], unitDue: { 1: 2, 2: 2 }, windowDay: 2, windowDays: 7 },
      { name: "Main window", context: "Serviced 21–23 days ago", due: 4, total: 18, completed: 14, units: [1, 3], unitDue: { 1: 1, 3: 3 }, windowDay: 4, windowDays: 7 },
      { name: "Follow-up", context: "Extended observation", due: 2, total: 8, completed: 6, units: [1, 3], unitDue: { 1: 1, 3: 1 }, windowDay: 6, windowDays: 7 },
    ],
    unitMetrics: {
      1: { due: 4, completed: 10, total: 14, pens: 3, detail: "14 monitored · 1 return sign" },
      2: { due: 2, completed: 10, total: 12, pens: 2, detail: "12 monitored" },
      3: { due: 4, completed: 12, total: 16, pens: 3, detail: "16 monitored · 1 return sign" },
    },
  },
  pregnancy: {
    name: "Pregnancy check",
    category: "Production",
    summary: "31 due across 3 units",
    mode: "rapid",
    units: [1, 2, 3],
    total: 45,
    completed: 12,
    due: 31,
    waiting: 8,
    exceptions: 1,
    actions: ["Pregnant", "Open", "Recheck"],
    primary: "Apply result",
    cadence: "Choose a result once · tap pigs or apply to all",
    progressKind: "bounded",
    progressLabel: "Current check set",
    sectionDetail: "28 routine · 3 rechecks",
    sectionPens: 9,
    workGroups: [
      { name: "Routine checks", context: "First scheduled pregnancy check", due: 28, total: 40, completed: 12, units: [1, 2, 3], unitDue: { 1: 8, 2: 8, 3: 12 } },
      { name: "Rechecks", context: "Prior uncertain result", due: 3, total: 5, completed: 0, units: [1], unitDue: { 1: 3 } },
    ],
    unitMetrics: {
      1: { due: 11, completed: 4, total: 15, pens: 4, detail: "8 routine · 3 rechecks" },
      2: { due: 8, completed: 4, total: 12, pens: 2, detail: "7 routine · 1 recheck" },
      3: { due: 12, completed: 6, total: 18, pens: 3, detail: "11 routine · 1 recheck" },
    },
  },
  vaccine: {
    name: "Vaccination",
    category: "Health",
    summary: "18 due · one protocol",
    mode: "batch",
    units: [1, 3, 4, 5],
    total: 24,
    completed: 6,
    due: 18,
    waiting: 4,
    exceptions: 2,
    actions: ["Given", "Not eligible", "Not found"],
    primary: "Record given",
    cadence: "Select pigs · apply protocol once",
    progressKind: "bounded",
    progressLabel: "Current protocol",
    sectionDetail: "18 scheduled · 2 exceptions",
    sectionPens: 8,
    workGroups: [
      { name: "Gestation protocol", context: "Current scheduled protocol", due: 10, total: 14, completed: 4, units: [1, 3], unitDue: { 1: 5, 3: 5 } },
      { name: "Farrow protocol", context: "Current scheduled protocol", due: 8, total: 10, completed: 2, units: [4, 5], unitDue: { 4: 4, 5: 4 } },
    ],
    unitMetrics: {
      1: { due: 5, completed: 2, total: 7, pens: 2, detail: "5 scheduled · 1 exception" },
      3: { due: 5, completed: 2, total: 7, pens: 2, detail: "5 scheduled" },
      4: { due: 4, completed: 1, total: 5, pens: 2, detail: "4 scheduled" },
      5: { due: 4, completed: 1, total: 5, pens: 2, detail: "4 scheduled · 1 exception" },
    },
  },
  movement: {
    name: "Move to farrowing",
    category: "Movement",
    summary: "12 eligible · Farrow 1 and Farrow 2",
    mode: "batch",
    units: [4, 5],
    total: 12,
    completed: 0,
    due: 12,
    waiting: 0,
    exceptions: 1,
    actions: ["Add to move", "Hold", "Not found"],
    primary: "Add to movement",
    cadence: "Choose destination once · confirm selected pigs",
    progressKind: "bounded",
    progressLabel: "Movement group",
    sectionDetail: "12 eligible · 1 hold",
    sectionPens: 5,
    workGroups: [
      { name: "Current movement group", context: "Pre-farrow animals", due: 12, total: 12, completed: 0, units: [4, 5], unitDue: { 4: 7, 5: 5 } },
    ],
    unitMetrics: {
      4: { due: 7, completed: 0, total: 7, pens: 3, detail: "7 eligible · 1 hold" },
      5: { due: 5, completed: 0, total: 5, pens: 2, detail: "5 eligible" },
    },
  },
};

const taskStatuses: Record<TaskKey, StatusOption[]> = {
  mating: [
    { key: "all", label: "All cohort", count: 28 },
    { key: "ready", label: "Ready now", count: 12 },
    { key: "waiting", label: "Awaiting interval", count: 9 },
    { key: "first", label: "1st service", count: 11 },
    { key: "complete", label: "Complete", count: 7 },
    { key: "exception", label: "Exceptions", count: 2 },
  ],
  returnCheck: [
    { key: "all", label: "Monitoring group", count: 42 },
    { key: "ready", label: "Due now", count: 10 },
    { key: "complete", label: "Checked this round", count: 32 },
    { key: "recheck", label: "Return signs", count: 2 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
  pregnancy: [
    { key: "all", label: "All cohort", count: 45 },
    { key: "ready", label: "Due now", count: 31 },
    { key: "complete", label: "Pregnant", count: 12 },
    { key: "open", label: "Open", count: 4 },
    { key: "recheck", label: "Recheck", count: 3 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
  vaccine: [
    { key: "all", label: "All cohort", count: 24 },
    { key: "ready", label: "Due now", count: 18 },
    { key: "complete", label: "Given", count: 6 },
    { key: "waiting", label: "Not eligible", count: 2 },
    { key: "exception", label: "Exceptions", count: 2 },
  ],
  movement: [
    { key: "all", label: "All cohort", count: 12 },
    { key: "ready", label: "Eligible", count: 12 },
    { key: "complete", label: "Selected", count: 0 },
    { key: "waiting", label: "On hold", count: 1 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
};

const unitStatuses: Record<TaskKey, StatusOption[]> = {
  mating: [
    { key: "all", label: "All task pigs", count: 6 },
    { key: "ready", label: "Ready now", count: 4 },
    { key: "waiting", label: "Awaiting interval", count: 1 },
    { key: "first", label: "1st service", count: 3 },
    { key: "complete", label: "Complete", count: 1 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
  returnCheck: [
    { key: "all", label: "Monitoring group", count: 14 },
    { key: "ready", label: "Due now", count: 4 },
    { key: "complete", label: "Checked this round", count: 10 },
    { key: "recheck", label: "Return signs", count: 1 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
  pregnancy: [
    { key: "all", label: "All task pigs", count: 6 },
    { key: "ready", label: "Due now", count: 4 },
    { key: "complete", label: "Pregnant", count: 1 },
    { key: "recheck", label: "Recheck", count: 1 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
  vaccine: [
    { key: "all", label: "All task pigs", count: 6 },
    { key: "ready", label: "Due now", count: 4 },
    { key: "complete", label: "Given", count: 1 },
    { key: "waiting", label: "Not eligible", count: 1 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
  movement: [
    { key: "all", label: "All task pigs", count: 6 },
    { key: "ready", label: "Eligible", count: 4 },
    { key: "complete", label: "Selected", count: 1 },
    { key: "waiting", label: "On hold", count: 1 },
    { key: "exception", label: "Exceptions", count: 1 },
  ],
};

const penAnimals: Animal[] = [
  { id: "000341", state: "ready", note: "Due now · Parity 3" },
  { id: "000358", state: "ready", note: "Due now · Parity 2" },
  { id: "000366", state: "ready", note: "Due now · Parity 4" },
  { id: "000372", state: "ready", note: "Due now · Parity 1" },
  { id: "000389", state: "waiting", note: "Available at 14:30" },
  { id: "000402", state: "done", note: "Recorded 08:42 · Li Wei" },
];

const taskContext: Record<TaskKey, Record<string, string>> = {
  mating: {
    "000341": "Heat confirmed 10:05 · 1st service",
    "000358": "Heat confirmed 09:52 · 2nd service",
    "000366": "Heat confirmed 09:31 · 1st service",
    "000372": "Heat confirmed 09:18 · 1st service",
    "000389": "23h 12m since first service",
    "000402": "2 services complete · JY-240813-05",
  },
  returnCheck: {
    "000341": "Day 20 after service · no signs recorded",
    "000358": "Day 21 after service · no signs recorded",
    "000366": "Day 22 after service · observe standing response",
    "000372": "Day 19 after service · no signs recorded",
    "000389": "Next observation round at 14:30",
    "000402": "No return signs · checked 08:42",
  },
  pregnancy: {
    "000341": "Day 28 after mating · Service 1",
    "000358": "Day 31 after mating · Service 2",
    "000366": "Day 29 after mating · Service 1",
    "000372": "Day 27 after mating · Service 1",
    "000389": "Check window begins tomorrow",
    "000402": "Pregnant · checked 08:42",
  },
  vaccine: {
    "000341": "Erysipelas · 2 ml · IM",
    "000358": "Erysipelas · 2 ml · IM",
    "000366": "Erysipelas · 2 ml · IM",
    "000372": "Erysipelas · 2 ml · IM",
    "000389": "Withdrawal restriction until tomorrow",
    "000402": "Given · Lot ERY-84A",
  },
  movement: {
    "000341": "Eligible · Farrow 2",
    "000358": "Eligible · Farrow 2",
    "000366": "Eligible · Farrow 2",
    "000372": "Eligible · Farrow 2",
    "000389": "Treatment withdrawal check required",
    "000402": "Added to movement M-0813",
  },
};

const completedAtStart: Record<TaskKey, number[]> = {
  mating: [4],
  returnCheck: [4],
  pregnancy: [3, 4],
  vaccine: [],
  movement: [],
};

function taskKeys(): TaskKey[] {
  return ["mating", "returnCheck", "pregnancy", "vaccine", "movement"];
}

function getUnit(id: number) {
  return units.find((unit) => unit.id === id)!;
}

function unitShortName(unit: Unit) {
  const [name, number] = unit.name.split(" ");
  return `${name.slice(0, 1)}${number}`;
}

function unitCheckSignals(check: UnitCheck) {
  return [
    check.healthWatch > 0 ? `${check.healthWatch} health watch` : "",
    check.feedActions > 0 ? `${check.feedActions} feed adjustments` : "",
    check.maintenanceActions > 0 ? `${check.maintenanceActions} maintenance` : "",
  ].filter(Boolean).join(" · ");
}

function unitFlagCount(check: UnitCheck) {
  return check.healthWatch + check.feedActions + check.maintenanceActions;
}

function workGroupDueBreakdown(groups: TaskWorkGroup[], unitId?: number) {
  return groups
    .map((group) => ({ name: group.name, due: unitId === undefined ? group.due : group.unitDue[unitId] ?? 0 }))
    .filter((group) => group.due > 0)
    .map((group) => `${group.name} ${group.due}`)
    .join(" · ");
}

function workGroupUnitSplit(group: TaskWorkGroup) {
  return group.units
    .filter((unitId) => (group.unitDue[unitId] ?? 0) > 0)
    .map((unitId) => `${unitShortName(getUnit(unitId))} ${group.unitDue[unitId]}`)
    .join(" · ");
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [unitFilter, setUnitFilter] = useState<"all" | number>("all");
  const [completedUnits, setCompletedUnits] = useState<Record<TaskKey, number[]>>(completedAtStart);
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [activeOutcome, setActiveOutcome] = useState("Pregnant");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeRecord, setActiveRecord] = useState<{ id: string; pen: string } | null>(null);
  const [expandedPen, setExpandedPen] = useState<string | null>("A2");
  const [keepSetting, setKeepSetting] = useState(true);
  const [notice, setNotice] = useState("");
  const [checkinFilter, setCheckinFilter] = useState<"all" | "watch" | "feed" | "maintenance">("all");
  const [checkinResolved, setCheckinResolved] = useState<string[]>([]);
  const [clearPensChecked, setClearPensChecked] = useState(false);

  const activeTask = "task" in screen ? tasks[screen.task] : undefined;
  const activeUnit = "unit" in screen ? getUnit(screen.unit) : undefined;
  const activeUnitMetric = activeTask && activeUnit ? activeTask.unitMetrics[activeUnit.id] : undefined;
  const activeWindowDays = activeTask?.workGroups.map((group) => group.windowDay).filter((day): day is number => day !== undefined) ?? [];
  const activeWindowStart = activeWindowDays.length ? Math.min(...activeWindowDays) : undefined;
  const activeWindowEnd = activeWindowDays.length ? Math.max(...activeWindowDays) : undefined;
  const currentRoundComplete = "task" in screen && "unit" in screen
    ? completedUnits[screen.task].includes(screen.unit)
    : false;

  const visibleTasks = taskKeys().filter((key) => unitFilter === "all" || tasks[key].units.includes(unitFilter));
  const scopedCheck = unitFilter === "all" ? undefined : unitChecks.find((check) => check.unit === unitFilter);
  const activeCheck = "unit" in screen ? unitChecks.find((check) => check.unit === screen.unit) : undefined;
  const healthWatchTotal = unitChecks.reduce((total, check) => total + check.healthWatch, 0);
  const feedAdjustmentTotal = unitChecks.reduce((total, check) => total + check.feedActions, 0);
  const maintenanceTotal = unitChecks.reduce((total, check) => total + check.maintenanceActions, 0);
  const scopedUnit = unitFilter === "all" ? undefined : getUnit(unitFilter);
  const overviewPigs = scopedUnit?.pigs ?? units.reduce((total, unit) => total + unit.pigs, 0);
  const overviewPens = scopedUnit?.pens ?? units.reduce((total, unit) => total + unit.pens, 0);
  const scopedBatches = productionBatches.map((batch) => ({
    ...batch,
    pigs: unitFilter === "all" ? Object.values(batch.unitPigs).reduce((total, pigs) => total + pigs, 0) : batch.unitPigs[unitFilter] ?? 0,
  })).filter((batch) => batch.pigs > 0);
  const scopedUnbatched = unitFilter === "all" ? Object.values(unbatchedPigs).reduce((total, pigs) => total + pigs, 0) : unbatchedPigs[unitFilter] ?? 0;
  const sectionBatchCount = sectionLifecycle.reduce((total, item) => total + item.batches, 0);
  const overviewHealth = scopedCheck?.healthWatch ?? healthWatchTotal;
  const overviewFeed = scopedCheck?.feedActions ?? feedAdjustmentTotal;
  const overviewMaintenance = scopedCheck?.maintenanceActions ?? maintenanceTotal;
  const sectionFlagCount = unitChecks.reduce((total, check) => total + unitFlagCount(check), 0);

  const animalOutcome = (pen: string, id: string) => {
    if (!("task" in screen) || !("unit" in screen)) return "";
    return outcomes[`${screen.task}-${screen.unit}-${pen}-${id}`] || (currentRoundComplete ? "Recorded" : "");
  };
  const singleAnimal = penAnimals[0];
  const multiAnimals = penAnimals.slice(1);
  const singleOutcome = animalOutcome("A1", singleAnimal.id);
  const readyAnimals = multiAnimals.filter((animal) => animal.state === "ready" && !animalOutcome("A2", animal.id));
  const unitWorkCompleted = Boolean(singleOutcome) && readyAnimals.length === 0;
  const completedAnimals = activeTask
    ? Math.min(activeTask.total, activeTask.completed + Object.keys(outcomes).filter((key) => key.startsWith(`${"task" in screen ? screen.task : ""}-`)).length)
    : 0;
  const taskProgress = activeTask ? Math.round((completedAnimals / activeTask.total) * 100) : 0;

  const matchesStatus = (animal: Animal, pen: string) => {
    const result = animalOutcome(pen, animal.id);
    const context = "task" in screen ? taskContext[screen.task][animal.id] : "";
    if (statusFilter === "all") return true;
    if (statusFilter === "ready") return animal.state === "ready" && !result;
    if (statusFilter === "waiting") return animal.state === "waiting";
    if (statusFilter === "first") return context.includes("1st service") && !result;
    if (statusFilter === "complete") return animal.state === "done" || Boolean(result);
    if (statusFilter === "recheck") return context.toLowerCase().includes("recheck");
    return false;
  };
  const singleVisible = statusFilter !== "exception" && matchesStatus(singleAnimal, "A1");
  const visibleMultiAnimals = statusFilter === "exception" ? [] : multiAnimals.filter((animal) => matchesStatus(animal, "A2"));

  const go = (next: Screen) => {
    setScreen(next);
    setSelected([]);
    setActiveRecord(null);
    setNotice("");
    setStatusFilter("all");
    if ("task" in next && next.task === "pregnancy") setActiveOutcome("Pregnant");
    if ("task" in next && next.task === "returnCheck") setActiveOutcome("No return signs");
  };

  const back = () => {
    if (screen.name === "checkin") go({ name: "home" });
    if (screen.name === "checkin-unit") go({ name: "checkin" });
    if (screen.name === "task") go({ name: "home" });
    if (screen.name === "unit") go(unitFilter === screen.unit ? { name: "home" } : { name: "task", task: screen.task });
    if (screen.name === "review") go({ name: "task", task: screen.task });
    if (screen.name === "complete") go({ name: "home" });
  };

  const resolveCheckin = (item: string) => {
    setCheckinResolved((current) => current.includes(item) ? current : [...current, item]);
  };
  const checkinReady = clearPensChecked && ["watch", "feed", "maintenance", "treatment"].every((item) => checkinResolved.includes(item));

  const openTask = (task: TaskKey) => {
    if (unitFilter === "all") go({ name: "task", task });
    else go({ name: "unit", task, unit: unitFilter });
  };

  const applyOutcome = (animalIds: string[], result: string, pen: string) => {
    if (!("task" in screen) || !("unit" in screen)) return;
    setOutcomes((current) => {
      const next = { ...current };
      animalIds.forEach((id) => { next[`${screen.task}-${screen.unit}-${pen}-${id}`] = result; });
      return next;
    });
    setSelected([]);
    setNotice(`${result} recorded for ${animalIds.length} ${animalIds.length === 1 ? "pig" : "pigs"}`);
  };

  const saveAndNext = () => {
    if (screen.name !== "unit" || !activeRecord) return;
    const result = screen.task === "mating" ? "Mated · JY-240813-07" : "Recorded";
    if (activeRecord.pen === "A1") {
      applyOutcome([activeRecord.id], result, "A1");
      const next = readyAnimals[0];
      setExpandedPen("A2");
      setActiveRecord(next ? { id: next.id, pen: "A2" } : null);
      return;
    }
    const currentIndex = readyAnimals.findIndex((animal) => animal.id === activeRecord.id);
    applyOutcome([activeRecord.id], result, "A2");
    const next = readyAnimals[currentIndex + 1] ?? readyAnimals.find((animal) => animal.id !== activeRecord.id);
    setActiveRecord(next ? { id: next.id, pen: "A2" } : null);
  };

  const closeUnitRound = () => {
    if (screen.name !== "unit") return;
    setCompletedUnits((current) => ({
      ...current,
      [screen.task]: Array.from(new Set([...current[screen.task], screen.unit])),
    }));
    go({ name: "task", task: screen.task });
  };

  const completedCount = activeTask && "task" in screen ? completedUnits[screen.task].length : 0;
  const allUnitsComplete = activeTask ? completedCount === activeTask.units.length : false;

  return (
    <main className="wireframe-stage">
      <aside className="design-rail" aria-label="Wireframe interaction guide">
        <p className="rail-kicker">SENTRI MOBILE · WIREFRAME 02</p>
        <h1>Plan by task.<br />Work by place.</h1>
        <p className="rail-copy">
          One execution shell changes its action behavior—not its navigation—according to the task.
        </p>
        <ol className="flow-steps">
          <li className={screen.name === "home" ? "current" : ""}><span>1</span><div><strong>Overview</strong><small>See shared work across units</small></div></li>
          <li className={screen.name === "checkin" || screen.name === "checkin-unit" ? "current" : ""}><span>•</span><div><strong>Unit checks</strong><small>Recurring inspection in the animal workspace</small></div></li>
          <li className={screen.name === "task" ? "current" : ""}><span>2</span><div><strong>Task plan</strong><small>Choose the next unit</small></div></li>
          <li className={screen.name === "unit" ? "current" : ""}><span>3</span><div><strong>Unit work</strong><small>Execute directly inside each pen</small></div></li>
          <li className={screen.name === "review" || screen.name === "complete" ? "current" : ""}><span>4</span><div><strong>Completion</strong><small>Review consequences once</small></div></li>
        </ol>
        <p className="rail-note">Try Pregnancy check for rapid entry, Vaccination for bulk selection, and Mating for guided “save & next”.</p>
      </aside>

      <section className="mobile-shell" aria-label="Sentri mobile prototype">
        <div className="status-bar"><span>9:41</span><span>● ● ▰</span></div>

        {screen.name === "home" && (
          <>
            <header className="topbar home-topbar">
              <div><p>Green Valley · North Zone</p><h2>Production Section 1</h2></div>
              <button className="quiet-icon" aria-label="More options">•••</button>
            </header>

            <section className="scope-block">
              <div className="section-label"><strong>Work scope</strong></div>
              <div className="scope-scroll-frame">
                <div className="scope-scroll" aria-label="Filter tasks by unit">
                  <button className={`${unitFilter === "all" ? "active" : ""} has-attention`} onClick={() => setUnitFilter("all")}><strong>All</strong><small>{sectionFlagCount} flagged</small></button>
                  {units.map((unit) => {
                    const check = unitChecks.find((item) => item.unit === unit.id)!;
                    const flags = unitFlagCount(check);
                    return <button key={unit.id} className={`${unitFilter === unit.id ? "active" : ""} ${flags > 0 ? "has-attention" : "is-clear"}`} onClick={() => setUnitFilter(unit.id)}>
                      <strong>{unit.name}</strong><small>{flags > 0 ? `${flags} flagged` : "Clear"}</small>
                    </button>;
                  })}
                </div>
              </div>
            </section>

            {unitFilter === "all" ? (
              <section className="section-overview-card" aria-label="Section population and batch spread">
                <header className="section-overview-head">
                  <div><span>Section overview</span><strong><b>{overviewPigs}</b> pigs</strong><small>{units.length} units · {overviewPens} pens · {sectionBatchCount} batches · {scopedUnbatched} unbatched</small></div>
                </header>
                <div className="stage-rail-block">
                  <div className="stage-rail-heading"><span className="overview-label">Production stages</span><small>Swipe to scan</small></div>
                  <div className="stage-rail" aria-label="Pig distribution by production stage">
                    {sectionLifecycle.map((item) => (
                      <div className={`stage-chip ${item.tone}`} key={item.phase}>
                        <span>{item.phase}</span>
                        <strong>{item.pigs}<small> pigs</small></strong>
                        <b>{item.batches > 0 ? `${item.batches} batches` : "Not in batch"}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="unit-overview-card" aria-label="Unit population, batches and action items">
                <header className="unit-overview-head">
                  <div><span>Unit overview</span><strong><b>{overviewPigs}</b> pigs <i>·</i> {overviewPens} pens</strong><small>{scopedBatches.length} batches · {scopedUnbatched} unbatched · checked {scopedCheck?.recency}</small></div>
                  <button onClick={() => go({ name: "checkin-unit", unit: unitFilter })}>View animals <b>›</b></button>
                </header>
                <div className="stage-rail-block">
                  <div className="stage-rail-heading"><span className="overview-label">Production groups</span><small>{scopedBatches.length + (scopedUnbatched > 0 ? 1 : 0)} groups</small></div>
                  <div className="stage-rail" aria-label="Batches and their current production stages">
                    {scopedBatches.map((batch) => (
                      <div className="stage-chip batch-chip" key={batch.id}>
                        <span>{batch.phase}</span>
                        <strong>{batch.pigs}<small> pigs</small></strong>
                        <b>Day {batch.day}</b>
                      </div>
                    ))}
                    {scopedUnbatched > 0 && (
                      <div className="stage-chip idle">
                        <span>Unbatched</span>
                        <strong>{scopedUnbatched}<small> pigs</small></strong>
                        <b>Weaned / open</b>
                      </div>
                    )}
                  </div>
                </div>
                <div className="compact-attention-row">
                  <span>Attention</span>
                  {overviewHealth > 0 && <b className="health"><strong>{overviewHealth}</strong> health</b>}
                  {overviewFeed > 0 && <b className="feed"><strong>{overviewFeed}</strong> feed</b>}
                  {overviewMaintenance > 0 && <b className="maintenance"><strong>{overviewMaintenance}</strong> maintenance</b>}
                  {overviewHealth + overviewFeed + overviewMaintenance === 0 && <b className="clear">✓ None</b>}
                </div>
              </section>
            )}

            <div className="scroll-area home-scroll">
              <div className="list-heading"><div><p>Needs action</p><h3>{unitFilter === "all" ? "Work across this section" : `Work in ${getUnit(unitFilter).name}`}</h3></div><button>Filter</button></div>
              <div className={`task-list ${unitFilter === "all" ? "section-task-list" : "unit-task-list"}`}>
                {visibleTasks.map((key) => {
                  const task = tasks[key];
                  const unitMetric = unitFilter === "all" ? undefined : task.unitMetrics[unitFilter];
                  const due = unitMetric?.due ?? task.due;
                  const completed = unitMetric?.completed ?? task.completed;
                  const total = unitMetric?.total ?? task.total;
                  const scopedWorkGroups = unitFilter === "all" ? task.workGroups : task.workGroups.filter((group) => group.units.includes(unitFilter));
                  const scopedWindowDays = scopedWorkGroups.map((group) => group.windowDay).filter((day): day is number => day !== undefined);
                  const scopedWindowStart = scopedWindowDays.length ? Math.min(...scopedWindowDays) : undefined;
                  const scopedWindowEnd = scopedWindowDays.length ? Math.max(...scopedWindowDays) : undefined;
                  const progress = Math.round((completed / total) * 100);
                  if (unitFilter === "all") {
                    const sectionProgress = task.progressKind === "bounded"
                      ? `${completed} of ${total} recorded`
                      : `Monitoring days ${scopedWindowStart}–${scopedWindowEnd}`;
                    return (
                      <button className="section-task-row" key={key} onClick={() => openTask(key)}>
                        <span className={`task-symbol ${key}`} aria-hidden="true">{key === "mating" ? "M" : key === "returnCheck" ? "R" : key === "pregnancy" ? "P" : key === "vaccine" ? "+" : "→"}</span>
                        <span className="section-task-copy">
                          <strong>{task.name}</strong>
                          <span>{task.workGroups.length} {task.progressKind === "window" ? "monitoring" : "work"} groups · {task.units.length} units · {sectionProgress}</span>
                          <small>{workGroupDueBreakdown(task.workGroups)}</small>
                        </span>
                        <span className="section-task-due"><strong>{due}</strong><small>due now</small></span>
                        <span className="chevron">›</span>
                      </button>
                    );
                  }
                  return (
                    <button className={`task-row task-card-v2 unit-execution-card ${task.progressKind}`} key={key} onClick={() => openTask(key)}>
                      <span className={`task-symbol ${key}`} aria-hidden="true">{key === "mating" ? "M" : key === "returnCheck" ? "R" : key === "pregnancy" ? "P" : key === "vaccine" ? "+" : "→"}</span>
                      <span className="task-card-body">
                        <span className="task-card-kicker"><em>{unitMetric?.pens ?? 0} pens affected</em><em>{scopedWorkGroups.length} {task.progressKind === "window" ? "monitoring" : "work"} groups</em></span>
                        <strong className="task-card-name">{task.name}</strong>
                        <span className="task-card-context">{workGroupDueBreakdown(scopedWorkGroups, unitFilter)}</span>
                        {task.progressKind === "bounded" ? (
                          <span className="task-card-progress">
                            <span><b>{task.progressLabel}</b><em>{completed} of {total}</em></span>
                            <i><b style={{ width: `${progress}%` }} /></i>
                          </span>
                        ) : (
                          <span className="task-card-window">
                            <span><b>{task.progressLabel}</b><em>Days {scopedWindowStart}–{scopedWindowEnd} of {task.windowDays}</em></span>
                            <span className="task-card-group-days">{scopedWorkGroups.map((group) => <b key={group.name}>Day {group.windowDay}</b>)}</span>
                          </span>
                        )}
                      </span>
                      <span className="task-card-action"><strong>{due}</strong><small>due now</small><b>›</b></span>
                    </button>
                  );
                })}
              </div>
              <p className="context-note">Everyone sees the same live work. Filtering changes the scope, not ownership.</p>
            </div>
          </>
        )}

        {screen.name === "checkin" && (
          <>
            <header className="topbar">
              <button className="back" onClick={back} aria-label="Back">‹</button>
              <div><p>Production Section 1 · All units</p><h2>Unit checks</h2></div>
              <button className="quiet-icon" aria-label="Inspection history">•••</button>
            </header>
            <section className="inspection-recency-card">
              <div><span>Check history</span><strong>See when each unit was last checked</strong><p>There is no automatic due date. Workers can enter any unit to inspect animals or handle open items.</p></div>
              <div className="recency-metrics"><span><b>Today</b> most recent</span><span><b>4 days</b> oldest check</span><span><b>4</b> units</span></div>
            </section>
            <div className="scroll-area checkin-scroll">
              <div className="checkin-attention-summary">
                <div><strong>{healthWatchTotal}</strong><span>animals on health watch</span></div>
                <p><b>{feedAdjustmentTotal}</b> feed adjustments · <b>{maintenanceTotal}</b> maintenance</p>
              </div>
              <div className="list-heading"><div><p>Work scope</p><h3>Inspection status by unit</h3></div><button>History</button></div>
              <div className="checkin-unit-list">
                {unitChecks.map((check) => {
                  const unit = getUnit(check.unit);
                  const hasOpenItems = check.healthWatch > 0 || check.feedActions > 0 || check.maintenanceActions > 0;
                  return <button key={check.unit} className={`checkin-unit-card ${hasOpenItems ? "attention" : "clear"}`} onClick={() => go({ name: "checkin-unit", unit: check.unit })}>
                    <span className="checkin-unit-code">{unitShortName(unit)}</span>
                    <span className="checkin-unit-copy"><strong>{unit.name}</strong><small>Last checked {check.recency} · {check.checkedBy}</small>{hasOpenItems ? <span className="unit-open-items">{unitCheckSignals(check)}</span> : <span className="unit-clear-state">No open items</span>}</span>
                    <em>View animals</em><span className="chevron">›</span>
                  </button>;
                })}
              </div>
              <div className="checkin-principle"><strong>One animal workspace</strong><span>Opening a unit shows its pens and animal rows. Workers can inspect normally, handle marked animals, and complete feed or maintenance actions in context.</span></div>
            </div>
          </>
        )}

        {screen.name === "checkin-unit" && activeUnit && (
          <>
            <header className="topbar compact-topbar">
              <button className="back" onClick={back} aria-label="Back">‹</button>
              <div><p>Unit checks · Production Section 1</p><h2>{activeUnit.name}</h2></div>
              <button className="quiet-icon" aria-label="Scan animal">⌗</button>
            </header>
            <section className="last-inspection-strip">
              <div><span>Last checked</span><strong>{activeCheck?.recency} · {activeCheck?.checkedBy}</strong></div>
              <div><span>Open now</span><strong>{activeCheck && unitCheckSignals(activeCheck) ? unitCheckSignals(activeCheck) : "No open items"}</strong></div>
            </section>
            <section className="checkin-unit-summary">
              <div><strong>{activeUnit.pigs}</strong><span>animals</span></div>
              <div><strong>{activeUnit.pens}</strong><span>pens</span></div>
              <button>Check history</button>
            </section>
            <div className="checkin-filter" aria-label="Filter check-in items">
              {([
                ["all", "All animals", activeUnit.pigs], ["watch", "Health watch", activeCheck?.healthWatch ?? 0], ["feed", "Feed adjustments", activeCheck?.feedActions ?? 0], ["maintenance", "Maintenance", activeCheck?.maintenanceActions ?? 0],
              ] as const).map(([key, label, count]) => <button key={key} className={checkinFilter === key ? "active" : ""} onClick={() => setCheckinFilter(key)}><strong>{count}</strong><span>{label}</span></button>)}
            </div>
            <div className="scroll-area checkin-unit-scroll">
              {(checkinFilter === "all" || checkinFilter === "watch" || checkinFilter === "feed") && (
                <section className="inspection-pen attention">
                  <header><span className="inspection-pen-code">A1</span><div><strong>Attention in this pen</strong><small>18 pigs · 1 health watch · feed adjustment</small></div><span>2 items</span></header>
                  {(checkinFilter === "all" || checkinFilter === "watch") && <div className={`inspection-item health ${checkinResolved.includes("watch") ? "resolved" : ""}`}>
                    <div className="inspection-item-head"><span className="marker-dot">!</span><div><strong>000341 · Health watch</strong><small>Reduced appetite yesterday · observe today</small></div>{checkinResolved.includes("watch") && <b>Checked</b>}</div>
                    {!checkinResolved.includes("watch") && <div className="inspection-actions"><button onClick={() => resolveCheckin("watch")}>Normal today</button><button>Add observation</button><button>Start treatment</button></div>}
                  </div>}
                  {(checkinFilter === "all" || checkinFilter === "feed") && <div className={`inspection-item feed ${checkinResolved.includes("feed") ? "resolved" : ""}`}>
                    <div className="inspection-item-head"><span className="marker-dot">F</span><div><strong>Feed adjustment</strong><small>Pen target 2.4 kg/pig/day · reduce by 0.2 kg today</small></div>{checkinResolved.includes("feed") && <b>Confirmed</b>}</div>
                    {!checkinResolved.includes("feed") && <div className="inspection-actions"><button onClick={() => resolveCheckin("feed")}>Confirm −0.2 kg</button><button>Change amount</button></div>}
                  </div>}
                </section>
              )}

              {(checkinFilter === "all" || checkinFilter === "maintenance") && <section className="inspection-pen maintenance">
                <header><span className="inspection-pen-code">A2</span><div><strong>Equipment observation</strong><small>20 pigs · feeder 2</small></div><span>Maintenance</span></header>
                <div className={`inspection-item equipment ${checkinResolved.includes("maintenance") ? "resolved" : ""}`}><div className="inspection-item-head"><span className="marker-dot">M</span><div><strong>Feeder motor noise</strong><small>Reported yesterday · verify operation and add photo</small></div>{checkinResolved.includes("maintenance") && <b>Handed off</b>}</div>{!checkinResolved.includes("maintenance") && <div className="inspection-actions"><button onClick={() => resolveCheckin("maintenance")}>Create maintenance item</button><button>Working normally</button></div>}</div>
              </section>}

              {(checkinFilter === "all" || checkinFilter === "watch") && <section className="inspection-pen treatment">
                <header><span className="inspection-pen-code">B1</span><div><strong>Health follow-up</strong><small>20 pigs · 1 pig marked</small></div><span>Health watch</span></header>
                <div className={`inspection-item health ${checkinResolved.includes("treatment") ? "resolved" : ""}`}><div className="inspection-item-head"><span className="marker-dot">+</span><div><strong>000389 · Recheck temperature</strong><small>Treated 12 Aug · Amoxicillin · withdrawal active</small></div>{checkinResolved.includes("treatment") && <b>Recorded</b>}</div>{!checkinResolved.includes("treatment") && <div className="inspection-actions"><button onClick={() => resolveCheckin("treatment")}>Record follow-up</button><button>Escalate</button></div>}</div>
              </section>}

              {checkinFilter === "all" && <section className={`clear-pens ${clearPensChecked ? "complete" : ""}`}><div><strong>5 pens without alerts</strong><span>{clearPensChecked ? "Recorded as checked at 09:41" : "A3, A4, B2, B3, B4 · no existing markers"}</span></div><button onClick={() => setClearPensChecked(true)} disabled={clearPensChecked}>{clearPensChecked ? "Checked ✓" : "Mark checked"}</button></section>}
              <p className="context-note">Health markers persist between inspections until deliberately cleared. Recording a normal check does not erase the animal’s history.</p>
            </div>
            <div className="sticky-footer"><button className="secondary-action" onClick={() => go({ name: "checkin" })}>Save & leave</button><button className="primary-action" disabled={!checkinReady} onClick={() => go({ name: "checkin" })}>{checkinReady ? "Record unit check" : `${(clearPensChecked ? 0 : 1) + Math.max(0, 4 - checkinResolved.length)} items remaining`}</button></div>
          </>
        )}

        {screen.name === "task" && activeTask && (
          <>
            <header className="topbar">
              <button className="back" onClick={back} aria-label="Back">‹</button>
              <div><p>{activeTask.category} · Today</p><h2>{activeTask.name}</h2></div>
              <button className="quiet-icon" aria-label="Task details">•••</button>
            </header>
            {activeTask.progressKind === "bounded" ? (
              <section className="cohort-progress">
                <div className="cohort-progress-head">
                  <div><p>{activeTask.progressLabel}</p><strong>{completedAnimals} of {activeTask.total} complete</strong><span>Current eligible work set</span></div>
                  <b>{taskProgress}%</b>
                </div>
                <div className="cohort-track"><i style={{ width: `${taskProgress}%` }} /></div>
                <div className="cohort-metrics">
                  <div className="due"><strong>{activeTask.due}</strong><span>ready now</span></div>
                  <div><strong>{activeTask.waiting}</strong><span>waiting</span></div>
                  <div><strong>{activeTask.exceptions}</strong><span>exceptions</span></div>
                </div>
              </section>
            ) : (
              <section className="cohort-progress monitoring-progress">
                <div className="cohort-progress-head">
                  <div><p>{activeTask.progressLabel}</p><strong>{activeTask.workGroups.length} groups under monitoring</strong><span>{activeTask.total} pigs · days {activeWindowStart}–{activeWindowEnd} of {activeTask.windowDays}</span></div>
                  <b>{activeTask.due} due</b>
                </div>
                <div className="cohort-metrics">
                  <div className="due"><strong>{activeTask.due}</strong><span>check now</span></div>
                  <div><strong>{activeTask.completed}</strong><span>checked this round</span></div>
                  <div><strong>{activeTask.exceptions}</strong><span>return signs</span></div>
                </div>
              </section>
            )}
            <div className="scroll-area task-scroll">
              <section className="work-group-panel">
                <header><div><strong>Work sources</strong><span>Production groups contributing to this task</span></div><b>{activeTask.workGroups.length} groups</b></header>
                <div className="work-group-list">
                  {activeTask.workGroups.map((group) => (
                    <div className="work-group-row" key={group.name}>
                      <span><strong>{group.name}</strong><small>{group.context} · {group.units.length} {group.units.length === 1 ? "unit" : "units"}</small></span>
                      <span className="work-group-state"><strong>{group.due}</strong><small>due</small></span>
                      <span className="work-group-stage">{activeTask.progressKind === "window" ? `Day ${group.windowDay} of ${group.windowDays}` : `${group.completed} of ${group.total} recorded`} · {workGroupUnitSplit(group)}</span>
                    </div>
                  ))}
                </div>
              </section>
              <div className="cohort-scope-note"><strong>Route follows current location</strong><span>A production group may be split across units. The unit route below combines all groups without losing their source.</span></div>
              <div className="status-preview" aria-label="Task status overview">
                {taskStatuses[screen.task].slice(1).map((status) => <div key={status.key}><strong>{status.count}</strong><span>{status.label}</span></div>)}
              </div>
              <div className="list-heading route-heading"><div><p>Unit route</p><h3>Continue where work is due</h3></div><button>Sort</button></div>
              <div className="unit-list route-list">
                {activeTask.units.map((unitId) => {
                  const unit = getUnit(unitId);
                  const complete = completedUnits[screen.task].includes(unitId);
                  const recommended = !complete && unitId === activeTask.units.find((id) => !completedUnits[screen.task].includes(id));
                  const unitDue = activeTask.unitMetrics[unitId]?.due ?? 0;
                  const unitGroups = activeTask.workGroups.filter((group) => (group.unitDue[unitId] ?? 0) > 0);
                  return (
                    <button className={`unit-row ${complete ? "complete" : ""}`} key={unitId} onClick={() => go({ name: "unit", task: screen.task, unit: unitId })}>
                      <span className="route-index">{activeTask.units.indexOf(unitId) + 1}</span>
                      <span className="unit-code">{unitShortName(unit)}</span>
                      <span className="unit-copy"><strong>{unit.name}</strong><small>{unitGroups.length} {activeTask.progressKind === "window" ? "monitoring" : "work"} groups · {workGroupDueBreakdown(unitGroups, unitId)}</small><span className="unit-route-progress"><i style={{ width: complete ? "100%" : recommended ? "36%" : "18%" }} /></span>{recommended && <em>Recommended next</em>}</span>
                      <span className="unit-state">{complete ? <><b>✓</b><small>closed</small></> : <><strong>{unitDue}</strong><small>due now</small></>}</span>
                      <span className="chevron">›</span>
                    </button>
                  );
                })}
              </div>
              <section className="method-note"><strong>Recording method</strong><span>{activeTask.cadence}</span></section>
            </div>
            <div className="sticky-footer">
              <button className="secondary-action" onClick={() => go({ name: "review", task: screen.task })}>Review task</button>
              <button className="primary-action" disabled={!allUnitsComplete} onClick={() => go({ name: "review", task: screen.task })}>{allUnitsComplete ? "Review & complete" : "Complete remaining unit"}</button>
            </div>
          </>
        )}

        {screen.name === "unit" && activeTask && activeUnit && (
          <>
            <header className="topbar compact-topbar">
              <button className="back" onClick={back} aria-label="Back">‹</button>
              <div><p>{activeTask.name} · {activeTask.units.indexOf(activeUnit.id) + 1} of {activeTask.units.length} units</p><h2>{activeUnit.name}</h2></div>
              <button className="quiet-icon" aria-label="Scan animal">⌗</button>
            </header>
            <section className="unit-overview">
              <div><strong>{activeUnit.pigs}</strong><span>pigs</span></div>
              <div><strong>{activeUnit.pens}</strong><span>pens</span></div>
              <div><strong>{activeUnitMetric?.due ?? ((singleOutcome ? 0 : 1) + readyAnimals.length)}</strong><span>due now</span></div>
              <button aria-label="Search animals">Search</button>
            </section>
            <section className="task-scope-banner">
              <div>
                <strong>{activeUnitMetric?.total ?? unitStatuses[screen.task][0].count} pigs in this work set</strong>
                <span>{workGroupDueBreakdown(activeTask.workGroups.filter((group) => (group.unitDue[activeUnit.id] ?? 0) > 0), activeUnit.id)}</span>
              </div>
              <button>Open all animals</button>
            </section>

            <div className="status-filter-wrap">
              <div className="status-filter-label"><strong>Status</strong><span>Filters this task cohort</span></div>
              <div className="status-filter" aria-label={`Filter ${activeTask.name} pigs by status`}>
                {unitStatuses[screen.task].map((status) => <button key={status.key} className={statusFilter === status.key ? "active" : ""} onClick={() => setStatusFilter(status.key)}><strong>{status.count}</strong><span>{status.label}</span></button>)}
              </div>
            </div>

            {activeTask.mode === "rapid" && (
              <section className="fast-entry unit-fast-entry">
                <div><p>Fast entry</p><strong>Choose once, then tap pigs</strong></div>
                <div className="outcome-switch" aria-label="Choose result">
                  {activeTask.actions.map((action) => <button key={action} className={activeOutcome === action ? "active" : ""} onClick={() => setActiveOutcome(action)}>{action}</button>)}
                </div>
              </section>
            )}
            {activeTask.mode === "batch" && (
              <section className="batch-context unit-task-context">
                <div><p>{screen.task === "vaccine" ? "Protocol" : "Destination"}</p><strong>{screen.task === "vaccine" ? "Erysipelas · 2 ml · Lot ERY-84A" : "Farrow 2 · 15 Aug"}</strong></div><button>Change</button>
              </section>
            )}
            {activeTask.mode === "guided" && (
              <section className="batch-context guided-context unit-task-context">
                <div><p>Guided record</p><strong>Semen JY-240813-07</strong><span>Kept while you move through the unit</span></div><button onClick={() => setKeepSetting((value) => !value)}>{keepSetting ? "Keep on" : "Keep off"}</button>
              </section>
            )}

            <div className="scroll-area pen-route">
              <div className="list-heading"><div><p>Physical route</p><h3>Work directly by pen</h3></div><button>Route order</button></div>

              {singleVisible && <section className={`inline-pen single-pen ${singleOutcome ? "complete" : ""}`}>
                <header><span className="pen-code">A1</span><div><strong>1 pig</strong><small>Single-pig pen · act here</small></div><span className="inline-state">{singleOutcome ? "Done" : "Due now"}</span></header>
                <div className="single-animal">
                  <span className="animal-code"><strong>{singleAnimal.id}</strong><small>Sow · Parity 3</small></span>
                  <span className="animal-task"><strong>{singleOutcome || "Ready"}</strong><small>{taskContext[screen.task][singleAnimal.id]}</small></span>
                  {singleOutcome ? <span className="row-state done">✓</span> : activeTask.mode === "guided" ? <button className="inline-primary" onClick={() => setActiveRecord({ id: singleAnimal.id, pen: "A1" })}>Record mating</button> : activeTask.mode === "batch" ? <button className="inline-primary" onClick={() => applyOutcome([singleAnimal.id], activeTask.actions[0], "A1")}>{activeTask.primary}</button> : <button className="inline-primary" onClick={() => applyOutcome([singleAnimal.id], activeOutcome, "A1")}>{activeOutcome}</button>}
                </div>
                {!singleOutcome && activeTask.mode === "rapid" && <div className="quick-alternatives">{activeTask.actions.filter((action) => action !== activeOutcome).map((action) => <button key={action} onClick={() => applyOutcome([singleAnimal.id], action, "A1")}>{action}</button>)}</div>}
              </section>}

              {visibleMultiAnimals.length > 0 && <section className={`inline-pen multi-pen ${readyAnimals.length === 0 ? "complete" : ""}`}>
                <button className="pen-expand" onClick={() => setExpandedPen((current) => current === "A2" ? null : "A2")} aria-expanded={expandedPen === "A2"}>
                  <span className="pen-code">A2</span><span className="pen-copy"><strong>{statusFilter === "all" ? (readyAnimals.length === 0 ? "Current work complete" : `${readyAnimals.length} ready now`) : `${visibleMultiAnimals.length} matching ${unitStatuses[screen.task].find((status) => status.key === statusFilter)?.label.toLowerCase()}`}</strong><small>{statusFilter === "all" ? "5 task pigs · 1 waiting · 1 recorded" : `Filtered within ${activeTask.name.toLowerCase()} cohort`}</small><i><b style={{ width: readyAnimals.length === 0 ? "100%" : "40%" }} /></i></span><span className="pen-status">{readyAnimals.length === 0 ? "Done" : expandedPen === "A2" ? "Hide" : "Work here"}</span><span className="chevron">{expandedPen === "A2" ? "⌃" : "⌄"}</span>
                </button>
                {expandedPen === "A2" && (
                  <div className="inline-animals">
                    <div className="worklist-tools"><span>Animals in A2</span>{activeTask.mode !== "guided" && readyAnimals.length > 0 && <button onClick={() => activeTask.mode === "rapid" ? applyOutcome(readyAnimals.map((animal) => animal.id), activeOutcome, "A2") : setSelected(readyAnimals.map((animal) => animal.id))}>{activeTask.mode === "rapid" ? `Apply ${activeOutcome} to all` : "Select all due"}</button>}</div>
                    {visibleMultiAnimals.map((animal) => {
                      const result = animalOutcome("A2", animal.id);
                      const done = animal.state === "done" || Boolean(result);
                      const actionable = animal.state === "ready" && !result;
                      const isSelected = selected.includes(animal.id);
                      const content = <><>{activeTask.mode === "batch" && actionable && <span className={`selection-box ${isSelected ? "selected" : ""}`} aria-hidden="true">{isSelected ? "✓" : ""}</span>}</><span className="animal-code"><strong>{animal.id}</strong><small>Sow · Parity {Number(animal.id.slice(-1)) % 5 + 1}</small></span><span className="animal-task"><strong>{result || (done ? "Recorded" : animal.state === "waiting" ? "Waiting" : "Ready")}</strong><small>{taskContext[screen.task][animal.id]}</small></span><span className={`row-state ${done ? "done" : animal.state}`}>{done ? "✓" : animal.state === "waiting" ? "14:30" : activeTask.mode === "guided" ? "Record" : "›"}</span></>;
                      if (!actionable) return <div className={`animal-line ${done ? "done" : animal.state}`} key={animal.id}>{content}</div>;
                      return <button className={`animal-line actionable ${isSelected ? "selected" : ""}`} key={animal.id} onClick={() => { if (activeTask.mode === "rapid") applyOutcome([animal.id], activeOutcome, "A2"); if (activeTask.mode === "batch") setSelected((current) => current.includes(animal.id) ? current.filter((id) => id !== animal.id) : [...current, animal.id]); if (activeTask.mode === "guided") setActiveRecord({ id: animal.id, pen: "A2" }); }}>{content}</button>;
                    })}
                    {activeTask.mode === "batch" && selected.length > 0 && <div className="inline-bulk"><span><strong>{selected.length}</strong> selected</span><button onClick={() => applyOutcome(selected, activeTask.actions[0], "A2")}>{activeTask.primary}</button></div>}
                  </div>
                )}
              </section>}

              {(statusFilter === "all" || statusFilter === "waiting") && <section className="inline-pen quiet-pen"><button className="pen-expand"><span className="pen-code">B1</span><span className="pen-copy"><strong>No work due now</strong><small>Task cohort · next action 14:30</small></span><span className="pen-status">Later</span></button></section>}
              {(statusFilter === "all" || statusFilter === "exception") && <section className="inline-pen exception-pen"><button className="pen-expand"><span className="pen-code">B2</span><span className="pen-copy"><strong>1 location exception</strong><small>Task pig moved from A3 · current location unconfirmed</small></span><span className="pen-status">Check</span></button></section>}
              {!singleVisible && visibleMultiAnimals.length === 0 && statusFilter !== "exception" && statusFilter !== "waiting" && <div className="filtered-empty"><strong>No pigs match this status in the visible pens</strong><span>Try another status or open all task pigs.</span></div>}
              <p className="context-note">One-pig pens expose the task immediately. Multi-pig pens expand here for rapid or bulk work without losing the unit route.</p>
            </div>
            {notice && <button className="toast" onClick={() => setNotice("")}>{notice}<span>×</span></button>}
            <div className="sticky-footer">
              <button className="secondary-action" onClick={() => go({ name: "task", task: screen.task })}>Save & leave</button>
              <button className="primary-action" disabled={!unitWorkCompleted} onClick={closeUnitRound}>{unitWorkCompleted ? "Close unit round" : `${(singleOutcome ? 0 : 1) + readyAnimals.length} actions remaining`}</button>
            </div>

            {activeRecord && (
              <div className="sheet-layer" role="dialog" aria-modal="true" aria-label={`Record ${activeTask.name} for ${activeRecord.id}`}>
                <button className="sheet-scrim" aria-label="Close record" onClick={() => setActiveRecord(null)} />
                <section className="record-sheet">
                  <div className="sheet-handle" />
                  <header><div><p>Pen {activeRecord.pen}</p><h3>{activeRecord.id}</h3></div><button onClick={() => setActiveRecord(null)} aria-label="Close">×</button></header>
                  <div className="record-summary"><span>{activeTask.name}</span><strong>{taskContext[screen.task][activeRecord.id]}</strong></div>
                  <div className="record-field"><span>Semen dose</span><button>JY-240813-07 <b>Change</b></button></div>
                  <label className="keep-row"><input type="checkbox" checked={keepSetting} onChange={(event) => setKeepSetting(event.target.checked)} /><span>Keep this semen lot for the next pig</span></label>
                  <div className="sheet-actions"><button className="secondary-action" onClick={() => setActiveRecord(null)}>Cancel</button><button className="primary-action" onClick={saveAndNext}>{readyAnimals.length > 0 || activeRecord.pen === "A1" ? "Save & next task" : "Save & finish"}</button></div>
                </section>
              </div>
            )}
          </>
        )}

        {screen.name === "review" && activeTask && (
          <>
            <header className="topbar">
              <button className="back" onClick={back} aria-label="Back">‹</button>
              <div><p>{activeTask.category}</p><h2>Complete {activeTask.name.toLowerCase()}</h2></div>
            </header>
            <div className="scroll-area completion-review">
              <section className={`readiness ${allUnitsComplete ? "ready" : "blocked"}`}>
                <span>{allUnitsComplete ? "✓" : "!"}</span>
                <div><strong>{allUnitsComplete ? "Ready to complete" : "Task is not ready"}</strong><small>{allUnitsComplete ? "All current unit rounds are closed." : `${activeTask.units.length - completedCount} unit still has current work.`}</small></div>
              </section>
              <div className="review-group">
                <h3>Execution summary</h3>
                <div className="review-row"><span>Animals recorded</span><strong>{allUnitsComplete ? activeTask.total : activeTask.total - 4} / {activeTask.total}</strong></div>
                <div className="review-row"><span>Waiting for a future window</span><strong>{activeTask.waiting}</strong></div>
                <div className="review-row"><span>Exceptions acknowledged</span><strong>{activeTask.exceptions}</strong></div>
              </div>
              <div className="review-group consequence-group">
                <h3>What completion changes</h3>
                <p>Recorded animals continue to the next production stage. Waiting animals remain scheduled. Exceptions stay visible in farm follow-up.</p>
              </div>
              <label className="acknowledge"><input type="checkbox" defaultChecked={allUnitsComplete} /><span>I reviewed the outcomes and exceptions above.</span></label>
            </div>
            <div className="sticky-footer">
              <button className="secondary-action" onClick={back}>Return to task</button>
              <button className="primary-action" disabled={!allUnitsComplete} onClick={() => go({ name: "complete", task: screen.task })}>Complete task</button>
            </div>
          </>
        )}

        {screen.name === "complete" && activeTask && (
          <div className="success-screen">
            <span className="success-mark">✓</span>
            <p>Task complete</p>
            <h2>{activeTask.name}</h2>
            <p className="success-copy">All results are saved and visible to the farm team. Future-window work remains scheduled automatically.</p>
            <div className="success-stats"><div><strong>{activeTask.total}</strong><span>recorded</span></div><div><strong>{activeTask.units.length}</strong><span>units</span></div><div><strong>{activeTask.exceptions}</strong><span>follow-ups</span></div></div>
            <button className="primary-action" onClick={() => go({ name: "home" })}>Back to overview</button>
          </div>
        )}

        {screen.name !== "complete" && <nav className="bottom-nav" aria-label="Primary navigation"><button className="active"><span>⌂</span>Work</button><button><span>▦</span>Farm</button><button><span>◎</span>Animals</button><button><span>☰</span>More</button></nav>}
      </section>
    </main>
  );
}
