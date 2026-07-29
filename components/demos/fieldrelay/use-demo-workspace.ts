'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEMO_STORAGE_KEY,
  createId,
  getSeedWorkspace,
  type DemoWorkspace,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/fieldrelay-demo'

function loadWorkspace(): DemoWorkspace {
  if (typeof window === 'undefined') return getSeedWorkspace()
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY)
    if (!raw) return getSeedWorkspace()
    const parsed = JSON.parse(raw) as DemoWorkspace
    if (!parsed || !Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) {
      return getSeedWorkspace()
    }
    return parsed
  } catch {
    return getSeedWorkspace()
  }
}

export function useDemoWorkspace() {
  const [workspace, setWorkspace] = useState<DemoWorkspace | null>(null)

  // Load the visitor's private workspace from localStorage on mount.
  useEffect(() => {
    setWorkspace(loadWorkspace())
  }, [])

  // Persist any change back to localStorage.
  useEffect(() => {
    if (!workspace) return
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(workspace))
    } catch {
      // Ignore write failures (private mode, quota, etc.) — demo is non-critical.
    }
  }, [workspace])

  const addProject = useCallback(
    (input: { name: string; client: string; description: string }) => {
      const project = {
        id: createId('proj'),
        name: input.name.trim(),
        client: input.client.trim(),
        description: input.description.trim(),
        createdAt: Date.now(),
      }
      setWorkspace((prev) =>
        prev ? { ...prev, projects: [...prev.projects, project] } : prev,
      )
      return project.id
    },
    [],
  )

  const addTask = useCallback(
    (input: { projectId: string; title: string; priority: TaskPriority }) => {
      const task = {
        id: createId('task'),
        projectId: input.projectId,
        title: input.title.trim(),
        priority: input.priority,
        status: 'To Do' as TaskStatus,
        notes: [],
        createdAt: Date.now(),
      }
      setWorkspace((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, task] } : prev,
      )
    },
    [],
  )

  const updateTaskPriority = useCallback(
    (taskId: string, priority: TaskPriority) => {
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === taskId ? { ...t, priority } : t,
              ),
            }
          : prev,
      )
    },
    [],
  )

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === taskId ? { ...t, status } : t,
              ),
            }
          : prev,
      )
    },
    [],
  )

  const toggleComplete = useCallback((taskId: string) => {
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: t.status === 'Done' ? 'To Do' : 'Done' }
                : t,
            ),
          }
        : prev,
    )
  }, [])

  const addNote = useCallback((taskId: string, body: string) => {
    const note = {
      id: createId('note'),
      body: body.trim(),
      createdAt: Date.now(),
    }
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId ? { ...t, notes: [...t.notes, note] } : t,
            ),
          }
        : prev,
    )
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setWorkspace((prev) =>
      prev
        ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }
        : prev,
    )
  }, [])

  const resetWorkspace = useCallback(() => {
    setWorkspace(getSeedWorkspace())
  }, [])

  return {
    workspace,
    addProject,
    addTask,
    updateTaskPriority,
    updateTaskStatus,
    toggleComplete,
    addNote,
    deleteTask,
    resetWorkspace,
  }
}
