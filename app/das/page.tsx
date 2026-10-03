import type { Metadata } from 'next';
import DasChatClient from './DasChatClient';

export const metadata: Metadata = { title: 'Assistant' };

export default function DasChatPage() {
  return <DasChatClient />;
}
