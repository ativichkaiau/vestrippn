'use client';

import { subscribeToPush } from './push-client';

// Enable exam reminders: request Notification permission and register a push
// subscription. Shared so the command palette and the Comms Intel bell trigger
// the same flow. Returns the resulting permission state for toast feedback.
export async function enableReminders(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') {
    void subscribeToPush();
    return 'granted';
  }
  if (Notification.permission === 'denied') return 'denied';
  const perm = await Notification.requestPermission();
  if (perm === 'granted') void subscribeToPush({ confirm: true });
  return perm;
}
