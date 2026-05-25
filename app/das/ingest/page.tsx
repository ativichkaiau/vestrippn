import type { Metadata } from 'next';
import DasIngestClient from './DasIngestClient';

export const metadata: Metadata = { title: 'DAS · Ingestion' };

export default function DasIngestPage() {
  return <DasIngestClient />;
}
