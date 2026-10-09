import 'server-only';
import type { Node } from './types';

/* ════════════════════════════════════════════════════════════════════════
   Private links — the owner's Google Drive folders (notes, summaries, the
   portfolio). They were never published, so they are kept out of the
   registry and the archive: the shell and the palette import those modules,
   which puts everything in them in the JavaScript sent to every visitor.

   `server-only` makes importing this file from a client component a build
   error. Server pages read it and render a folder for the signed-in owner
   only; visitors see that a folder exists, not where it is. To publish a
   folder, move its URL back into the registry or the archive.
   ════════════════════════════════════════════════════════════════════════ */

export type Folder = { label: string; url: string };

/** Registry node slug → folder. */
const NODE_FOLDERS: Record<string, string> = {
  onepager: 'https://drive.google.com/drive/folders/1nobEj31AcMk0PhHu2YxNKaihVYsPJRCi',
};

/** Archive record id → folders. */
const RECORD_FOLDERS: Record<string, Folder[]> = {
  'olympiad-notes': [
    { label: 'astrophysics', url: 'https://drive.google.com/drive/folders/1ta_ydTUk8YLe91z_tgBWawMAlxHxqs06' },
    { label: 'astronomy', url: 'https://drive.google.com/drive/folders/1FIy_K00EC4I9UGy-LyP0_eRxHGGkqtJZ' },
    { label: 'earth science', url: 'https://drive.google.com/drive/folders/1--FnoZZe4GWo4i7YYXyzSZNjwIX5HHks' },
  ],
  'medical-foundations': [
    { label: 'university summaries', url: 'https://drive.google.com/drive/folders/1Wp9C_rP2ybeVUPgfXJCOganRNjuWaViS' },
    { label: 'portfolio showcase', url: 'https://drive.google.com/drive/folders/1-34E1ClpDxzP5-3Hr_b52svDZX7J2ucF' },
  ],
  'preparation-vault': [
    { label: 'high school notes', url: 'https://drive.google.com/drive/folders/1rs2HtVZBXJ_4IOf_HkPMIRCW0XwuMSk5' },
    { label: 'linguistics', url: 'https://drive.google.com/drive/folders/1-2RoL8dU8UjiSJZqQRIVZhh1LJ_yRgBw' },
    { label: 'IELTS master', url: 'https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR' },
  ],
};

/** University summaries: `year / module` → folder. A module without one is not published yet. */
const SUMMARY_FOLDERS: Record<string, string> = {
  'Y1 / term 1': 'https://drive.google.com/drive/folders/1P7CTRwWOGVGyM7n5nbFDbppoK5P72Pqx',
  'Y1 / term 2': 'https://drive.google.com/drive/folders/1soEWnZ6YpzaMIWIj6jEo4ZLXeK1buyoB',
  'Y2 / module 1': 'https://drive.google.com/drive/folders/1LGag8DnkZLljngHvkhPcL6EmKoFHdkH-',
  'Y2 / module 2': 'https://drive.google.com/drive/folders/1BmrfGiFtl43mOMoVNdmXcyjIa4MCbc3q',
  'Y2 / module 3': 'https://drive.google.com/drive/folders/1p-2WhF7NCklH9JlUuH0ple3eG2K6Ig2m',
  'Y2 / module 4': 'https://drive.google.com/drive/folders/1I5mz0LQMIHMc8eV4v8Z4vCQ4wldTzIvb',
  'Y2 / module 5': 'https://drive.google.com/drive/folders/1SqowuBE7bu17JtPVmvriOL4ZpCp1Ak2J',
};

/**
 * A node's link for this viewer: its public URL, or its private folder when
 * signed in. `locked` when a folder exists but is withheld from the viewer.
 */
export function nodeLink(node: Node, signedIn: boolean): { url?: string; locked: boolean } {
  const folder = node.url ? undefined : NODE_FOLDERS[node.slug];
  return { url: node.url ?? (signedIn ? folder : undefined), locked: Boolean(folder) && !signedIn };
}

/** An archive record's private folders. */
export function recordFolders(id: string): Folder[] {
  return RECORD_FOLDERS[id] ?? [];
}

/** A university summary module's folder, if it is published. */
export function summaryFolder(year: string, module: string): string | undefined {
  return SUMMARY_FOLDERS[`${year} / ${module}`];
}
