import type { ArchiveCategory, ArchiveRecord } from './types';

/* ════════════════════════════════════════════════════════════════════════
   ~/archive — old work kept as records. Sources: the former Identity and
   Archive hubs, and this repository's own git history (software builds).
   ════════════════════════════════════════════════════════════════════════ */

export const ARCHIVE_CATEGORIES: { id: ArchiveCategory; label: string }[] = [
  { id: 'olympiad', label: 'olympiad' },
  { id: 'competition', label: 'competition' },
  { id: 'academic', label: 'academic' },
  { id: 'research', label: 'research' },
  { id: 'software', label: 'software' },
  { id: 'media', label: 'media' },
];

export const ARCHIVE: ArchiveRecord[] = [
  /* olympiad */
  {
    id: 'ieso-2023', category: 'olympiad', code: 'IESO', year: '2023', type: 'international olympiad', field: 'earth science',
    title: '16th International Earth Science Olympiad',
    result: 'bronze · ranked 72nd globally',
    details: ['Data Mining Test — bronze', 'National Team Field Investigation — bronze', 'Earth System Project — bronze', 'IESO Art in Earth Science — bronze'],
  },
  {
    id: 'teso-2023', category: 'olympiad', code: 'TESO', year: '2023', type: 'national olympiad', field: 'earth science',
    title: '3rd Thailand Earth Science Olympiad',
    result: 'gold · ranked 2nd',
    details: ['Best Earth System Project research team', 'Highest practical test score', 'Highest regional student score', 'Selected to represent Thailand at IESO 2023'],
  },
  {
    id: 'tao-senior', category: 'olympiad', code: 'TAO', type: 'national olympiad', field: 'astronomy',
    title: '19th and 20th Thailand Astronomy Olympiad · senior',
    result: 'silver · twice',
    details: ['19th TAO — silver, ranked 14th', '20th TAO — silver, ranked 18th', 'IOAA qualifying rounds'],
  },
  {
    id: 'tao-18-junior', category: 'olympiad', code: 'TAO', type: 'national olympiad', field: 'astronomy',
    title: '18th Thailand Astronomy Olympiad · junior',
    result: 'gold · ranked 4th',
    details: ['IAO qualifying round', 'Substitute representative of Thailand, IRAO 2021'],
  },
  {
    id: 'tao-17-junior', category: 'olympiad', code: 'TAO', type: 'national olympiad', field: 'astronomy',
    title: '17th Thailand Astronomy Olympiad · junior',
    result: 'bronze · ranked 24th',
  },
  {
    id: 'olympiad-notes', category: 'olympiad', type: 'notes', field: 'astronomy / astrophysics / earth science',
    title: 'Olympiad notes',
    links: [
      { label: 'astrophysics', url: 'https://drive.google.com/drive/folders/1ta_ydTUk8YLe91z_tgBWawMAlxHxqs06' },
      { label: 'astronomy', url: 'https://drive.google.com/drive/folders/1FIy_K00EC4I9UGy-LyP0_eRxHGGkqtJZ' },
      { label: 'earth science', url: 'https://drive.google.com/drive/folders/1--FnoZZe4GWo4i7YYXyzSZNjwIX5HHks' },
    ],
  },

  /* competition */
  {
    id: 'ysc-2023', category: 'competition', code: 'YSC', year: '2023', type: 'science competition', field: 'chemistry',
    title: "Young Scientist's Competition",
    result: 'regional 1st prize · ISEF 2023 qualifier',
    details: ['Honourable mention at the national round'],
  },
  {
    id: 'tysf-2023', category: 'competition', code: 'TYSF', year: '2023', type: 'science fair', field: 'physics and materials science',
    title: 'Thailand Youth Science Fair',
    result: 'regional bronze · ISEF 2024 qualifier',
    details: ['Special award: best materials science innovation'],
  },
  { id: 'astro-challenge-2021', category: 'competition', year: '2021', type: 'competition', field: 'astronomy', title: 'Astro Challenge', result: '3rd prize' },
  { id: 'pm-science-award', category: 'competition', type: 'award', field: 'science', title: 'PM Science Award', result: 'top 5 project' },
  { id: 'jstp', category: 'competition', code: 'JSTP', type: 'programme', field: 'science', title: 'JSTP', result: '24th generation · alumni' },

  /* academic */
  { id: 'ielts', category: 'academic', code: 'IELTS', type: 'test', field: 'english', title: 'IELTS Academic', result: 'overall 8.0', details: ['listening 8.5 · reading 8.5 · speaking 7.5 · writing 7.0'] },
  { id: 'bmat', category: 'academic', code: 'BMAT', type: 'test', field: 'medicine admission', title: 'BioMedical Admissions Test', result: '14.0A', details: ['part 1 4.6 · part 2 6.4 · part 3 3A'] },
  { id: 'tgat', category: 'academic', code: 'TGAT1', type: 'test', field: 'english', title: 'TGAT1 English', result: '93.33 / 100' },
  { id: 'pet', category: 'academic', code: 'PET', type: 'test', field: 'english · B1', title: 'Cambridge B1 Preliminary', result: '168 / 170' },
  { id: 'ket', category: 'academic', code: 'KET', type: 'test', field: 'english · A2', title: 'Cambridge A2 Key', result: '170 / 170' },
  { id: 'pet-yod-mongkut', category: 'academic', type: 'award', title: 'Pet Yod Mongkut', result: 'honourable mention' },
  {
    id: 'medical-foundations', category: 'academic', type: 'notes', field: 'medicine',
    title: 'Medical foundations',
    links: [
      { label: 'university summaries', url: 'https://drive.google.com/drive/folders/1Wp9C_rP2ybeVUPgfXJCOganRNjuWaViS' },
      { label: 'portfolio showcase', url: 'https://drive.google.com/drive/folders/1-34E1ClpDxzP5-3Hr_b52svDZX7J2ucF' },
    ],
  },
  {
    id: 'preparation-vault', category: 'academic', type: 'notes', field: 'pre-medicine',
    title: 'Preparation notes',
    links: [
      { label: 'high school notes', url: 'https://drive.google.com/drive/folders/1rs2HtVZBXJ_4IOf_HkPMIRCW0XwuMSk5' },
      { label: 'linguistics', url: 'https://drive.google.com/drive/folders/1-2RoL8dU8UjiSJZqQRIVZhh1LJ_yRgBw' },
      { label: 'IELTS master', url: 'https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR' },
    ],
  },

  /* research */
  { id: 'medcmu-research-club', category: 'research', type: 'role', field: 'MedCMU', title: 'Research Club President', result: 'former' },
  { id: 'medcmu-academic', category: 'academic', type: 'role', field: 'MedCMU', title: 'Academic President', result: 'former' },

  /* software — VESTRIPPN builds, from this repository's history */
  { id: 'build-w100', category: 'software', code: 'W100', year: '2026-09-27', type: 'build', field: 'VESTRIPPN', title: 'Third dimension', result: 'c4bf0c7', details: ['WebGL mark, depth engine, three.js garage, livery swap'] },
  { id: 'build-w85', category: 'software', code: 'W85', year: '2026-09-08', type: 'build', field: 'VESTRIPPN', title: 'Mark 85', result: 'b568dfa', details: ['minimal interface, livery collection'] },
  { id: 'build-w10', category: 'software', code: 'W10', year: '2026-06-27', type: 'build', field: 'VESTRIPPN', title: 'Clay cockpit', result: '6fa9fd7', details: ['claymorphism across every hub'] },
  { id: 'build-w09', category: 'software', code: 'W09', year: '2026-06-10', type: 'build', field: 'VESTRIPPN', title: 'Shared navigation', result: '9a38bac', details: ['nav rail, hub colours, mission blocks'] },
  { id: 'build-w05', category: 'software', code: 'W05', year: '2026-05-12', type: 'build', field: 'VESTRIPPN', title: 'VESTRIPPN 3.0', result: '9d80e1e', details: ['hybrid aero, glass interface'] },
  { id: 'build-init', category: 'software', code: 'INIT', year: '2026-05-02', type: 'build', field: 'VESTRIPPN', title: 'Initial commit', result: '81b7ef7' },

  /* media */
  { id: 'studygram', category: 'media', type: 'link hub', field: 'study notes', title: 'shankusu.studygram', links: [{ label: 'linktree', url: 'https://linktr.ee/shankusu.studygram' }] },
];

/* University summaries, by year → module → subject. Year 3 folders are not
   published yet. */
export type UniversityModule = { label: string; href?: string; subjects: { code: string; name: string }[] };
export type UniversityYear = { year: string; modules: UniversityModule[] };

export const UNIVERSITY_SUMMARIES: UniversityYear[] = [
  {
    year: 'Y1',
    modules: [
      { label: 'term 1', href: 'https://drive.google.com/drive/folders/1P7CTRwWOGVGyM7n5nbFDbppoK5P72Pqx', subjects: [
        { code: 'MBH', name: 'Molecular Basis of Human Body' },
        { code: 'HGD', name: 'Human Genetics and Developmental Biology' },
      ] },
      { label: 'term 2', href: 'https://drive.google.com/drive/folders/1soEWnZ6YpzaMIWIj6jEo4ZLXeK1buyoB', subjects: [
        { code: 'MFN', name: 'Metabolism of Fuel Nutrients in Human' },
        { code: 'ABM', name: 'Applied Biochemistry in Medicine' },
        { code: 'BMR', name: 'Intro to Biomedical Research' },
      ] },
    ],
  },
  {
    year: 'Y2',
    modules: [
      { label: 'module 1', href: 'https://drive.google.com/drive/folders/1LGag8DnkZLljngHvkhPcL6EmKoFHdkH-', subjects: [
        { code: 'BHCB', name: 'Basic Histology and Cell Biology' },
        { code: 'HIM', name: 'Human Immunology' },
        { code: 'EHP', name: 'Essential Human Physiology' },
        { code: 'HGA', name: 'Human Gross Anatomy' },
      ] },
      { label: 'module 2', href: 'https://drive.google.com/drive/folders/1BmrfGiFtl43mOMoVNdmXcyjIa4MCbc3q', subjects: [
        { code: 'HMS-1', name: 'Human Musculoskeletal System-1' },
        { code: 'HCVS-1', name: 'Human Cardiovascular System-1' },
        { code: 'HRS-1', name: 'Human Respiratory System-1' },
      ] },
      { label: 'module 3', href: 'https://drive.google.com/drive/folders/1p-2WhF7NCklH9JlUuH0ple3eG2K6Ig2m', subjects: [
        { code: 'HGB-1', name: 'Human Gastrointestinal and Biliary Tract System-1' },
        { code: 'HRP-1', name: 'Human Reproductive System and Perinatal Period-1' },
      ] },
      { label: 'module 4', href: 'https://drive.google.com/drive/folders/1I5mz0LQMIHMc8eV4v8Z4vCQ4wldTzIvb', subjects: [
        { code: 'HRU-1', name: 'Human Renal and Urinary System-1' },
        { code: 'HNS-1', name: 'Human Nervous and Special Senses System-1' },
      ] },
      { label: 'module 5', href: 'https://drive.google.com/drive/folders/1SqowuBE7bu17JtPVmvriOL4ZpCp1Ak2J', subjects: [
        { code: 'MHI', name: 'Microbiology of Human Infectious Diseases' },
        { code: 'PHI', name: 'Parasitology of Human Infectious Diseases' },
        { code: 'BAP', name: 'Basic Human Anatomical Pathology' },
        { code: 'BCP', name: 'Basic Clinical Pharmacology' },
        { code: 'HEN-1', name: 'Human Endocrine System-1' },
      ] },
    ],
  },
  {
    year: 'Y3',
    modules: [
      { label: 'module 1', subjects: [
        { code: 'HEN-2', name: 'Human Endocrine System-2' },
        { code: 'HMS-2', name: 'Human Musculoskeletal System-2' },
        { code: 'HNS-2', name: 'Human Nervous and Special Senses System-2' },
      ] },
      { label: 'module 2', subjects: [
        { code: 'HCVS-2', name: 'Human Cardiovascular System-2' },
        { code: 'HRS-2', name: 'Human Respiratory System-2' },
        { code: 'HGB-2', name: 'Human Gastrointestinal and Biliary Tract System-2' },
      ] },
      { label: 'module 3', subjects: [
        { code: 'HHL', name: 'Human Hematopoietic and Lymphoreticular System' },
        { code: 'HSC', name: 'Human Skin and Connective Tissue' },
      ] },
      { label: 'module 4', subjects: [
        { code: 'HRP-2', name: 'Human Reproductive System and Perinatal Period-2' },
        { code: 'HRU-2', name: 'Human Renal and Urinary System-2' },
        { code: 'ACP', name: 'Applied Clinical Pharmacology' },
      ] },
      { label: 'module 5', subjects: [
        { code: 'BEH', name: 'Behavioral Science' },
        { code: 'ERS-1', name: 'Essential Research Skill-1' },
        { code: 'ICH', name: 'Intro to Community Health' },
      ] },
      { label: 'module 6', subjects: [
        { code: 'IFH', name: 'Intro to Family Health' },
        { code: 'FCP-1', name: 'Fundamentals of Clinical Practice-1' },
      ] },
    ],
  },
];
