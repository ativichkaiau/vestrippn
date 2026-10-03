import type { Metadata } from 'next';
import DasIngestClient from './DasIngestClient';

export const metadata: Metadata = { title: 'Ingest sources' };

export default function DasIngestPage() {
  return <DasIngestClient />;
}
