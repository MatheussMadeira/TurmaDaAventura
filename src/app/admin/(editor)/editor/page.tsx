import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, unstable_rethrow } from 'next/navigation';
import { EditorApp } from '@/admin/editor/EditorApp';
import { NoPermission, SchemaOutdated } from '@/admin/ui/states';
import { ToastProvider } from '@/admin/ui/Toast';
import { PAGES } from '@/content/sections/schemas';
import { isSchemaOutdated } from '@/lib/dbErrors';
import { editorLibrary, loadEditorPage } from '@/server/admin/editor';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Editor visual' };
export const dynamic = 'force-dynamic';

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { allowed } = await requirePageUser('site');
  const theme = (await cookies()).get('tda-theme')?.value === 'noite' ? 'noite' : 'dia';
  const shell = (children: React.ReactNode) => (
    <div data-theme={theme} style={{ minHeight: '100dvh', background: 'var(--surface-sunken)' }}>
      <main style={{ padding: 'var(--space-6)', maxWidth: 720, margin: '0 auto' }}>{children}</main>
    </div>
  );
  if (!allowed) return shell(<NoPermission />);

  const slug = (await searchParams).pagina ?? PAGES[0]!.slug;
  let page;
  let library;
  try {
    [page, library] = await Promise.all([loadEditorPage(slug), editorLibrary()]);
  } catch (e) {
    unstable_rethrow(e);
    if (isSchemaOutdated(e)) return shell(<SchemaOutdated />);
    throw e;
  }
  if (!page) notFound();

  return (
    <div data-theme={theme}>
      <ToastProvider>
        <EditorApp
          key={page.slug}
          slug={page.slug}
          path={page.path}
          pages={PAGES.map((p) => ({ slug: p.slug, title: p.title }))}
          initialSections={page.sections}
          initialMedia={page.media}
          initialPending={page.pending}
          library={library}
        />
      </ToastProvider>
    </div>
  );
}
