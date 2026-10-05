/* The right-hand editor group shows a page of this site in a frame. Inside
   that frame the page is "embedded": the boot script marks <html> with
   `sys-embed` before paint, the shell's chrome is hidden by CSS, and the
   shell reports its route to the parent instead of opening tabs. */

export const EMBED_CLASS = 'sys-embed';
export const SPLIT_PATH_MESSAGE = 'vest:split-path';

export function isEmbedded(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains(EMBED_CLASS);
}

/** Runs before paint (see THEME_BOOT_SCRIPT): same-origin frames only. */
export const EMBED_BOOT = `try{if(window.self!==window.top&&window.parent.location.origin===location.origin)document.documentElement.classList.add('${EMBED_CLASS}')}catch{}`;
