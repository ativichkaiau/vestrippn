import type { Metadata } from 'next';
import IeltsPracticeClient from './IeltsPracticeClient';

export const metadata: Metadata = { title: 'IELTS practice' };

export default function IeltsPracticePage() {
  return <IeltsPracticeClient />;
}
