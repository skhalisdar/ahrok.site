'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SyncIcon,
  AlertIcon,
  CheckCircleFillIcon,
  HomeIcon,
  HomeFillIcon,
  StackIcon,
  ChecklistIcon,
  BellIcon,
  BellFillIcon,
  DotFillIcon,
} from '@primer/octicons-react'
import {
  projectProgress,
  TASK_PRIORITIES,
  type DemoProject,
  type DemoWorkspace,
  type TaskPriority,
} from '@/lib/fieldrelay-demo'
import { useDemoWorkspace } from './use-demo-workspace'
import { ProgressBar, PriorityBadge, StatusBadge } from './fr-shared'
import { TaskRow } from './task-row'
import { PhoneFrame } from '../phone-frame'

type Tab = 'home' | 'projects' | 'add' | 'tasks' | 'alerts'

const fieldLabel = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--fr-text-muted)',
}

function Logo() {
  return (
    <span className="demo-logo-chip" style={{ height: 32 }}>
      {/* The source artwork has generous whitespace; render it taller than
          the chip and clip to keep the lockup tight and undistorted. */}
      <img
        src="/brand/fieldrelay-logo.png"
        alt="FieldRelay"
        width={94}
        height={50}
        style={{ height: 50, width: 'auto', objectFit: 'contain' }}
      />
    </span>
  )
}

export function FieldRelayDemo() {
  const {
    workspace,
    addProject,
    addTask,
    updateTaskPriority,
    updateTaskStatus,
    toggleComplete,
    addNote,
    deleteTask,
    resetWorkspace,
  } = useDemoWorkspace()

  const [tab, setTab] = useState<Tab>('home')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )

  if (!workspace) {
    return (
      <PhoneFrame>
        <div
          className="fr-demo demo-app"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--fr-text-muted)',
            fontSize: 14,
          }}
        >
          Loading demo…
        </div>
      </PhoneFrame>
    )
  }

  function openProject(id: string) {
    setSelectedProjectId(id)
    setTab('projects')
  }

  function goAddProject(input: {
    name: string
    client: string
    description: string
  }) {
    const id = addProject(input)
    setSelectedProjectId(id)
    setTab('projects')
  }

  function goAddTask(input: {
    projectId: string
    title: string
    priority: TaskPriority
  }) {
    addTask(input)
    setTab('tasks')
  }

  return (
    <PhoneFrame>
      <div className="fr-demo demo-app">
        {/* App header */}
        <header
          style={{
            padding: '16px 16px 0',
            backgroundColor: 'var(--fr-surface)',
            borderBottom: '1px solid var(--fr-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <Logo />
            <Link
              href="/products"
              className="fr-icon-btn"
              aria-label="Exit demo"
            >
              <XIcon size={18} />
            </Link>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 0 9px',
              fontSize: 11,
              color: 'var(--fr-text-faint)',
            }}
          >
            <DotFillIcon size={10} />
            Demo workspace — sample data only
          </div>
        </header>

        {/* Scrollable app body */}
        <div className="demo-body">
          {tab === 'home' && (
            <HomeScreen
              workspace={workspace}
              onOpenProject={openProject}
              onReset={() => {
                resetWorkspace()
                setSelectedProjectId(null)
                setTab('home')
              }}
            />
          )}

          {tab === 'projects' && (
            <ProjectsScreen
              workspace={workspace}
              selectedProjectId={selectedProjectId}
              onOpenProject={(id) => setSelectedProjectId(id)}
              onBack={() => setSelectedProjectId(null)}
              onAddTask={addTask}
              onSetPriority={updateTaskPriority}
              onSetStatus={updateTaskStatus}
              onToggleComplete={toggleComplete}
              onAddNote={addNote}
              onDeleteTask={deleteTask}
              onStartNewProject={() => setTab('add')}
            />
          )}

          {tab === 'add' && (
            <AddScreen
              workspace={workspace}
              onAddProject={goAddProject}
              onAddTask={goAddTask}
            />
          )}

          {tab === 'tasks' && (
            <TasksScreen
              workspace={workspace}
              onSetPriority={updateTaskPriority}
              onSetStatus={updateTaskStatus}
              onToggleComplete={toggleComplete}
              onAddNote={addNote}
              onDeleteTask={deleteTask}
            />
          )}

          {tab === 'alerts' && <AlertsScreen workspace={workspace} />}
        </div>

        {/* Bottom navigation */}
        <nav className="demo-nav" aria-label="FieldRelay sections">
          <NavItem
            label="Home"
            active={tab === 'home'}
            onClick={() => setTab('home')}
            icon={tab === 'home' ? <HomeFillIcon size={20} /> : <HomeIcon size={20} />}
          />
          <NavItem
            label="Projects"
            active={tab === 'projects'}
            onClick={() => {
              setSelectedProjectId(null)
              setTab('projects')
            }}
            icon={<StackIcon size={20} />}
          />
          <div className="demo-nav-add-slot" data-active={tab === 'add'}>
            <button
              type="button"
              className="demo-nav-add"
              onClick={() => setTab('add')}
              aria-label="Add"
              aria-current={tab === 'add' ? 'page' : undefined}
            >
              <PlusIcon size={22} />
            </button>
            <span className="demo-nav-add-label">Add</span>
          </div>
          <NavItem
            label="Tasks"
            active={tab === 'tasks'}
            onClick={() => setTab('tasks')}
            icon={<ChecklistIcon size={20} />}
          />
          <NavItem
            label="Alerts"
            active={tab === 'alerts'}
            onClick={() => setTab('alerts')}
            icon={tab === 'alerts' ? <BellFillIcon size={20} /> : <BellIcon size={20} />}
          />
        </nav>
      </div>
    </PhoneFrame>
  )
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="demo-nav-item"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      {label}
    </button>
  )
}

/* ----------------------------- Home ----------------------------- */

function HomeScreen({
  workspace,
  onOpenProject,
  onReset,
}: {
  workspace: DemoWorkspace
  onOpenProject: (id: string) => void
  onReset: () => void
}) {
  const [confirmReset, setConfirmReset] = useState(false)
  const openTasks = workspace.tasks.filter((t) => t.status !== 'Done').length
  const inProgress = workspace.tasks.filter(
    (t) => t.status === 'In Progress',
  ).length
  const done = workspace.tasks.filter((t) => t.status === 'Done').length
  const total = workspace.tasks.length
  const overall = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div style={{ padding: '18px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--fr-text-muted)' }}>
          {workspace.company}
        </div>
        <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em', margin: '2px 0 0' }}>
          Today&apos;s overview
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard label="Active projects" value={workspace.projects.length} />
        <StatCard label="Open tasks" value={openTasks} />
        <StatCard label="In progress" value={inProgress} />
        <StatCard label="Completed" value={done} accent="success" />
      </div>

      <div className="fr-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>Overall progress</span>
          <span style={{ color: 'var(--fr-text-muted)' }}>{overall}%</span>
        </div>
        <ProgressBar percent={overall} />
        <span style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>
          {done} of {total} tasks complete across all projects
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Your projects</h2>
        {workspace.projects.map((project) => {
          const { total: t, done: d, percent } = projectProgress(workspace, project.id)
          return (
            <button
              key={project.id}
              type="button"
              className="fr-card"
              onClick={() => onOpenProject(project.id)}
              style={{
                textAlign: 'left',
                padding: 15,
                display: 'flex',
                flexDirection: 'column',
                gap: 11,
                cursor: 'pointer',
                color: 'inherit',
                font: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{project.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 2 }}>
                    {project.client || 'No client set'}
                  </div>
                </div>
                <ArrowRightIcon size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fr-text-muted)' }}>
                  <span>{d} / {t} tasks</span>
                  <span>{percent}%</span>
                </div>
                <ProgressBar percent={percent} />
              </div>
            </button>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 4,
          paddingTop: 16,
          borderTop: '1px solid var(--fr-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {confirmReset ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="fr-btn fr-btn-primary" style={{ flex: 1 }} onClick={onReset}>
              Confirm reset
            </button>
            <button type="button" className="fr-btn fr-btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="fr-btn fr-btn-ghost" onClick={() => setConfirmReset(true)}>
            <SyncIcon size={15} />
            Reset Demo Data
          </button>
        )}
        <p style={{ fontSize: 11, color: 'var(--fr-text-faint)', margin: 0, textAlign: 'center' }}>
          Demo workspace — sample data only. Nothing is saved off your device.
        </p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: 'success'
}) {
  return (
    <div className="fr-card" style={{ padding: '14px 15px' }}>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.1,
          color: accent === 'success' ? 'var(--fr-success)' : 'var(--fr-text)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}

/* --------------------------- Projects --------------------------- */

function ProjectsScreen({
  workspace,
  selectedProjectId,
  onOpenProject,
  onBack,
  onAddTask,
  onSetPriority,
  onSetStatus,
  onToggleComplete,
  onAddNote,
  onDeleteTask,
  onStartNewProject,
}: {
  workspace: DemoWorkspace
  selectedProjectId: string | null
  onOpenProject: (id: string) => void
  onBack: () => void
  onAddTask: (input: { projectId: string; title: string; priority: TaskPriority }) => void
  onSetPriority: (taskId: string, priority: TaskPriority) => void
  onSetStatus: (taskId: string, status: import('@/lib/fieldrelay-demo').TaskStatus) => void
  onToggleComplete: (taskId: string) => void
  onAddNote: (taskId: string, body: string) => void
  onDeleteTask: (taskId: string) => void
  onStartNewProject: () => void
}) {
  const project =
    workspace.projects.find((p) => p.id === selectedProjectId) ?? null

  if (project) {
    return (
      <ProjectDetail
        project={project}
        workspace={workspace}
        onBack={onBack}
        onAddTask={onAddTask}
        onSetPriority={onSetPriority}
        onSetStatus={onSetStatus}
        onToggleComplete={onToggleComplete}
        onAddNote={onAddNote}
        onDeleteTask={onDeleteTask}
      />
    )
  }

  return (
    <div style={{ padding: '18px 16px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Projects
        </h1>
        <button type="button" className="fr-btn fr-btn-primary" onClick={onStartNewProject}>
          <PlusIcon size={15} />
          New
        </button>
      </div>

      {workspace.projects.map((project) => {
        const { total, done, percent } = projectProgress(workspace, project.id)
        return (
          <button
            key={project.id}
            type="button"
            className="fr-card"
            onClick={() => onOpenProject(project.id)}
            style={{
              textAlign: 'left',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              cursor: 'pointer',
              color: 'inherit',
              font: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{project.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 2 }}>
                  {project.client || 'No client set'}
                </div>
              </div>
              <ArrowRightIcon size={16} />
            </div>
            {project.description && (
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--fr-text-muted)', margin: 0 }}>
                {project.description}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fr-text-muted)' }}>
                <span>{done} / {total} tasks</span>
                <span>{percent}%</span>
              </div>
              <ProgressBar percent={percent} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ProjectDetail({
  project,
  workspace,
  onBack,
  onAddTask,
  onSetPriority,
  onSetStatus,
  onToggleComplete,
  onAddNote,
  onDeleteTask,
}: {
  project: DemoProject
  workspace: DemoWorkspace
  onBack: () => void
  onAddTask: (input: { projectId: string; title: string; priority: TaskPriority }) => void
  onSetPriority: (taskId: string, priority: TaskPriority) => void
  onSetStatus: (taskId: string, status: import('@/lib/fieldrelay-demo').TaskStatus) => void
  onToggleComplete: (taskId: string) => void
  onAddNote: (taskId: string, body: string) => void
  onDeleteTask: (taskId: string) => void
}) {
  const tasks = workspace.tasks.filter((t) => t.projectId === project.id)
  const { total, done, percent } = projectProgress(workspace, project.id)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [showForm, setShowForm] = useState(false)

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAddTask({ projectId: project.id, title, priority })
    setTitle('')
    setPriority('Medium')
    setShowForm(false)
  }

  return (
    <div style={{ padding: '14px 16px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button type="button" className="fr-btn fr-btn-quiet" onClick={onBack} style={{ alignSelf: 'flex-start', marginLeft: -8 }}>
        <ArrowLeftIcon size={15} />
        All projects
      </button>

      <div>
        <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          {project.name}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 3 }}>
          {project.client || 'No client set'}
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--fr-text-muted)', margin: 0 }}>
          {project.description}
        </p>
      )}

      <div className="fr-card" style={{ padding: 15, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>Progress</span>
          <span style={{ color: 'var(--fr-text-muted)' }}>{done} / {total} · {percent}%</span>
        </div>
        <ProgressBar percent={percent} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Tasks ({tasks.length})</h2>
        {!showForm && (
          <button type="button" className="fr-btn fr-btn-ghost" onClick={() => setShowForm(true)}>
            <PlusIcon size={15} />
            Add task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitTask} className="fr-card" style={{ padding: 15, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={fieldLabel}>
            Task title
            <input
              className="fr-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Install drywall on east wall"
              autoFocus
            />
          </label>
          <label style={fieldLabel}>
            Priority
            <select className="fr-select" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="fr-btn fr-btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="fr-btn fr-btn-primary" style={{ flex: 1, opacity: title.trim() ? 1 : 0.5 }} disabled={!title.trim()}>
              Add task
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            body="Add your first task to start tracking this project."
          />
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onSetPriority={(p) => onSetPriority(task.id, p)}
              onSetStatus={(s) => onSetStatus(task.id, s)}
              onToggleComplete={() => onToggleComplete(task.id)}
              onAddNote={(body) => onAddNote(task.id, body)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ----------------------------- Add ------------------------------ */

function AddScreen({
  workspace,
  onAddProject,
  onAddTask,
}: {
  workspace: DemoWorkspace
  onAddProject: (input: { name: string; client: string; description: string }) => void
  onAddTask: (input: { projectId: string; title: string; priority: TaskPriority }) => void
}) {
  const [mode, setMode] = useState<'task' | 'project'>('task')

  return (
    <div style={{ padding: '18px 16px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
        Add new
      </h1>

      <div
        role="tablist"
        aria-label="What to add"
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          backgroundColor: 'var(--fr-surface)',
          border: '1px solid var(--fr-border)',
          borderRadius: 12,
        }}
      >
        <SegBtn active={mode === 'task'} onClick={() => setMode('task')}>Task</SegBtn>
        <SegBtn active={mode === 'project'} onClick={() => setMode('project')}>Project</SegBtn>
      </div>

      {mode === 'task' ? (
        workspace.projects.length === 0 ? (
          <EmptyState title="No projects yet" body="Create a project first, then add tasks to it." />
        ) : (
          <NewTaskForm workspace={workspace} onCreate={onAddTask} />
        )
      ) : (
        <NewProjectForm onCreate={onAddProject} />
      )}
    </div>
  )
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="fr-btn"
      style={{
        flex: 1,
        backgroundColor: active ? 'var(--fr-accent)' : 'transparent',
        color: active ? '#1a120c' : 'var(--fr-text-muted)',
      }}
    >
      {children}
    </button>
  )
}

function NewTaskForm({
  workspace,
  onCreate,
}: {
  workspace: DemoWorkspace
  onCreate: (input: { projectId: string; title: string; priority: TaskPriority }) => void
}) {
  const [projectId, setProjectId] = useState(workspace.projects[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('Medium')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !projectId) return
    onCreate({ projectId, title, priority })
  }

  return (
    <form onSubmit={submit} className="fr-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={fieldLabel}>
        Project
        <select className="fr-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {workspace.projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      <label style={fieldLabel}>
        Task title
        <input
          className="fr-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Pour foundation footings"
        />
      </label>
      <label style={fieldLabel}>
        Priority
        <select className="fr-select" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="fr-btn fr-btn-primary" disabled={!title.trim()} style={{ opacity: title.trim() ? 1 : 0.5 }}>
        <PlusIcon size={15} />
        Add task
      </button>
    </form>
  )
}

function NewProjectForm({
  onCreate,
}: {
  onCreate: (input: { name: string; client: string; description: string }) => void
}) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [description, setDescription] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name, client, description })
  }

  return (
    <form onSubmit={submit} className="fr-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={fieldLabel}>
        Project name
        <input
          className="fr-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Brooklyn Cafe Buildout"
        />
      </label>
      <label style={fieldLabel}>
        Client
        <input
          className="fr-input"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="e.g. Riverside Hospitality"
        />
      </label>
      <label style={fieldLabel}>
        Description
        <textarea
          className="fr-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is the scope of this project?"
        />
      </label>
      <button type="submit" className="fr-btn fr-btn-primary" disabled={!name.trim()} style={{ opacity: name.trim() ? 1 : 0.5 }}>
        <PlusIcon size={15} />
        Create project
      </button>
    </form>
  )
}

/* ---------------------------- Tasks ----------------------------- */

const TASK_FILTERS = ['All', 'To Do', 'In Progress', 'Done'] as const
type TaskFilter = (typeof TASK_FILTERS)[number]

function TasksScreen({
  workspace,
  onSetPriority,
  onSetStatus,
  onToggleComplete,
  onAddNote,
  onDeleteTask,
}: {
  workspace: DemoWorkspace
  onSetPriority: (taskId: string, priority: TaskPriority) => void
  onSetStatus: (taskId: string, status: import('@/lib/fieldrelay-demo').TaskStatus) => void
  onToggleComplete: (taskId: string) => void
  onAddNote: (taskId: string, body: string) => void
  onDeleteTask: (taskId: string) => void
}) {
  const [filter, setFilter] = useState<TaskFilter>('All')
  const projectName = (id: string) =>
    workspace.projects.find((p) => p.id === id)?.name ?? 'Project'

  const tasks = workspace.tasks.filter((t) =>
    filter === 'All' ? true : t.status === filter,
  )

  return (
    <div style={{ padding: '18px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
        All tasks
      </h1>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {TASK_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="fr-btn"
            style={{
              flexShrink: 0,
              padding: '6px 13px',
              fontSize: 13,
              backgroundColor: filter === f ? 'var(--fr-accent)' : 'var(--fr-surface)',
              color: filter === f ? '#1a120c' : 'var(--fr-text-muted)',
              border: filter === f ? '1px solid transparent' : '1px solid var(--fr-border)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="Nothing here"
          body={filter === 'All' ? 'No tasks yet. Add one from the + button.' : `No ${filter.toLowerCase()} tasks right now.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              projectName={projectName(task.projectId)}
              onSetPriority={(p) => onSetPriority(task.id, p)}
              onSetStatus={(s) => onSetStatus(task.id, s)}
              onToggleComplete={() => onToggleComplete(task.id)}
              onAddNote={(body) => onAddNote(task.id, body)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Alerts ---------------------------- */

function AlertsScreen({ workspace }: { workspace: DemoWorkspace }) {
  const projectName = (id: string) =>
    workspace.projects.find((p) => p.id === id)?.name ?? 'Project'

  const highPriority = workspace.tasks.filter(
    (t) => t.priority === 'High' && t.status !== 'Done',
  )
  const inProgress = workspace.tasks.filter((t) => t.status === 'In Progress')
  const completed = workspace.tasks.filter((t) => t.status === 'Done')

  const empty =
    highPriority.length === 0 && inProgress.length === 0 && completed.length === 0

  return (
    <div style={{ padding: '18px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
        Alerts
      </h1>

      {empty && <EmptyState title="All caught up" body="No alerts right now." />}

      {highPriority.length > 0 && (
        <AlertGroup title="Needs attention">
          {highPriority.map((t) => (
            <AlertItem
              key={t.id}
              tone="attention"
              icon={<AlertIcon size={16} />}
              title={t.title}
              meta={`High priority · ${projectName(t.projectId)}`}
            />
          ))}
        </AlertGroup>
      )}

      {inProgress.length > 0 && (
        <AlertGroup title="In progress">
          {inProgress.map((t) => (
            <AlertItem
              key={t.id}
              tone="progress"
              icon={<SyncIcon size={16} />}
              title={t.title}
              meta={projectName(t.projectId)}
            />
          ))}
        </AlertGroup>
      )}

      {completed.length > 0 && (
        <AlertGroup title="Recently completed">
          {completed.map((t) => (
            <AlertItem
              key={t.id}
              tone="success"
              icon={<CheckCircleFillIcon size={16} />}
              title={t.title}
              meta={projectName(t.projectId)}
            />
          ))}
        </AlertGroup>
      )}
    </div>
  )
}

function AlertGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fr-text-faint)', margin: 0 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function AlertItem({
  tone,
  icon,
  title,
  meta,
}: {
  tone: 'attention' | 'progress' | 'success'
  icon: React.ReactNode
  title: string
  meta: string
}) {
  const color =
    tone === 'success'
      ? 'var(--fr-success)'
      : tone === 'attention'
        ? '#f0865a'
        : '#dcc070'
  return (
    <div className="fr-card" style={{ padding: 13, display: 'flex', alignItems: 'flex-start', gap: 11 }}>
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 8,
          color,
          backgroundColor: 'var(--fr-surface-raised)',
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  )
}

/* --------------------------- Shared ----------------------------- */

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="fr-card"
      style={{
        padding: '32px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--fr-text-muted)' }}>{body}</div>
    </div>
  )
}
