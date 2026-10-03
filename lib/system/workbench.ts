'use client';

/* Workbench layout state for this device, like a VS Code window: which side
   view is open, whether the side bar and panel are shown, which panel tab,
   and which Explorer folders are collapsed. */

export const VIEWS = ['explorer', 'search', 'appearance', 'account'] as const;
export type View = (typeof VIEWS)[number];
export const PANEL_TABS = ['output', 'terminal'] as const;
export type PanelTab = (typeof PANEL_TABS)[number];

export type Workbench = { sidebar: boolean; view: View; panel: boolean; panelTab: PanelTab; collapsed: string[] };

export const DEFAULT_WORKBENCH: Workbench = { sidebar: true, view: 'explorer', panel: false, panelTab: 'terminal', collapsed: [] };
const KEY = 'vest_workbench';
export const WORKBENCH_EVENT = 'sys:workbench';
const DEFAULT_STRING = JSON.stringify(DEFAULT_WORKBENCH);

export function parseWorkbench(raw: string | null): Workbench {
  if (!raw) return DEFAULT_WORKBENCH;
  try {
    const data = JSON.parse(raw) as Partial<Workbench>;
    return {
      sidebar: typeof data.sidebar === 'boolean' ? data.sidebar : DEFAULT_WORKBENCH.sidebar,
      view: VIEWS.includes(data.view as View) ? (data.view as View) : DEFAULT_WORKBENCH.view,
      panel: typeof data.panel === 'boolean' ? data.panel : DEFAULT_WORKBENCH.panel,
      panelTab: PANEL_TABS.includes(data.panelTab as PanelTab) ? (data.panelTab as PanelTab) : DEFAULT_WORKBENCH.panelTab,
      collapsed: Array.isArray(data.collapsed) ? data.collapsed.filter((id): id is string => typeof id === 'string').slice(0, 20) : [],
    };
  } catch {
    return DEFAULT_WORKBENCH;
  }
}

export function getWorkbenchSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? DEFAULT_STRING;
  } catch {
    return DEFAULT_STRING;
  }
}
export const serverWorkbenchSnapshot = () => DEFAULT_STRING;

export function subscribeWorkbench(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener(WORKBENCH_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(WORKBENCH_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function updateWorkbench(patch: Partial<Workbench> | ((current: Workbench) => Partial<Workbench>)): void {
  const current = parseWorkbench(getWorkbenchSnapshot());
  const next = { ...current, ...(typeof patch === 'function' ? patch(current) : patch) };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: layout resets on reload */
  }
  window.dispatchEvent(new Event(WORKBENCH_EVENT));
}

/** Show a side view; selecting the open one again hides the side bar (VS Code). */
export function toggleView(view: View): void {
  updateWorkbench((current) => (current.sidebar && current.view === view ? { sidebar: false } : { sidebar: true, view }));
}

export function toggleSidebar(): void {
  updateWorkbench((current) => ({ sidebar: !current.sidebar }));
}

export function togglePanel(tab?: PanelTab): void {
  updateWorkbench((current) =>
    tab && current.panel && current.panelTab !== tab ? { panelTab: tab } : { panel: !current.panel, ...(tab ? { panelTab: tab } : {}) },
  );
}

export function toggleFolder(id: string): void {
  updateWorkbench((current) => ({
    collapsed: current.collapsed.includes(id) ? current.collapsed.filter((item) => item !== id) : [...current.collapsed, id],
  }));
}
