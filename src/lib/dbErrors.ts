/** Banco sem a migração aplicada: tabela (P2021) ou coluna (P2022) inexistente. */
export function isSchemaOutdated(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const code = (e as { code?: unknown }).code;
  if (code === 'P2021' || code === 'P2022') return true;
  const msg = String((e as { message?: unknown }).message ?? '');
  return /does not exist in the current database|relation ".*" does not exist|column .* does not exist/i.test(
    msg,
  );
}
