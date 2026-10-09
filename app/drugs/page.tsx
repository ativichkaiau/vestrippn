import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/system/primitives';
import { DRUG_BASIS, DRUGS, drugStructure } from '@/lib/drugs';
import DrugIndex from './DrugIndex';

export const metadata: Metadata = {
  title: 'Drug cards',
  description: 'Class, mechanism, typical adult dose, pitfalls and the skeletal formula of high-yield drugs.',
};

export default function DrugsPage() {
  const drawn = DRUGS.filter((drug) => drugStructure(drug.slug)).length;
  return (
    <Page wide>
      <PageHeader
        label="medicine / drugs"
        title="Drug cards"
        lede="High-yield drugs for anaesthesia, ICU and the wards: class, mechanism, typical adult dose, pitfalls, and the structure drawn the same way as the background."
        meta={[
          { key: 'cards', value: String(DRUGS.length).padStart(2, '0') },
          { key: 'structures', value: String(drawn).padStart(2, '0') },
        ]}
      />
      <DrugIndex />
      <p className="sys-drug-basis" role="note">
        <b>study aid</b> · {DRUG_BASIS}
      </p>
    </Page>
  );
}
