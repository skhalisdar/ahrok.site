export type TaskPriority = 'Low' | 'Medium' | 'High'
export type TaskStatus = 'To Do' | 'In Progress' | 'Done'

export interface TaskNote {
  id: string
  body: string
  createdAt: number
}

export interface DemoTask {
  id: string
  projectId: string
  title: string
  priority: TaskPriority
  status: TaskStatus
  notes: TaskNote[]
  createdAt: number
}

export interface DemoProject {
  id: string
  name: string
  client: string
  description: string
  createdAt: number
}

export interface DemoWorkspace {
  company: string
  projects: DemoProject[]
  tasks: DemoTask[]
}

export const DEMO_STORAGE_KEY = 'fieldrelay-demo-workspace-v1'

export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High']
export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done']

let idCounter = 0
export function createId(prefix: string): string {
  idCounter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${random}`
}

// Fictional sample data only. Not connected to any real system or customer.
export function getSeedWorkspace(): DemoWorkspace {
  const now = Date.now()
  const projectId = 'proj_queens_retail'

  return {
    company: 'MetroBuild Contracting',
    projects: [
      {
        id: projectId,
        name: 'Queens Retail Renovation',
        client: 'Northway Retail Group',
        description:
          'Full interior renovation of a 6,200 sq ft retail space in Queens, including demolition, electrical, and storefront buildout.',
        createdAt: now - 1000 * 60 * 60 * 24 * 9,
      },
    ],
    tasks: [
      {
        id: 'task_permits',
        projectId,
        title: 'Submit building permits to city',
        priority: 'High',
        status: 'Done',
        createdAt: now - 1000 * 60 * 60 * 24 * 8,
        notes: [
          {
            id: 'note_permit_1',
            body: 'Permits approved on the second submission. Copies filed with the project binder.',
            createdAt: now - 1000 * 60 * 60 * 24 * 5,
          },
        ],
      },
      {
        id: 'task_demo',
        projectId,
        title: 'Complete interior demolition',
        priority: 'High',
        status: 'In Progress',
        createdAt: now - 1000 * 60 * 60 * 24 * 6,
        notes: [
          {
            id: 'note_demo_1',
            body: 'North wall removed. Waiting on dumpster pickup before finishing the back rooms.',
            createdAt: now - 1000 * 60 * 60 * 24 * 2,
          },
        ],
      },
      {
        id: 'task_electrical',
        projectId,
        title: 'Rough-in electrical for sales floor',
        priority: 'Medium',
        status: 'To Do',
        createdAt: now - 1000 * 60 * 60 * 24 * 4,
        notes: [],
      },
      {
        id: 'task_storefront',
        projectId,
        title: 'Order storefront glass and framing',
        priority: 'Medium',
        status: 'To Do',
        createdAt: now - 1000 * 60 * 60 * 24 * 3,
        notes: [],
      },
      {
        id: 'task_walkthrough',
        projectId,
        title: 'Schedule client progress walkthrough',
        priority: 'Low',
        status: 'To Do',
        createdAt: now - 1000 * 60 * 60 * 24 * 1,
        notes: [],
      },
    ],
  }
}

export function projectProgress(
  workspace: DemoWorkspace,
  projectId: string,
): { total: number; done: number; percent: number } {
  const tasks = workspace.tasks.filter((t) => t.projectId === projectId)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'Done').length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, percent }
}
