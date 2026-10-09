import type { Metadata } from 'next';
import DasIngestClient from './DasIngestClient';

export const metadata: Metadata = { title: 'Sources', description: 'Documents the assistant may answer from.' };

export default function DasIngestPage() {
  return <DasIngestClient />;
}
