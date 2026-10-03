'use client';

import { useCallback, useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from 'react';
import {
  DEFAULT_NAV,
  MAX_CUSTOM,
  MAX_LABEL,
  NAV_GROUPS,
  checkHref,
  checkLabel,
  isExternalHref,
  newCustomId,
  resolveNav,
  toEntries,
  ROOT_TAB_ID,
  type NavGroupId,
  type ResolvedNav,
  type ResolvedNavItem,
} from '@/lib/system/nav-layout';
import { NAV_EDIT_EVENT, saveNav } from '@/lib/system/nav-store';
import { toast } from '@/lib/toast-bus';
import { useNav } from './hooks';

/* ════════════════════════════════════════════════════════════════════════
   Customize tabs — rename, reorder, hide and add the sidebar's tabs.

   Edits happen on a draft; nothing changes until "save". Reorder by
   dragging the handle or with the ↑ ↓ buttons. The saved layout is a
   synced preference, so it follows the operator to every signed-in device.
   ════════════════════════════════════════════════════════════════════════ */

type Draft = ResolvedNav;
type AddForm = { label: string; href: string; group: NavGroupId };
const EMPTY_FORM: AddForm = { label: '', href: '', group: 'environment' };

const cloneNav = (nav: ResolvedNav): Draft => ({
  environment: nav.environment.map((item) => ({ ...item })),
  runtime: nav.runtime.map((item) => ({ ...item })),
});

// Comparison key for "has anything changed". Deliberately not the validating
// serializer: a draft may hold a half-typed (invalid) name.
const layoutKey = (nav: ResolvedNav) => JSON.stringify(toEntries(nav));
const DEFAULT_KEY = layoutKey(resolveNav(DEFAULT_NAV));

export default function NavEditor() {
  const nav = useNav();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const dragged = useRef<{ group: NavGroupId; id: string } | null>(null);
  const navRef = useRef(nav);
  const titleId = useId();
  const formId = useId();

  useEffect(() => {
    navRef.current = nav;
  }, [nav]);

  useEffect(() => {
    const open = () => {
      setDraft(cloneNav(navRef.current));
      setForm(EMPTY_FORM);
      setFormError(null);
      setAnnouncement('');
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
    };
    window.addEventListener(NAV_EDIT_EVENT, open);
    return () => window.removeEventListener(NAV_EDIT_EVENT, open);
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const update = (group: NavGroupId, id: string, patch: Partial<ResolvedNavItem>) =>
    setDraft((current) =>
      current && { ...current, [group]: current[group].map((item) => (item.id === id ? { ...item, ...patch } : item)) },
    );

  const move = (group: NavGroupId, from: number, to: number) => {
    if (!draft || to < 0 || to >= draft[group].length || from < 0 || from === to) return;
    const items = [...draft[group]];
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    setDraft({ ...draft, [group]: items });
    setAnnouncement(`${item.label} moved to position ${to + 1} of ${items.length} in ${group}.`);
  };

  const remove = (group: NavGroupId, item: ResolvedNavItem) => {
    setDraft((current) => current && { ...current, [group]: current[group].filter((entry) => entry.id !== item.id) });
    setAnnouncement(`${item.label} removed.`);
  };

  const onDrop = (group: NavGroupId, targetId: string) => (event: DragEvent) => {
    event.preventDefault();
    const source = dragged.current;
    dragged.current = null;
    if (!draft || !source || source.group !== group) return;
    const items = draft[group];
    move(group, items.findIndex((item) => item.id === source.id), items.findIndex((item) => item.id === targetId));
  };

  const addTab = (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const label = checkLabel(form.label);
    if (typeof label !== 'string') return setFormError(label.error);
    const href = checkHref(form.href);
    if (typeof href !== 'string') return setFormError(href.error);
    if (NAV_GROUPS.flatMap((group) => draft[group]).filter((item) => item.custom).length >= MAX_CUSTOM) {
      return setFormError(`You can add up to ${MAX_CUSTOM} of your own tabs.`);
    }
    const external = isExternalHref(href);
    const item: ResolvedNavItem = {
      id: newCustomId(),
      group: form.group,
      label,
      href,
      match: external ? [] : [href.split(/[?#]/)[0]],
      custom: true,
      external,
      hidden: false,
    };
    setDraft({ ...draft, [form.group]: [...draft[form.group], item] });
    setForm({ ...EMPTY_FORM, group: form.group });
    setFormError(null);
    setAnnouncement(`${label} added to ${form.group}.`);
  };

  const errors = draft
    ? NAV_GROUPS.flatMap((group) => draft[group]).flatMap((item) => {
        const label = checkLabel(item.label);
        const href = item.custom ? checkHref(item.href) : item.href;
        return [
          ...(typeof label === 'string' ? [] : [[item.id, 'label', label.error] as const]),
          ...(typeof href === 'string' ? [] : [[item.id, 'href', href.error] as const]),
        ];
      })
    : [];
  const errorFor = (id: string, field: 'label' | 'href') => errors.find(([itemId, f]) => itemId === id && f === field)?.[2];

  const dirty = draft ? layoutKey(draft) !== layoutKey(nav) : false;
  const isDefault = draft ? layoutKey(draft) === DEFAULT_KEY : true;

  const save = () => {
    if (!draft || errors.length) return;
    const normalised = cloneNav(draft);
    for (const group of NAV_GROUPS) {
      for (const item of normalised[group]) {
        item.label = checkLabel(item.label) as string;
        if (item.custom) item.href = checkHref(item.href) as string;
      }
    }
    saveNav(toEntries(normalised));
    close();
    toast({ id: 'nav', title: 'tabs saved', message: 'Your navigation follows you to every signed-in device.', variant: 'success' });
  };

  const reset = () => {
    setDraft(cloneNav(resolveNav(DEFAULT_NAV)));
    setAnnouncement('All tabs reset to their defaults. Save to keep this.');
  };

  return (
    <dialog
      ref={dialogRef}
      className="sys-palette sys-nav-editor"
      aria-labelledby={titleId}
      onClose={() => setDraft(null)}
      onClick={(event) => {
        if (event.target === event.currentTarget && !dirty) close();
      }}
    >
      {draft && (
        <>
          <div className="sys-nav-editor-head">
            <div>
              <h2 id={titleId}>customize tabs</h2>
              <p>Rename, reorder, hide, or add your own links. Saved to your account.</p>
            </div>
            <button type="button" className="sys-icon-button" aria-label="Close without saving" onClick={close}>
              ✕
            </button>
          </div>

          <div className="sys-nav-editor-body sys-scroll">
            {NAV_GROUPS.map((group) => (
              <section key={group} className="sys-nav-editor-group" aria-labelledby={`${formId}-${group}`}>
                <h3 id={`${formId}-${group}`} className="sys-label">
                  {group}
                </h3>
                <ol>
                  {draft[group].map((item, i) => {
                    const labelError = errorFor(item.id, 'label');
                    const hrefError = errorFor(item.id, 'href');
                    const locked = item.id === ROOT_TAB_ID;
                    return (
                      <li
                        key={item.id}
                        className="sys-nav-editor-row"
                        data-hidden={item.hidden || undefined}
                        onDragOver={(event) => {
                          if (dragged.current?.group === group) event.preventDefault();
                        }}
                        onDrop={onDrop(group, item.id)}
                      >
                        <span
                          className="sys-nav-editor-handle"
                          draggable
                          aria-hidden="true"
                          title="Drag to reorder"
                          onDragStart={(event) => {
                            dragged.current = { group, id: item.id };
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/plain', item.label);
                          }}
                          onDragEnd={() => {
                            dragged.current = null;
                          }}
                        >
                          ⋮⋮
                        </span>
                        <div className="sys-nav-editor-fields">
                          <input
                            className="sys-input"
                            value={item.label}
                            maxLength={MAX_LABEL + 8}
                            aria-label={`Name for ${item.defaultLabel ?? 'custom tab'}`}
                            aria-invalid={labelError ? true : undefined}
                            onChange={(event) => update(group, item.id, { label: event.target.value })}
                          />
                          {item.custom ? (
                            <input
                              className="sys-input sys-nav-editor-href"
                              value={item.href}
                              aria-label={`Link for ${item.label || 'custom tab'}`}
                              aria-invalid={hrefError ? true : undefined}
                              spellCheck={false}
                              onChange={(event) => {
                                const href = event.target.value;
                                const external = isExternalHref(href.trim());
                                update(group, item.id, { href, external, match: external ? [] : [href.trim().split(/[?#]/)[0]] });
                              }}
                            />
                          ) : (
                            <small>
                              {item.href.split('?')[0]}
                              {item.label !== item.defaultLabel && <> · was “{item.defaultLabel}”</>}
                            </small>
                          )}
                          {(labelError || hrefError) && (
                            <small className="sys-nav-editor-error" role="alert">
                              {labelError ?? hrefError}
                            </small>
                          )}
                        </div>
                        <div className="sys-nav-editor-controls">
                          <label className="sys-nav-editor-toggle" title={locked ? 'root is always shown' : undefined}>
                            <input
                              type="checkbox"
                              checked={!item.hidden}
                              disabled={locked}
                              onChange={(event) => update(group, item.id, { hidden: !event.target.checked })}
                            />
                            {item.hidden ? 'hidden' : 'shown'}
                          </label>
                          <button type="button" className="sys-icon-button" aria-label={`Move ${item.label} up`} disabled={i === 0} onClick={() => move(group, i, i - 1)}>
                            ↑
                          </button>
                          <button
                            type="button"
                            className="sys-icon-button"
                            aria-label={`Move ${item.label} down`}
                            disabled={i === draft[group].length - 1}
                            onClick={() => move(group, i, i + 1)}
                          >
                            ↓
                          </button>
                          {item.custom ? (
                            <button type="button" className="sys-icon-button" aria-label={`Remove ${item.label}`} onClick={() => remove(group, item)}>
                              ✕
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="sys-icon-button"
                              aria-label={`Restore the name ${item.defaultLabel}`}
                              title={`Restore “${item.defaultLabel}”`}
                              disabled={item.label === item.defaultLabel}
                              onClick={() => update(group, item.id, { label: item.defaultLabel ?? item.label })}
                            >
                              ↺
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}

            <form className="sys-nav-editor-add" onSubmit={addTab} aria-labelledby={`${formId}-add`} noValidate>
              <h3 id={`${formId}-add`} className="sys-label">
                add a tab
              </h3>
              <div className="sys-nav-editor-add-fields">
                <label>
                  <span>name</span>
                  <input className="sys-input" value={form.label} maxLength={MAX_LABEL + 8} placeholder="cases" onChange={(event) => setForm({ ...form, label: event.target.value })} />
                </label>
                <label>
                  <span>link</span>
                  <input
                    className="sys-input"
                    value={form.href}
                    placeholder="/learn/cases or https://…"
                    spellCheck={false}
                    autoCapitalize="off"
                    onChange={(event) => setForm({ ...form, href: event.target.value })}
                  />
                </label>
                <label>
                  <span>group</span>
                  <select className="sys-input" value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value as NavGroupId })}>
                    {NAV_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="sys-action">
                  add
                </button>
              </div>
              {formError && (
                <p className="sys-nav-editor-error" role="alert">
                  {formError}
                </p>
              )}
            </form>
          </div>

          <div className="sys-nav-editor-foot">
            <button type="button" className="sys-action" onClick={reset} disabled={isDefault}>
              reset to default
            </button>
            <span className="sys-nav-editor-spacer" />
            <button type="button" className="sys-action" onClick={close}>
              cancel
            </button>
            <button type="button" className="sys-action" data-variant="primary" onClick={save} disabled={!dirty || errors.length > 0}>
              save
            </button>
          </div>
          <p className="sys-visually-hidden" aria-live="polite">
            {announcement}
          </p>
        </>
      )}
    </dialog>
  );
}
