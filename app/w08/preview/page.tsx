import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PreviewClient from './PreviewClient';

export const metadata: Metadata = { title: 'W08 · Primitive Preview' };

// Dev-only harness for screenshotting primitives across liveries.
// Never shipped to production.
export default function W08PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <PreviewClient />;
}
