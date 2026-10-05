'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { setLowPowerMode } from '@/components/useLowPower';
import { isWatermarkOn, setWatermark, WATERMARK_EVENT } from '@/components/useWatermark';
import { readNavLayout } from '@/lib/system/nav-layout';
import { getNavSnapshot, NAV_CHANGE_EVENT, saveNav } from '@/lib/system/nav-store';
import {
  appearanceOf,
  changedSettings,
  DEFAULT_SETTINGS,
  modeOf,
  parseSettingsJson,
  toSettingsJson,
  type Settings,
  type SettingsError,
} from '@/lib/system/settings-json';
import { getColorTheme, getLivery, getMode, isLowPower, setColorTheme, setTheme } from '@/lib/theme';
import { toast } from '@/lib/toast-bus';

/* The settings.json editor: a plain text area with a line-number gutter.
   Ctrl/⌘+S saves; Tab indents. While the file has no unsaved edits it
   follows changes made elsewhere (the Appearance view, another device). */

function currentSettings(): Settings {
  return {
    colorTheme: getColorTheme(),
    appearance: appearanceOf(getMode()),
    livery: getLivery(),
    lowPower: isLowPower(),
    watermark: isWatermarkOn(),
    tabs: readNavLayout(getNavSnapshot()),
  };
}

function apply(before: Settings, after: Settings): string[] {
  const changed = changedSettings(before, after);
  if (changed.includes('colorTheme')) setColorTheme(after.colorTheme);
  if (changed.includes('livery') || changed.includes('appearance')) setTheme(after.livery, modeOf(after.appearance));
  if (changed.includes('lowPower')) setLowPowerMode(after.lowPower);
  if (changed.includes('watermark')) setWatermark(after.watermark);
  if (changed.includes('tabs')) saveNav(after.tabs);
  return changed;
}

export default function SettingsJsonClient() {
  const [saved, setSaved] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<SettingsError[]>([]);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const errorsId = useId();
  const dirty = saved !== null && text !== saved;
  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Load, then follow outside changes while there is nothing unsaved.
  useEffect(() => {
    const load = () => {
      if (dirtyRef.current) return;
      const next = toSettingsJson(currentSettings());
      setSaved(next);
      setText(next);
    };
    load();
    const events = ['vest:theme-change', 'vest-lowpower', WATERMARK_EVENT, NAV_CHANGE_EVENT, 'storage'];
    for (const name of events) window.addEventListener(name, load);
    return () => {
      for (const name of events) window.removeEventListener(name, load);
    };
  }, []);

  const lines = useMemo(() => Math.max(1, text.split('\n').length), [text]);
  const errorLines = useMemo(() => new Set(errors.map((error) => error.line).filter(Boolean)), [errors]);

  const save = useCallback(() => {
    const result = parseSettingsJson(text);
    if (!result.ok) {
      setErrors(result.errors);
      toast({ id: 'settings', title: `settings.json: ${result.errors.length} problem${result.errors.length === 1 ? '' : 's'}`, message: 'Nothing was applied.', variant: 'warn' });
      return;
    }
    setErrors([]);
    const changed = apply(currentSettings(), result.settings);
    const next = toSettingsJson(currentSettings());
    setSaved(next);
    setText(next);
    toast({ id: 'settings', title: changed.length ? `settings saved · ${changed.join(', ')}` : 'settings.json: no changes', variant: 'success' });
  }, [text]);

  const goToLine = (line?: number) => {
    const area = areaRef.current;
    if (!area || !line) return;
    const offset = text.split('\n').slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    area.focus();
    area.setSelectionRange(offset, offset);
    area.scrollTop = Math.max(0, (line - 4) * 20);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      save();
    } else if (event.key === 'Tab' && !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey) {
      // Indent; Escape then Tab still leaves the editor (no keyboard trap).
      if (event.currentTarget.dataset.escaped) return;
      event.preventDefault();
      const area = event.currentTarget;
      const { selectionStart: start, selectionEnd: end } = area;
      const next = `${text.slice(0, start)}  ${text.slice(end)}`;
      setText(next);
      requestAnimationFrame(() => area.setSelectionRange(start + 2, start + 2));
    } else if (event.key === 'Escape') {
      event.currentTarget.dataset.escaped = '1';
    } else {
      delete event.currentTarget.dataset.escaped;
    }
  };

  if (saved === null) return <p className="sys-muted">loading settings…</p>;

  return (
    <section className="sys-settings" aria-label="settings.json editor">
      <div className="sys-settings-bar">
        <span className="sys-settings-file">
          settings.json{dirty && <span className="sys-settings-dirty" aria-label="unsaved changes"> ●</span>}
        </span>
        <span className="sys-muted">Tab indents · Esc then Tab leaves the editor</span>
        <div className="sys-settings-actions">
          <button type="button" className="sys-action" data-variant="primary" onClick={save} disabled={!dirty} aria-keyshortcuts="Control+S Meta+S">
            Save
          </button>
          <button
            type="button"
            className="sys-action"
            disabled={!dirty}
            onClick={() => {
              setText(saved);
              setErrors([]);
            }}
          >
            Revert
          </button>
          <button
            type="button"
            className="sys-action"
            onClick={() => {
              setText(toSettingsJson(DEFAULT_SETTINGS));
              setErrors([]);
            }}
            title="Load the defaults into the editor; Save applies them"
          >
            Defaults
          </button>
        </div>
      </div>
      <div className="sys-settings-editor">
        <div className="sys-settings-gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lines }, (_, i) => (
            <span key={i} data-error={errorLines.has(i + 1) || undefined}>
              {i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={areaRef}
          className="sys-settings-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          onScroll={(event) => {
            if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          wrap="off"
          aria-label="settings.json"
          aria-invalid={errors.length > 0}
          aria-describedby={errors.length ? errorsId : undefined}
        />
      </div>
      {errors.length > 0 && (
        <div id={errorsId} className="sys-settings-problems" role="alert">
          <p className="sys-label">problems · {errors.length}</p>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>
                <button type="button" onClick={() => goToLine(error.line)} disabled={!error.line}>
                  {error.line ? <kbd>Ln {error.line}</kbd> : null} {error.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
