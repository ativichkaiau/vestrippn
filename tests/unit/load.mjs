import { createJiti } from 'jiti';

// Load TypeScript modules the way the validators do (no build step).
const jiti = createJiti(import.meta.url, { alias: { '@': new URL('../../', import.meta.url).pathname.replace(/\/$/, '') } });
export const load = (path) => jiti.import(new URL(`../../${path}`, import.meta.url).pathname);
