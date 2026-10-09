/* ════════════════════════════════════════════════════════════════════════
   IELTS practice bank — original items, served straight from this file so
   practice works on every deploy without a seeding step. Rows in the
   IELTSItem table (if any) are served alongside these; the two `seed-ielts-*`
   ids match the old seed so nothing appears twice.

   answerKey.correctId never leaves the server: /api/learn/ielts/questions
   sends options only and /api/learn/ielts/answer grades.
   ════════════════════════════════════════════════════════════════════════ */

export type IeltsSectionId = 'reading' | 'listening' | 'writing' | 'speaking';

export type IeltsBankItem = {
  id: string;
  section: IeltsSectionId;
  skill: string;
  prompt: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  answerKey: { options: { id: string; label: string }[]; correctId: string; explanation: string };
};

const TFNG = [
  { id: 'true', label: 'True' },
  { id: 'false', label: 'False' },
  { id: 'not-given', label: 'Not Given' },
];

const SPACING = `Passage — Spaced repetition schedules reviews at increasing intervals. In one classroom study, students who spread four review sessions over two weeks recalled more material a month later than students who completed the same four sessions in a single afternoon.`;

const TRANSPLANT = `Passage — The first human-to-human heart transplant was performed in December 1967 in Cape Town by the surgeon Christiaan Barnard. The patient survived for eighteen days before dying of pneumonia.`;

export const IELTS_BANK: IeltsBankItem[] = [
  /* ── Reading: vocabulary ─────────────────────────────────────────────── */
  {
    id: 'seed-ielts-1', section: 'reading', skill: 'vocabulary', difficulty: 1, tags: ['vocabulary', 'synonyms'],
    prompt: 'Choose the word closest in meaning to "mitigate".',
    answerKey: { options: [{ id: 'a', label: 'Intensify' }, { id: 'b', label: 'Alleviate' }, { id: 'c', label: 'Postpone' }, { id: 'd', label: 'Ignore' }], correctId: 'b', explanation: 'To mitigate is to make something less severe — to alleviate it.' },
  },
  {
    id: 'seed-ielts-2', section: 'reading', skill: 'vocabulary', difficulty: 2, tags: ['vocabulary', 'synonyms'],
    prompt: 'Choose the word closest in meaning to "ubiquitous".',
    answerKey: { options: [{ id: 'a', label: 'Rare' }, { id: 'b', label: 'Hidden' }, { id: 'c', label: 'Everywhere' }, { id: 'd', label: 'Temporary' }], correctId: 'c', explanation: 'Ubiquitous means present, or seeming to be present, everywhere.' },
  },
  {
    id: 'ielts-r-03', section: 'reading', skill: 'vocabulary', difficulty: 1, tags: ['vocabulary', 'synonyms'],
    prompt: 'Choose the word closest in meaning to "deteriorate".',
    answerKey: { options: [{ id: 'a', label: 'Improve' }, { id: 'b', label: 'Stabilise' }, { id: 'c', label: 'Worsen' }, { id: 'd', label: 'Accelerate' }], correctId: 'c', explanation: 'To deteriorate is to become progressively worse — "the patient\'s condition deteriorated overnight".' },
  },
  {
    id: 'ielts-r-04', section: 'reading', skill: 'vocabulary', difficulty: 2, tags: ['vocabulary', 'synonyms'],
    prompt: 'Choose the word closest in meaning to "substantiate".',
    answerKey: { options: [{ id: 'a', label: 'Undermine' }, { id: 'b', label: 'Prove' }, { id: 'c', label: 'Estimate' }, { id: 'd', label: 'Summarise' }], correctId: 'b', explanation: 'To substantiate a claim is to support it with evidence — to prove it.' },
  },
  {
    id: 'ielts-r-05', section: 'reading', skill: 'vocabulary', difficulty: 2, tags: ['vocabulary', 'synonyms'],
    prompt: 'Choose the word closest in meaning to "inherent".',
    answerKey: { options: [{ id: 'a', label: 'Acquired' }, { id: 'b', label: 'Intrinsic' }, { id: 'c', label: 'Temporary' }, { id: 'd', label: 'External' }], correctId: 'b', explanation: 'Inherent describes a permanent, built-in quality — intrinsic, not acquired from outside.' },
  },
  {
    id: 'ielts-r-06', section: 'reading', skill: 'vocabulary', difficulty: 1, tags: ['vocabulary', 'synonyms'],
    prompt: 'Choose the word closest in meaning to "preliminary".',
    answerKey: { options: [{ id: 'a', label: 'Final' }, { id: 'b', label: 'Initial' }, { id: 'c', label: 'Detailed' }, { id: 'd', label: 'Optional' }], correctId: 'b', explanation: 'Preliminary means coming first, before the main part — "preliminary results".' },
  },

  /* ── Reading: True / False / Not Given ───────────────────────────────── */
  {
    id: 'ielts-r-07', section: 'reading', skill: 'true / false / not given', difficulty: 1, tags: ['tfng', 'passage'],
    prompt: `${SPACING}\n\nStatement: Both groups completed four review sessions.`,
    answerKey: { options: TFNG, correctId: 'true', explanation: 'The passage says the second group completed "the same four sessions", so both groups did four.' },
  },
  {
    id: 'ielts-r-08', section: 'reading', skill: 'true / false / not given', difficulty: 2, tags: ['tfng', 'passage'],
    prompt: `${SPACING}\n\nStatement: The group that spaced its reviews finished them in a single afternoon.`,
    answerKey: { options: TFNG, correctId: 'false', explanation: 'The spaced group spread its sessions over two weeks; it was the other group that used a single afternoon. The statement contradicts the passage.' },
  },
  {
    id: 'ielts-r-09', section: 'reading', skill: 'true / false / not given', difficulty: 2, tags: ['tfng', 'passage'],
    prompt: `${SPACING}\n\nStatement: The students in the study were studying medicine.`,
    answerKey: { options: TFNG, correctId: 'not-given', explanation: 'The passage never says what the students studied. With no information either way, the answer is Not Given.' },
  },
  {
    id: 'ielts-r-10', section: 'reading', skill: 'true / false / not given', difficulty: 1, tags: ['tfng', 'passage'],
    prompt: `${TRANSPLANT}\n\nStatement: The patient lived for less than three weeks after the operation.`,
    answerKey: { options: TFNG, correctId: 'true', explanation: 'Eighteen days is less than three weeks (21 days), so the statement agrees with the passage.' },
  },
  {
    id: 'ielts-r-11', section: 'reading', skill: 'true / false / not given', difficulty: 2, tags: ['tfng', 'passage'],
    prompt: `${TRANSPLANT}\n\nStatement: The patient died because his body rejected the new heart.`,
    answerKey: { options: TFNG, correctId: 'false', explanation: 'The passage gives the cause of death as pneumonia, which contradicts rejection.' },
  },
  {
    id: 'ielts-r-12', section: 'reading', skill: 'true / false / not given', difficulty: 3, tags: ['tfng', 'passage'],
    prompt: `${TRANSPLANT}\n\nStatement: Barnard had practised transplants on animals before 1967.`,
    answerKey: { options: TFNG, correctId: 'not-given', explanation: 'The passage says nothing about earlier work. Judge only by the text — outside knowledge does not count, so the answer is Not Given.' },
  },

  /* ── Listening: format and traps ─────────────────────────────────────── */
  {
    id: 'ielts-l-01', section: 'listening', skill: 'test format', difficulty: 1, tags: ['format'],
    prompt: 'How many times is each recording played in the IELTS Listening test?',
    answerKey: { options: [{ id: 'a', label: 'Once' }, { id: 'b', label: 'Twice' }, { id: 'c', label: 'Three times' }, { id: 'd', label: 'As often as you like' }], correctId: 'a', explanation: 'Each recording is played once only, so read the questions before each part begins.' },
  },
  {
    id: 'ielts-l-02', section: 'listening', skill: 'test format', difficulty: 1, tags: ['format'],
    prompt: 'How many questions does the IELTS Listening test contain?',
    answerKey: { options: [{ id: 'a', label: '30' }, { id: 'b', label: '40' }, { id: 'c', label: '50' }, { id: 'd', label: '60' }], correctId: 'b', explanation: 'There are 40 questions across four parts, each worth one mark.' },
  },
  {
    id: 'ielts-l-03', section: 'listening', skill: 'spelling', difficulty: 1, tags: ['spelling', 'form completion'],
    prompt: 'A speaker spells a surname: "That\'s W–A–double T–S." What do you write?',
    answerKey: { options: [{ id: 'a', label: 'WATS' }, { id: 'b', label: 'WATTS' }, { id: 'c', label: 'WAT TS' }, { id: 'd', label: 'WADDS' }], correctId: 'b', explanation: '"Double T" means the letter T twice, so the name is WATTS. Spelling must be exact to score.' },
  },
  {
    id: 'ielts-l-04', section: 'listening', skill: 'distractors', difficulty: 2, tags: ['distractors', 'dates'],
    prompt: 'You hear: "The appointment was on Tuesday the 14th — sorry, it\'s been moved to Thursday the 16th." The question asks for the appointment date. What do you write?',
    answerKey: { options: [{ id: 'a', label: 'Tuesday 14th' }, { id: 'b', label: 'Thursday 16th' }, { id: 'c', label: 'Thursday 14th' }, { id: 'd', label: 'Tuesday 16th' }], correctId: 'b', explanation: 'Speakers often correct themselves. The final, corrected information is the answer — here Thursday the 16th.' },
  },
  {
    id: 'ielts-l-05', section: 'listening', skill: 'word limits', difficulty: 2, tags: ['instructions', 'word limit'],
    prompt: 'The instructions say: write NO MORE THAN TWO WORDS AND/OR A NUMBER. Which answer breaks the rule?',
    answerKey: { options: [{ id: 'a', label: 'blood test' }, { id: 'b', label: '12 May' }, { id: 'c', label: 'a blood test' }, { id: 'd', label: 'test' }], correctId: 'c', explanation: 'Articles count as words: "a blood test" is three words, so it is marked wrong even though the content is right.' },
  },
  {
    id: 'ielts-l-06', section: 'listening', skill: 'test format', difficulty: 2, tags: ['format', 'paper-based'],
    prompt: 'In the paper-based Listening test, how much time do you get at the end to transfer answers to the answer sheet?',
    answerKey: { options: [{ id: 'a', label: 'No extra time' }, { id: 'b', label: '2 minutes' }, { id: 'c', label: '10 minutes' }, { id: 'd', label: '15 minutes' }], correctId: 'c', explanation: 'Paper-based candidates get 10 minutes to transfer answers. On the computer-delivered test you type answers as you go and get 2 minutes to check them.' },
  },
  {
    id: 'ielts-l-07', section: 'listening', skill: 'band scores', difficulty: 3, tags: ['band score', 'format'],
    prompt: 'A candidate scores Listening 8.5, Reading 8.5, Speaking 7.5 and Writing 7.0. What is the overall band?',
    answerKey: { options: [{ id: 'a', label: '7.0' }, { id: 'b', label: '7.5' }, { id: 'c', label: '8.0' }, { id: 'd', label: '8.5' }], correctId: 'c', explanation: 'The overall band is the mean of the four scores: 31.5 ÷ 4 = 7.875. An average ending in .75 rounds up to the next whole band, giving 8.0 (one ending in .25 rounds up to the next half band).' },
  },

  /* ── Writing ─────────────────────────────────────────────────────────── */
  {
    id: 'ielts-w-01', section: 'writing', skill: 'task requirements', difficulty: 1, tags: ['task 2', 'length'],
    prompt: 'What is the minimum length for Writing Task 2?',
    answerKey: { options: [{ id: 'a', label: '150 words' }, { id: 'b', label: '200 words' }, { id: 'c', label: '250 words' }, { id: 'd', label: '300 words' }], correctId: 'c', explanation: 'Task 2 needs at least 250 words; Task 1 needs at least 150.' },
  },
  {
    id: 'ielts-w-02', section: 'writing', skill: 'task requirements', difficulty: 1, tags: ['task 1', 'length'],
    prompt: 'What is the minimum length for Writing Task 1?',
    answerKey: { options: [{ id: 'a', label: '100 words' }, { id: 'b', label: '150 words' }, { id: 'c', label: '200 words' }, { id: 'd', label: '250 words' }], correctId: 'b', explanation: 'Task 1 needs at least 150 words. Plan about 20 minutes for it and 40 for Task 2.' },
  },
  {
    id: 'ielts-w-03', section: 'writing', skill: 'scoring', difficulty: 2, tags: ['weighting'],
    prompt: 'How is Writing Task 2 weighted compared with Task 1?',
    answerKey: { options: [{ id: 'a', label: 'They count equally' }, { id: 'b', label: 'Task 1 counts twice as much' }, { id: 'c', label: 'Task 2 counts twice as much' }, { id: 'd', label: 'Only Task 2 is scored' }], correctId: 'c', explanation: 'Task 2 contributes twice as much as Task 1 to the Writing band — another reason to give it 40 minutes.' },
  },
  {
    id: 'ielts-w-04', section: 'writing', skill: 'scoring', difficulty: 2, tags: ['criteria'],
    prompt: 'Which of these is one of the four Writing assessment criteria?',
    answerKey: { options: [{ id: 'a', label: 'Spelling Accuracy' }, { id: 'b', label: 'Coherence and Cohesion' }, { id: 'c', label: 'Handwriting' }, { id: 'd', label: 'Originality' }], correctId: 'b', explanation: 'The four criteria are Task Achievement (Task 1) or Task Response (Task 2), Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy — each worth a quarter.' },
  },
  {
    id: 'ielts-w-05', section: 'writing', skill: 'task 1', difficulty: 2, tags: ['task 1', 'overview'],
    prompt: 'In Academic Writing Task 1, what must a strong response include?',
    answerKey: { options: [{ id: 'a', label: 'Your opinion on the data' }, { id: 'b', label: 'A clear overview of the main trends' }, { id: 'c', label: 'Every number shown in the chart' }, { id: 'd', label: 'A recommendation for action' }], correctId: 'b', explanation: 'Task Achievement rewards a clear overview of the main features. Opinions and recommendations are not asked for, and listing every figure is not selecting key information.' },
  },
  {
    id: 'ielts-w-06', section: 'writing', skill: 'cohesion', difficulty: 2, tags: ['linkers'],
    prompt: 'Choose the best linker: "Vaccination rates rose sharply; ____, hospital admissions for measles fell."',
    answerKey: { options: [{ id: 'a', label: 'however' }, { id: 'b', label: 'consequently' }, { id: 'c', label: 'for instance' }, { id: 'd', label: 'moreover' }], correctId: 'b', explanation: 'The second clause is a result of the first, so a cause-and-effect linker fits: consequently.' },
  },
  {
    id: 'ielts-w-07', section: 'writing', skill: 'register', difficulty: 1, tags: ['academic style'],
    prompt: 'Which sentence is most appropriate for academic writing?',
    answerKey: { options: [{ id: 'a', label: "Kids nowadays don't exercise enough." }, { id: 'b', label: 'Children today do not get enough exercise.' }, { id: 'c', label: "Children today don't get enough exercise, right?" }, { id: 'd', label: 'Loads of kids hardly exercise.' }], correctId: 'b', explanation: 'Academic register avoids contractions, slang ("kids", "loads of") and conversational tags ("right?").' },
  },
  {
    id: 'ielts-w-08', section: 'writing', skill: 'task requirements', difficulty: 3, tags: ['task 2', 'length'],
    prompt: 'What happens if your Task 2 essay is under 250 words?',
    answerKey: { options: [{ id: 'a', label: 'Nothing — length is not assessed' }, { id: 'b', label: 'The essay is not marked' }, { id: 'c', label: 'You can be penalised under Task Response' }, { id: 'd', label: 'You lose exactly one band' }], correctId: 'c', explanation: 'An under-length answer is still marked, but it can be penalised in the Task Response criterion. There is no fixed deduction.' },
  },

  /* ── Speaking ────────────────────────────────────────────────────────── */
  {
    id: 'ielts-s-01', section: 'speaking', skill: 'test format', difficulty: 1, tags: ['format'],
    prompt: 'How long does the IELTS Speaking test last?',
    answerKey: { options: [{ id: 'a', label: '5–7 minutes' }, { id: 'b', label: '11–14 minutes' }, { id: 'c', label: '20–25 minutes' }, { id: 'd', label: '30 minutes' }], correctId: 'b', explanation: 'The Speaking test takes 11–14 minutes across three parts.' },
  },
  {
    id: 'ielts-s-02', section: 'speaking', skill: 'part 2', difficulty: 1, tags: ['part 2', 'format'],
    prompt: 'In Speaking Part 2, how long do you get to prepare after receiving the task card?',
    answerKey: { options: [{ id: 'a', label: 'No preparation time' }, { id: 'b', label: '30 seconds' }, { id: 'c', label: '1 minute' }, { id: 'd', label: '2 minutes' }], correctId: 'c', explanation: 'You get one minute to prepare, with paper and a pencil for notes.' },
  },
  {
    id: 'ielts-s-03', section: 'speaking', skill: 'part 2', difficulty: 1, tags: ['part 2', 'format'],
    prompt: 'In Speaking Part 2, how long should you speak?',
    answerKey: { options: [{ id: 'a', label: 'Up to 30 seconds' }, { id: 'b', label: '1–2 minutes' }, { id: 'c', label: '3–4 minutes' }, { id: 'd', label: '5 minutes' }], correctId: 'b', explanation: 'You speak for one to two minutes; the examiner stops you at two.' },
  },
  {
    id: 'ielts-s-04', section: 'speaking', skill: 'scoring', difficulty: 2, tags: ['criteria'],
    prompt: 'Which of these is NOT one of the Speaking assessment criteria?',
    answerKey: { options: [{ id: 'a', label: 'Fluency and Coherence' }, { id: 'b', label: 'Pronunciation' }, { id: 'c', label: 'Lexical Resource' }, { id: 'd', label: 'Whether your opinions are correct' }], correctId: 'd', explanation: 'The criteria are Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. Examiners assess your language, not whether they agree with you.' },
  },
  {
    id: 'ielts-s-05', section: 'speaking', skill: 'part 3', difficulty: 2, tags: ['part 3', 'strategy'],
    prompt: "In Part 3 the examiner asks about something you've never thought about. What is the best response?",
    answerKey: { options: [{ id: 'a', label: 'Say "I don\'t know" and stop' }, { id: 'b', label: 'Buy time naturally — "That\'s an interesting question; I suppose…" — then develop an answer' }, { id: 'c', label: 'Ask to skip the question' }, { id: 'd', label: 'Repeat your Part 2 answer' }], correctId: 'b', explanation: 'Part 3 rewards developing ideas. A short, natural thinking phrase keeps you fluent while you form an answer.' },
  },
];

export const IELTS_SECTIONS: IeltsSectionId[] = ['reading', 'listening', 'writing', 'speaking'];

export function findBankItem(id: string): IeltsBankItem | undefined {
  return IELTS_BANK.find((item) => item.id === id);
}
