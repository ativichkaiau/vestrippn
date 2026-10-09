import type { Metadata } from 'next';
import { Suspense } from 'react';
import AssistantClient from '@/components/assistant/AssistantClient';

export const metadata: Metadata = {
  title: 'Assistant',
  description: 'Ask about any part of VESTRIPPN, from live hub data or your own sources.',
};

// The client reads ?q= / ?hub= (⌘K "ask …"), so it renders inside Suspense.
export default function AssistantPage() {
  return (
    <Suspense>
      <AssistantClient />
    </Suspense>
  );
}
