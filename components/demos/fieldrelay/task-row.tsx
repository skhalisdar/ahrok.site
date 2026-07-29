'use client'

import { useState } from 'react'
import {
  CheckCircleFillIcon,
  CircleIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@primer/octicons-react'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type DemoTask,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/fieldrelay-demo'
import { PriorityBadge, StatusBadge } from './fr-shared'

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function TaskRow({
  task,
  projectName,
  onSetPriority,
  onSetStatus,
  onToggleComplete,
  onAddNote,
  onDelete,
}: {
  task: DemoTask
  projectName?: string
  onSetPriority: (priority: TaskPriority) => void
  onSetStatus: (status: TaskStatus) => void
  onToggleComplete: () => void
  onAddNote: (body: string) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const done = task.status === 'Done'

  function submitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    onAddNote(note)
    setNote('')
  }

  return (
    <div
      className="fr-card"
      style={{ padding: 14, backgroundColor: 'var(--fr-surface-raised)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          type="button"
          onClick={onToggleComplete}
          className="fr-icon-btn"
          aria-pressed={done}
          aria-label={done ? 'Mark task as not done' : 'Mark task complete'}
          style={{ flexShrink: 0, color: done ? 'var(--fr-accent)' : undefined }}
        >
          {done ? (
            <CheckCircleFillIcon size={20} />
          ) : (
            <CircleIcon size={20} />
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {projectName && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--fr-text-faint)',
                marginBottom: 3,
              }}
            >
              {projectName}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: done ? 'var(--fr-text-faint)' : 'var(--fr-text)',
                textDecoration: done ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            <button
              type="button"
              className="fr-btn fr-btn-quiet"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              style={{ marginLeft: 'auto' }}
            >
              {expanded ? (
                <ChevronDownIcon size={14} />
              ) : (
                <ChevronRightIcon size={14} />
              )}
              {task.notes.length > 0
                ? `${task.notes.length} note${task.notes.length === 1 ? '' : 's'}`
                : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid var(--fr-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--fr-text-muted)',
              }}
            >
              Priority
              <select
                className="fr-select"
                value={task.priority}
                onChange={(e) =>
                  onSetPriority(e.target.value as TaskPriority)
                }
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--fr-text-muted)',
              }}
            >
              Status
              <select
                className="fr-select"
                value={task.status}
                onChange={(e) => onSetStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--fr-text-muted)',
              }}
            >
              Notes
            </span>
            {task.notes.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--fr-text-faint)',
                  margin: 0,
                }}
              >
                No notes yet. Add the first update below.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {task.notes.map((n) => (
                  <li
                    key={n.id}
                    style={{
                      backgroundColor: 'var(--fr-bg)',
                      border: '1px solid var(--fr-border)',
                      borderRadius: 8,
                      padding: '8px 11px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        margin: 0,
                        color: 'var(--fr-text)',
                      }}
                    >
                      {n.body}
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--fr-text-faint)',
                      }}
                    >
                      {formatWhen(n.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={submitNote}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <textarea
                className="fr-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this task..."
                aria-label="New task note"
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="fr-btn fr-btn-quiet"
                  onClick={onDelete}
                  style={{ color: '#e5704f' }}
                >
                  <TrashIcon size={14} />
                  Delete task
                </button>
                <button
                  type="submit"
                  className="fr-btn fr-btn-ghost"
                  disabled={!note.trim()}
                  style={{ opacity: note.trim() ? 1 : 0.5 }}
                >
                  Add note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
