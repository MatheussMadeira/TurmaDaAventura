import type { Metadata } from 'next';
import { ComponentesView } from './ComponentesView';

export const metadata: Metadata = { title: 'Componentes', robots: { index: false } };

export default function ComponentesPage() {
  return <ComponentesView />;
}
