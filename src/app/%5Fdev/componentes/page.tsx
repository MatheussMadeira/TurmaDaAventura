import { devMetadata, devOnly } from '../guard';
import { ComponentesView } from './ComponentesView';

export const metadata = devMetadata('Componentes');

export default function ComponentesPage() {
  devOnly();
  return <ComponentesView />;
}
