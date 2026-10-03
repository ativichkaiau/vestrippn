/* Workbench icons, drawn on a 16px grid in the spirit of VS Code's codicons.
   Decorative by default (aria-hidden); the control around them is labelled. */

export type IconName =
  | 'files'
  | 'search'
  | 'paint'
  | 'account'
  | 'gear'
  | 'chevron'
  | 'close'
  | 'pin'
  | 'page'
  | 'runtime'
  | 'system'
  | 'project'
  | 'log'
  | 'object'
  | 'archive'
  | 'link'
  | 'auth'
  | 'terminal'
  | 'output'
  | 'panel'
  | 'sidebar'
  | 'keyboard'
  | 'sync'
  | 'edit';

const PATHS: Record<IconName, string> = {
  files: 'M5 2.5h5l3 3V12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1ZM10 2.5V5.5h3M2.5 5v8.5a1 1 0 0 0 1 1H10',
  search: 'M7 2.75a4.25 4.25 0 1 1 0 8.5 4.25 4.25 0 0 1 0-8.5ZM10.1 10.1l3.4 3.4',
  paint: 'M8 2.5a5.5 5.5 0 1 0 0 11c.9 0 1.2-.6.9-1.3-.4-.9.1-1.7 1.1-1.7h1.2a2.3 2.3 0 0 0 2.3-2.3C13.5 4.9 11 2.5 8 2.5ZM5 7.25h.01M6.75 5h.01M9.5 5h.01M11.2 7h.01',
  account: 'M8 2.75a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5ZM2.75 13.5c.6-2.4 2.7-3.75 5.25-3.75s4.65 1.35 5.25 3.75',
  gear: 'M8 5.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5ZM8 1.75v1.5M8 12.75v1.5M3.6 3.6l1.05 1.05M11.35 11.35l1.05 1.05M1.75 8h1.5M12.75 8h1.5M3.6 12.4l1.05-1.05M11.35 4.65l1.05-1.05',
  chevron: 'M6 4l4 4-4 4',
  close: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  pin: 'M6 2.5h4M7 2.5v4L4.5 9h7L9 6.5v-4M8 9v4.5',
  page: 'M4.5 2.5h4.5l2.5 2.5v8a.5.5 0 0 1-.5.5h-6.5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5ZM9 2.5V5h2.5M6 8h4M6 10.5h4',
  runtime: 'M2.5 4.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-7ZM4.75 7l1.75 1.5-1.75 1.5M8 10h3',
  system: 'M3 3.5h10v3H3ZM3 9.5h10v3H3ZM5 5h.01M5 11h.01',
  project: 'M2.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4.5Z',
  log: 'M3.5 3.5h9M3.5 6.5h9M3.5 9.5h6M3.5 12.5h4',
  object: 'M8 2.25l5 2.75v6L8 13.75 3 11V5l5-2.75ZM3 5l5 2.75L13 5M8 7.75v6',
  archive: 'M2.5 3.5h11v3h-11ZM3.5 6.5v6a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-6M6.5 9h3',
  link: 'M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9v3.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1H7',
  auth: 'M4.5 7V5.25a3.5 3.5 0 0 1 7 0V7M3.5 7h9v6.5h-9Z',
  terminal: 'M2.5 3.5h11v9h-11ZM4.75 6l2 2-2 2M8.25 10h3',
  output: 'M3 3.5h10M3 6.5h10M3 9.5h7M3 12.5h5',
  panel: 'M2.5 3.5h11v9h-11ZM2.5 9.5h11',
  sidebar: 'M2.5 3.5h11v9h-11ZM6.5 3.5v9',
  keyboard: 'M1.75 4.5h12.5v7H1.75ZM4 6.75h.01M6.5 6.75h.01M9 6.75h.01M11.5 6.75h.01M5 9.25h6',
  sync: 'M13 5.5A5.25 5.25 0 0 0 3.2 6M3 10.5a5.25 5.25 0 0 0 9.8-.5M13 2.75V5.5h-2.75M3 13.25V10.5h2.75',
  edit: 'M10.5 2.75l2.75 2.75L6 12.75H3.25V10l7.25-7.25Z',
};

export default function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
