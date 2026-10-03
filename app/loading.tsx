'use client';

import { useState } from 'react';
import RequestedPath from '@/components/system/RequestedPath';

/* ════════════════════════════════════════════════════════════════════════
   Route loader — shown by Next only while a route is genuinely streaming.
   No artificial delay: if the route is ready in 100 ms, this is visible for
   100 ms. The shell stays in place; only the main viewport waits.

   The fact stays: it is content, not chrome — one of 67, drawn at random.
   ════════════════════════════════════════════════════════════════════════ */

const FACTS = [
  'The human brain can process an entire image in as little as 13 milliseconds.',
  'A Formula 1 car can brake from 200 km/h to a standstill in about 4 seconds.',
  'PubMed indexes over 36 million biomedical citations.',
  'Spaced repetition can boost long-term retention by up to 200%.',
  'Your heart beats roughly 100,000 times every single day.',
  'An F1 crew can change all four tyres in under 2.5 seconds.',
  'Systematic reviews sit at the very top of the evidence pyramid.',
  'The brain uses about 20% of the body’s total energy.',
  'The first modern randomized controlled trial was published in 1948.',
  'The fastest F1 pit stop on record is 1.8 seconds — all four tyres changed.',
  'Retrieval practice — testing yourself — beats re-reading for long-term recall.',
  'Interleaving topics while you study outperforms blocking one subject at a time.',
  'Reading one paper a day adds up to 365 papers in a year.',
  'Focus tends to run in ~90-minute ultradian cycles — work with them.',
  // Medicine
  'Red blood cells live about 120 days before they are broken down and recycled.',
  'Adults have 206 bones; a newborn has around 270 that fuse as it grows.',
  'The cornea has no blood vessels — it takes most of its oxygen straight from the air.',
  'Your kidneys filter about 180 litres of plasma a day, yet make only 1–2 litres of urine.',
  'Stomach acid sits at a pH of roughly 1.5 to 3.5.',
  'The liver can regrow to full size after as much as two-thirds of it is removed.',
  'About 98% of the oxygen in your blood rides on haemoglobin; only ~2% is dissolved.',
  'A normal resting heart rate is 60–100 beats per minute, paced by the SA node.',
  'Myelinated nerve fibres can carry signals at up to about 120 metres per second.',
  'The adult human brain holds roughly 86 billion neurons.',
  'Insulin was first given to a patient in 1922 — 14-year-old Leonard Thompson, in Toronto.',
  'Alexander Fleming discovered penicillin in 1928.',
  'Willem Einthoven won the 1924 Nobel Prize for inventing the electrocardiogram.',
  'Wilhelm Röntgen took the first X-ray image in 1895 — of his wife’s hand.',
  'Pedro and Josep Brugada first described Brugada syndrome in 1992.',
  'Neutrophils make up roughly half to two-thirds of all white blood cells.',
  'The stapes, in the middle ear, is the smallest bone in the body.',
  // How learning works
  'Sleep after studying helps lock memories in — the hippocampus replays the day’s learning.',
  'Hermann Ebbinghaus mapped the forgetting curve in 1885, memorising nonsense syllables.',
  'Working memory holds only about four chunks of information at once.',
  'Aerobic exercise raises BDNF, a protein that supports learning and memory.',
  'Losing even about 2% of body weight to dehydration can blunt attention.',
  'Caffeine’s half-life in adults is about 5 hours.',
  'Caffeine keeps you alert by blocking adenosine, which builds up the longer you’re awake.',
  'The Pomodoro Technique — 25 minutes on, 5 off — was devised by Francesco Cirillo in the late 1980s.',
  // Research and evidence
  'The PRISMA guideline for reporting systematic reviews appeared in 2009 and was updated in 2020.',
  'Cochrane was founded in 1993 and named after epidemiologist Archie Cochrane.',
  'On a forest plot, the diamond is the pooled estimate; its width is the confidence interval.',
  'I² estimates how much of the variation between studies reflects real heterogeneity, not chance.',
  'GRADE rates the certainty of evidence as high, moderate, low or very low.',
  'Number needed to treat (NNT) is simply 1 divided by the absolute risk reduction.',
  'A p-value is not the probability that the null hypothesis is true.',
  'PROSPERO, launched in 2011, registers systematic review protocols before the work begins.',
  'The Declaration of Helsinki, the cornerstone of research ethics, was adopted in 1964.',
  'James Lind ran one of the first controlled trials in 1747, testing remedies for scurvy.',
  'John Snow traced the 1854 Broad Street cholera outbreak to a single water pump.',
  'Florence Nightingale used polar-area charts to show most Crimean War deaths were preventable.',
  // F1 and the liveries
  'Mercedes’ W05 won 16 of 19 races in 2014, the first season of the V6 hybrid era.',
  'An F1 MGU-K can deploy up to 120 kW — about 160 hp — of electrical power.',
  'Williams’ 1993 FW15C combined active suspension, traction control and ABS.',
  'Damon Hill won the 1996 World Championship driving the Williams FW18.',
  'Ayrton Senna won three world titles: 1988, 1990 and 1991.',
  'Sebastian Vettel won nine races in a row in 2013 in the Red Bull RB9.',
  'Red Bull Racing won both world championships four years running, 2010 to 2013.',
  'Max Verstappen became F1’s youngest race winner at 18, at the 2016 Spanish Grand Prix.',
  'Max Verstappen won 19 of 22 Grands Prix in 2023 — a single-season record.',
  'Williams’ Martini-striped FW36 of 2014 was the team’s first car with Mercedes power.',
  'F1 drivers can lose 2–3 kg of body weight through sweat in a hot race.',
  // Training
  'Muscle protein synthesis stays elevated for roughly 24–48 hours after resistance training.',
  'The WHO recommends adults get at least 150 minutes of moderate activity a week.',
  'VO₂ max is one of the strongest single predictors of long-term survival.',
  // IELTS
  'IELTS band scores run from 0 to 9 in half-band steps.',
  'The IELTS Listening recording is played once only — there are no replays.',
];

export default function Loading() {
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);

  return (
    <div className="sys-page" role="status" aria-busy="true">
      <div className="sys-loader">
        <p className="sys-label">VESTRIPPN / loading</p>
        <p className="sys-mono" style={{ color: 'var(--text-strong)', fontSize: 'var(--text-sm)', margin: 0 }}>
          loading environment… <span className="sys-muted"><RequestedPath /></span>
        </p>
        <span className="sys-loader-bar" aria-hidden="true" />
        {/* Random per render: when this streams from the server, hydration keeps
            the server's pick rather than flagging the client's as a mismatch. */}
        <p className="sys-loader-fact" suppressHydrationWarning>
          <span className="sys-label" style={{ display: 'block', marginBottom: 6 }}>
            fact
          </span>
          {fact}
        </p>
      </div>
    </div>
  );
}
