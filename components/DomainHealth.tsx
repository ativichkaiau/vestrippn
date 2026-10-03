'use client';

import { useHydrated } from './system/hooks';
import { useStoredValue, writeStored } from './system/useStoredValue';

const initialDomains = [
  { name: 'Academics', status: 'good' },
  { name: 'Research', status: 'warning' },
  { name: 'Fitness', status: 'good' },
  { name: 'Diet', status: 'good' },
  { name: 'Chores', status: 'warning' },
  { name: 'IELTS', status: 'inactive' },
  { name: 'Gaming', status: 'good' },
];

// Bumped to v3 to ensure a clean state with the new aesthetic.
const DOMAIN_KEY = 'vestrippn-domain-health-v3';
const DOMAIN_EVENT = 'vest:domain-health-change';
function readDomains(): typeof initialDomains {
  const saved = localStorage.getItem(DOMAIN_KEY);
  if (!saved) return initialDomains;
  const parsed: unknown = JSON.parse(saved);
  return Array.isArray(parsed) ? (parsed as typeof initialDomains) : initialDomains;
}

export default function DomainHealth() {
  const domains = useStoredValue(readDomains, initialDomains, [DOMAIN_EVENT]);
  const isMounted = useHydrated();

  const toggleStatus = (index: number) => {
    const currentStatus = domains[index].status;
    const nextStatus = currentStatus === 'good' ? 'warning' : currentStatus === 'warning' ? 'inactive' : 'good';
    const newDomains = domains.map((domain, i) => (i === index ? { ...domain, status: nextStatus } : domain));

    writeStored(DOMAIN_KEY, newDomains, DOMAIN_EVENT);
  };

  // good → active, warning → attention, inactive → idle. Click cycles.
  const STATE: Record<string, { state: 'active' | 'experimental' | 'planned'; label: string }> = {
    good: { state: 'active', label: 'active' },
    warning: { state: 'experimental', label: 'attention' },
    inactive: { state: 'planned', label: 'idle' },
  };

  if (!isMounted) {
    return (
      <div className="sys-skel-group" aria-busy="true" aria-label="Loading domains">
        {initialDomains.map((domain) => (
          <span key={domain.name} className="sys-skel" style={{ height: 36 }} />
        ))}
      </div>
    );
  }

  return (
    <ul className="sys-domains" aria-label="Domains — select to change state">
      {domains.map((domain, index) => {
        const current = STATE[domain.status] ?? STATE.inactive;
        return (
          <li key={domain.name}>
            <button type="button" onClick={() => toggleStatus(index)} aria-label={`${domain.name}: ${current.label}. Change state.`}>
              <span>{domain.name.toLowerCase()}</span>
              <span className="sys-status" data-state={current.state}>
                {current.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
