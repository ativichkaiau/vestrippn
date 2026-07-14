'use client';

// Tiny toast pub/sub. Decoupled from React so any client code can fire a toast
// — the SW update flow, the offline handler, Focus Mode PBs — by importing
// `toast()`; the <Toaster/> provider subscribes and renders. Livery-tinted via
// the --hub-accent CSS token, so no color needs to be passed in.

export type ToastVariant = 'default' | 'success' | 'warn' | 'error';

export type ToastInput = {
  title: string;
  message?: string;
  variant?: ToastVariant;
  icon?: string; // emoji / glyph override
  duration?: number; // ms visible; 0 = sticky until dismissed
  action?: { label: string; run: () => void };
  id?: string; // stable key → re-firing the same id replaces instead of stacking
};

export type Toast = ToastInput & { id: string };

type AddListener = (t: Toast) => void;
type RemoveListener = (id: string) => void;

const addListeners = new Set<AddListener>();
const removeListeners = new Set<RemoveListener>();
let seq = 0;

export function toast(input: ToastInput): string {
  const id = input.id ?? `t${Date.now().toString(36)}_${++seq}`;
  const payload: Toast = { variant: 'default', duration: 4200, ...input, id };
  addListeners.forEach((l) => l(payload));
  return id;
}

export function dismissToast(id: string): void {
  removeListeners.forEach((l) => l(id));
}

export function onToast(add: AddListener, remove: RemoveListener): () => void {
  addListeners.add(add);
  removeListeners.add(remove);
  return () => {
    addListeners.delete(add);
    removeListeners.delete(remove);
  };
}
