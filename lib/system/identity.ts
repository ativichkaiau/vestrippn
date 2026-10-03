/* The person the root namespace belongs to. Every value here was already on
   the site (the former Identity hub) or stated by the owner. */

export const IDENTITY = {
  handle: 'Kaiau',
  fullName: 'Ativich Vichittragoonthavon',
  roles: ['medical student', 'researcher', 'developer'],
  program: 'MD',
  year: '03',
  institution: 'Chiang Mai University',
  institutionShort: 'CMU',
  faculty: 'Faculty of Medicine (MedCMU)',
  location: 'Chiang Mai / Thailand',
  focus: ['medicine', 'research', 'software'],
  interests: [
    'cardiac electrophysiology',
    'clinical research systems',
    'full-stack development',
    'medical AI and automation',
    'workflow engineering',
    'human performance',
  ],
  narrative: [
    'Third-year medical student at Chiang Mai University. Most of my work sits where medicine, research and software overlap: cardiac electrophysiology, clinical research systems, and the tools that make studying and reviewing evidence faster.',
    'I was Academic President and Research Club President at MedCMU. Before medicine there were science olympiads — astronomy, astrophysics, earth science and linguistics. Those records live in the archive, not on the front page.',
    'VESTRIPPN is the environment that holds all of it: study runtimes, research infrastructure, experiments and the archive, built alongside medical school.',
  ],
  positions: [
    { role: 'Academic President', org: 'MedCMU', state: 'former' },
    { role: 'Research Club President', org: 'MedCMU', state: 'former' },
  ],
  stack: [
    { area: 'frontend', items: ['Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML/CSS', 'Swift'] },
    { area: 'backend', items: ['Python', 'Node.js', 'Prisma', 'PostgreSQL', 'REST APIs', 'OAuth'] },
    { area: 'ai / automation', items: ['OpenAI API', 'custom GPT systems', 'PyTorch', 'research workflow automation'] },
    { area: 'devops', items: ['Git', 'GitHub Actions', 'Vercel'] },
    { area: 'research', items: ['systematic review methods', 'Covidence', 'PubMed / Scopus / ClinicalKey'] },
  ],
  network: [
    { id: 'github', label: 'GitHub', handle: 'ativichkaiau', url: 'https://github.com/ativichkaiau' },
    { id: 'linkedin', label: 'LinkedIn', handle: 'ativich-vichittragoonthavon', url: 'https://www.linkedin.com/in/ativich-vichittragoonthavon-b08b01258/' },
    { id: 'instagram', label: 'Instagram', handle: 'kaiau.atv', url: 'https://www.instagram.com/kaiau.atv' },
    { id: 'facebook', label: 'Facebook', handle: 'kaiau.atv', url: 'https://www.facebook.com/kaiau.atv/' },
  ],
  /** Drivers kept as reference points. Figures as recorded on the former Identity hub. */
  archetypes: [
    { name: 'Michael Schumacher', titles: 7, wins: 91, poles: 68, podiums: 155, note: 'Rebuilt Ferrari through tactical discipline.' },
    { name: 'Lewis Hamilton', titles: 7, wins: 103, poles: 104, podiums: 197, note: 'Most wins and poles.' },
    { name: 'Juan Manuel Fangio', titles: 5, wins: 24, poles: 29, podiums: 35, note: 'Five titles with four different teams.' },
    { name: 'Max Verstappen', titles: 4, wins: 61, poles: 40, podiums: 107, note: 'Relentless pace, clinical consistency.' },
    { name: 'Sebastian Vettel', titles: 4, wins: 53, poles: 57, podiums: 122, note: 'Youngest world champion.' },
    { name: 'Alain Prost', titles: 4, wins: 51, poles: 33, podiums: 106, note: 'Won through calculated execution.' },
    { name: 'Ayrton Senna', titles: 3, wins: 41, poles: 65, podiums: 80, note: 'Donington 1993: the opening lap.' },
    { name: 'Niki Lauda', titles: 3, wins: 25, poles: 24, podiums: 54, note: 'Raced again 40 days after Nürburgring 1976.' },
  ],
} as const;
