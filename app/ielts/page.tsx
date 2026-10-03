import type { Metadata } from 'next';
import IeltsClient from './IeltsClient';

export const metadata: Metadata = {
  title: 'IELTS',
  description: 'Preparation modules and practice for IELTS Academic.',
};

export default function IeltsPage() {
  return <IeltsClient />;
}
