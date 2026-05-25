import type { Metadata } from 'next';
import IeltsPracticeClient from './IeltsPracticeClient';

export const metadata: Metadata = { title: 'Learn · IELTS Practice' };

export default function IeltsPracticePage() {
  return <IeltsPracticeClient />;
}
