'use client'

import type { TaskPriority, TaskStatus } from '@/lib/fieldrelay-demo'

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        height: 8,
        width: '100%',
        borderRadius: 999,
        backgroundColor: 'var(--fr-border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percent}%`,
          borderRadius: 999,
          backgroundColor: 'var(--fr-accent)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}

const priorityColors: Record<TaskPriority, { bg: string; fg: string }> = {
  High: { bg: 'rgba(226, 99, 42, 0.16)', fg: '#f0865a' },
  Medium: { bg: 'rgba(212, 175, 55, 0.15)', fg: '#d9bd6a' },
  Low: { bg: 'rgba(255,255,255,0.07)', fg: '#b6ab9c' },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = priorityColors[priority]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 9px',
        borderRadius: 999,
        backgroundColor: c.bg,
        color: c.fg,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: 'currentColor',
        }}
      />
      {priority}
    </span>
  )
}

// Warm, construction-yard palette only — green reserved for "Done" (success).
const statusColors: Record<TaskStatus, { bg: string; fg: string }> = {
  'To Do': { bg: 'rgba(255,255,255,0.07)', fg: '#b6ab9c' },
  'In Progress': { bg: 'rgba(217, 189, 106, 0.16)', fg: '#dcc070' },
  Done: { bg: 'rgba(63, 185, 80, 0.16)', fg: '#5cc46a' },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const c = statusColors[status]
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 9px',
        borderRadius: 999,
        backgroundColor: c.bg,
        color: c.fg,
      }}
    >
      {status}
    </span>
  )
}
