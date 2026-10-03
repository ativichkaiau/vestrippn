import type { ReactNode } from 'react';

/* A short real excerpt with syntax highlighting. A single-pass tokenizer for
   the two languages the registry holds (TypeScript, Python) — enough for a
   dozen lines, without shipping a highlighter to the browser. */

const KEYWORDS = {
  ts: 'as async await break case catch class const continue default else export extends false for from function if import in interface let new null of return switch this throw true try type typeof undefined while',
  py: 'and as break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield',
} as const;

type Language = keyof typeof KEYWORDS;

function tokenizer(language: Language) {
  const comment = language === 'ts' ? String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/` : String.raw`#[^\n]*`;
  const string = language === 'ts' ? String.raw`'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\`(?:\\.|[^\`\\])*\`` : String.raw`'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"`;
  return new RegExp(
    `(?<comment>${comment})|(?<string>${string})|(?<number>\\b\\d+(?:\\.\\d+)?\\b)|(?<word>\\b[A-Za-z_][A-Za-z0-9_]*\\b)(?<call>\\s*\\()?`,
    'g',
  );
}

function highlight(code: string, language: Language): ReactNode[] {
  const keywords = new Set(KEYWORDS[language].split(' '));
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(tokenizer(language))) {
    const index = match.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const groups = match.groups ?? {};
    const key = `${index}`;
    if (groups.comment) out.push(<span key={key} className="tok-comment">{groups.comment}</span>);
    else if (groups.string) out.push(<span key={key} className="tok-string">{groups.string}</span>);
    else if (groups.number) out.push(<span key={key} className="tok-number">{groups.number}</span>);
    else if (groups.word) {
      const word = groups.word;
      const cls = keywords.has(word) ? 'tok-keyword' : groups.call ? 'tok-fn' : undefined;
      out.push(cls ? <span key={key} className={cls}>{word}</span> : word);
      if (groups.call) out.push(groups.call);
    }
    last = index + match[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeBlock({
  code,
  language,
  file,
  source,
}: {
  code: string;
  language: Language;
  file: string;
  source?: string;
}) {
  return (
    <figure className="sys-code">
      <figcaption>
        <span>{file}</span>
        {source ? (
          <a className="sys-command" data-external href={source} target="_blank" rel="noopener noreferrer">
            view source
          </a>
        ) : (
          <span>{language === 'ts' ? 'TypeScript' : 'Python'}</span>
        )}
      </figcaption>
      <pre tabIndex={0} aria-label={`Excerpt from ${file}`}>
        <code>{highlight(code, language)}</code>
      </pre>
    </figure>
  );
}
