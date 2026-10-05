import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MetadataGrid, Page, PageHeader, Section } from '@/components/system/primitives';
import Structure from '@/components/system/Structure';
import { DRUG_BASIS, DRUGS, drugStructure, getDrug } from '@/lib/drugs';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DRUGS.map((drug) => ({ slug: drug.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const drug = getDrug((await params).slug);
  return drug ? { title: `${drug.name} · drug card`, description: `${drug.name}: ${drug.class}.` } : {};
}

/** C13H16N2 → C₁₃H₁₆N₂; a trailing charge becomes superscript. */
function Formula({ value }: { value: string }) {
  const [, body, charge] = /^(.*?)([+-]\d*)?$/.exec(value) ?? [value, value, ''];
  return (
    <span className="sys-formula">
      {body.split(/(\d+)/).map((part, i) => (/^\d+$/.test(part) ? <sub key={i}>{part}</sub> : part))}
      {charge ? <sup>{charge.length > 1 ? `${charge.slice(1)}${charge[0]}` : charge}</sup> : null}
    </span>
  );
}

export default async function DrugPage({ params }: Params) {
  const drug = getDrug((await params).slug);
  if (!drug) notFound();
  const structure = drugStructure(drug.slug);
  const index = DRUGS.indexOf(drug);
  const previous = DRUGS[index - 1];
  const next = DRUGS[index + 1];

  return (
    <Page wide>
      <PageHeader
        label="medicine / drugs"
        title={drug.name}
        lede={drug.class}
        meta={[
          ...(drug.aliases.length ? [{ key: 'also', value: drug.aliases.join(' · ') }] : []),
          ...(structure ? [{ key: 'formula', value: <Formula value={structure.formula} /> }, { key: 'molar mass', value: `${structure.mass} g/mol` }] : []),
        ]}
      />

      <div className="sys-drug-card">
        <figure className="sys-drug-structure">
          {structure ? (
            <Structure data={structure} />
          ) : (
            <p className="sys-muted">{drug.structureNote ?? 'No structure on this card.'}</p>
          )}
          <figcaption>
            {structure ? (
              <>
                {drug.name} · <Formula value={structure.formula} /> · skeletal formula from{' '}
                {drug.cid ? (
                  <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${drug.cid}`} target="_blank" rel="noopener noreferrer">
                    PubChem CID {drug.cid}
                  </a>
                ) : (
                  'its SMILES'
                )}
              </>
            ) : (
              drug.name
            )}
          </figcaption>
        </figure>

        <div className="sys-drug-body">
          <Section id="mechanism" title="mechanism">
            <p className="sys-prose">{drug.mechanism}</p>
          </Section>
          <Section id="dose" title="typical adult dose">
            <MetadataGrid rows={drug.dose.map((dose) => ({ key: dose.use, value: dose.dose }))} label="Typical adult doses" />
            {drug.onset && <p className="sys-muted sys-drug-onset">onset · {drug.onset}</p>}
          </Section>
          <Section id="pitfalls" title="pitfalls" count={String(drug.pitfalls.length).padStart(2, '0')}>
            <ul className="sys-drug-pitfalls">
              {drug.pitfalls.map((pitfall) => (
                <li key={pitfall}>{pitfall}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      <p className="sys-drug-basis" role="note">
        <b>study aid</b> · {DRUG_BASIS}
      </p>

      <nav className="sys-drug-pager" aria-label="Other drug cards">
        {previous ? <Link href={`/drugs/${previous.slug}`}>← {previous.name}</Link> : <span />}
        <Link href="/drugs">all drug cards</Link>
        {next ? <Link href={`/drugs/${next.slug}`}>{next.name} →</Link> : <span />}
      </nav>
    </Page>
  );
}
