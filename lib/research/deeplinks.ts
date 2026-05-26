/**
 * ClinicalKey + Google Scholar have no public APIs — surface them as deep
 * links instead. The frontend renders these as "Search on X ↗" buttons that
 * open the user's query in a new tab.
 */
export interface DeepLink {
  source: "clinicalkey" | "googlescholar";
  label: string;
  url: string;
}

export function deepLinks(query: string): DeepLink[] {
  const q = encodeURIComponent(query.trim());
  if (!q) return [];
  return [
    {
      source: "googlescholar",
      label: "Search on Google Scholar",
      url: `https://scholar.google.com/scholar?q=${q}`,
    },
    {
      source: "clinicalkey",
      label: "Search on ClinicalKey",
      url: `https://www.clinicalkey.com/#!/search/${q}/%7B%22page%22:1%7D`,
    },
  ];
}
