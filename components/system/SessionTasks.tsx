'use client';

import { useId, useState, type FormEvent } from 'react';
import { addTask, deleteTask, toggleTask } from '@/app/actions';

/* The root session's task list — the former dashboard command list and its
   alerts, in one place. Optimistic updates; the server action revalidates
   the root route, which hands back the stored list. */

export type SessionTask = { id: string; title: string; completed: boolean; category: string };

export default function SessionTasks({ initialTasks }: { initialTasks: SessionTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState('');
  const inputId = useId();

  // Adopt the server's list whenever it changes (after a revalidation).
  const serverKey = JSON.stringify(initialTasks);
  const [adopted, setAdopted] = useState(serverKey);
  if (adopted !== serverKey) {
    setAdopted(serverKey);
    setTasks(initialTasks);
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    setTasks((current) => [{ id: `temp-${Date.now()}`, title, completed: false, category: 'COMMAND' }, ...current]);
    try {
      await addTask(title, 'COMMAND');
    } catch (error) {
      console.error('task: add failed', error);
    }
  }

  async function toggle(task: SessionTask) {
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, completed: !task.completed } : item)));
    try {
      await toggleTask(task.id, !task.completed);
    } catch (error) {
      console.error('task: toggle failed', error);
    }
  }

  async function remove(task: SessionTask) {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    if (task.id.startsWith('temp-')) return;
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('task: delete failed', error);
    }
  }

  const pending = tasks.filter((task) => !task.completed).length;

  return (
    <div className="sys-tasks">
      <form className="sys-task-form" onSubmit={add}>
        <label htmlFor={inputId} className="sys-visually-hidden">
          New task
        </label>
        <input id={inputId} className="sys-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="add task…" autoComplete="off" />
        <button type="submit" className="sys-action" disabled={!draft.trim()}>
          add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="sys-empty">no open tasks</p>
      ) : (
        <ul className="sys-task-list" aria-label="Tasks">
          {tasks.map((task) => (
            <li key={task.id} data-done={task.completed || undefined}>
              <label>
                <input type="checkbox" className="sys-check" checked={task.completed} onChange={() => toggle(task)} />
                <span>{task.title}</span>
              </label>
              {task.category === 'ALERT' && <span className="sys-label">alert</span>}
              <button type="button" className="sys-task-remove" onClick={() => remove(task)} aria-label={`Delete “${task.title}”`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="sys-task-count">
        {String(pending).padStart(2, '0')} pending · {String(tasks.length).padStart(2, '0')} total
      </p>
    </div>
  );
}
