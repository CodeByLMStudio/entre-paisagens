import type { ZodIssue } from 'zod';

/**
 * Converte as issues do Zod em um mapa `{ campo: mensagem }`,
 * mantendo apenas a primeira mensagem por campo para exibição inline.
 */
export function issuesToRecord(issues: ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0]?.toString() ?? '_form';
    if (!(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}
