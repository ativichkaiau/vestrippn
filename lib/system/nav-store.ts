'use client';

import { notifyPreferenceEdit } from '../device-sync';
import { DEFAULT_NAV_STRING, serializeNavLayout, type NavEntry } from './nav-layout';

/* The navigation layout on this device. `vest_nav` holds the canonical
   string; DeviceSync writes it when another device's layout arrives and
   picks up local edits through notifyPreferenceEdit. */

export const NAV_STORAGE_KEY = 'vest_nav';
export const NAV_CHANGE_EVENT = 'vest:nav-change';
export const NAV_EDIT_EVENT = 'sys:nav-edit';

export function getNavSnapshot(): string {
  try {
    return localStorage.getItem(NAV_STORAGE_KEY) || DEFAULT_NAV_STRING;
  } catch {
    return DEFAULT_NAV_STRING;
  }
}

export const serverNavSnapshot = () => DEFAULT_NAV_STRING;

export function subscribeNav(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === NAV_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener(NAV_CHANGE_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(NAV_CHANGE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Save a layout on this device and queue it for sync. */
export function saveNav(entries: NavEntry[]): void {
  const nav = serializeNavLayout(entries);
  try {
    localStorage.setItem(NAV_STORAGE_KEY, nav);
  } catch {
    /* storage unavailable: the layout still syncs for this session */
  }
  window.dispatchEvent(new Event(NAV_CHANGE_EVENT));
  notifyPreferenceEdit({ nav });
}

export function openNavEditor() {
  window.dispatchEvent(new Event(NAV_EDIT_EVENT));
}
