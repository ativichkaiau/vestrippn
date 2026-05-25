import type { Metadata } from 'next';
import CasesClient from './CasesClient';

export const metadata: Metadata = { title: 'Learn · Clinical Cases' };

export default function CasesPage() {
  return <CasesClient />;
}
