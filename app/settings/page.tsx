import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/system/primitives';
import SettingsJsonClient from './SettingsJsonClient';

export const metadata: Metadata = {
  title: 'settings.json',
  description: 'Every synced VESTRIPPN setting as one editable JSON document.',
};

export default function SettingsPage() {
  return (
    <Page wide>
      <PageHeader
        label="preferences"
        title="settings.json"
        lede="Every synced setting in one document, VS Code style. Comments and trailing commas are fine; nothing is applied until the whole file is valid."
      />
      <SettingsJsonClient />
    </Page>
  );
}
