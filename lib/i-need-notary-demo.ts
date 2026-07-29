// Fictional, browser-local sample data for the "I Need Notary" demo.
// This is an early concept preview only — not connected to any real
// notary, customer, appointment, payment, document upload, or e-signature.

export type RequestStatus = 'Requested' | 'Scheduled' | 'Completed'
export type ServiceMode = 'Mobile' | 'In-Office' | 'Online'

export const DOCUMENT_TYPES = [
  'Power of Attorney',
  'Real Estate Deed',
  'Affidavit',
  'Loan Document',
  'Will or Trust',
  'Vehicle Title',
  'Other',
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const SERVICE_MODES: ServiceMode[] = ['Mobile', 'In-Office', 'Online']
export const REQUEST_STATUSES: RequestStatus[] = [
  'Requested',
  'Scheduled',
  'Completed',
]

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface NotaryNote {
  id: string
  body: string
  createdAt: number
}

export interface NotaryRequest {
  id: string
  clientName: string
  documentType: DocumentType
  status: RequestStatus
  mode: ServiceMode
  /** Scheduled appointment time (ms). Null while still "Requested". */
  appointmentAt: number | null
  location: string
  checklist: ChecklistItem[]
  notes: NotaryNote[]
  createdAt: number
}

export interface NotaryWorkspace {
  org: string
  requests: NotaryRequest[]
}

export const NOTARY_STORAGE_KEY = 'i-need-notary-demo-v1'

let idCounter = 0
export function createId(prefix: string): string {
  idCounter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${random}`
}

// A sensible default document checklist for a given document type.
export function defaultChecklist(type: DocumentType): ChecklistItem[] {
  const base: string[] = ['Valid government photo ID', 'Unsigned document ready']
  const extra: Record<DocumentType, string[]> = {
    'Power of Attorney': ['Principal present', 'Witness confirmed'],
    'Real Estate Deed': ['Property address verified', 'All signers present'],
    Affidavit: ['Statement reviewed'],
    'Loan Document': ['Full loan package printed', 'Lender instructions'],
    'Will or Trust': ['Two witnesses confirmed'],
    'Vehicle Title': ['Title in hand', 'Odometer reading noted'],
    Other: [],
  }
  return [...base, ...extra[type]].map((label) => ({
    id: createId('chk'),
    label,
    done: false,
  }))
}

export function getSeedWorkspace(): NotaryWorkspace {
  const now = Date.now()
  const hour = 1000 * 60 * 60
  const day = hour * 24

  function withChecklist(
    type: DocumentType,
    doneCount: number,
  ): ChecklistItem[] {
    return defaultChecklist(type).map((item, index) => ({
      ...item,
      done: index < doneCount,
    }))
  }

  return {
    org: 'I Need Notary',
    requests: [
      {
        id: 'req_poa_johnson',
        clientName: 'Amelia Johnson',
        documentType: 'Power of Attorney',
        status: 'Scheduled',
        mode: 'Mobile',
        appointmentAt: now + hour * 5,
        location: 'Notary travels to client',
        checklist: withChecklist('Power of Attorney', 2),
        notes: [
          {
            id: 'note_seed_1',
            body: 'Client requested an afternoon visit. Bring blue ink pens.',
            createdAt: now - hour * 3,
          },
        ],
        createdAt: now - day * 2,
      },
      {
        id: 'req_deed_okafor',
        clientName: 'Daniel Okafor',
        documentType: 'Real Estate Deed',
        status: 'Scheduled',
        mode: 'In-Office',
        appointmentAt: now + day * 1 + hour * 2,
        location: 'Front desk, Suite 204',
        checklist: withChecklist('Real Estate Deed', 1),
        notes: [],
        createdAt: now - day * 1,
      },
      {
        id: 'req_affidavit_reyes',
        clientName: 'Sofia Reyes',
        documentType: 'Affidavit',
        status: 'Requested',
        mode: 'Online',
        appointmentAt: null,
        location: 'Remote session',
        checklist: withChecklist('Affidavit', 0),
        notes: [],
        createdAt: now - hour * 6,
      },
      {
        id: 'req_title_chen',
        clientName: 'Marcus Chen',
        documentType: 'Vehicle Title',
        status: 'Completed',
        mode: 'In-Office',
        appointmentAt: now - day * 1,
        location: 'Front desk, Suite 204',
        checklist: withChecklist('Vehicle Title', 4),
        notes: [
          {
            id: 'note_seed_2',
            body: 'Notarized and returned. Client satisfied.',
            createdAt: now - day * 1 + hour,
          },
        ],
        createdAt: now - day * 3,
      },
    ],
  }
}

export interface NotaryMetrics {
  open: number
  scheduled: number
  completed: number
  nextAppointmentAt: number | null
}

export function computeMetrics(workspace: NotaryWorkspace): NotaryMetrics {
  const open = workspace.requests.filter((r) => r.status === 'Requested').length
  const scheduledReqs = workspace.requests.filter(
    (r) => r.status === 'Scheduled',
  )
  const completed = workspace.requests.filter(
    (r) => r.status === 'Completed',
  ).length

  const upcoming = scheduledReqs
    .map((r) => r.appointmentAt)
    .filter((t): t is number => typeof t === 'number' && t >= Date.now())
    .sort((a, b) => a - b)

  return {
    open,
    scheduled: scheduledReqs.length,
    completed,
    nextAppointmentAt: upcoming[0] ?? null,
  }
}

export function checklistProgress(request: NotaryRequest): number {
  if (request.checklist.length === 0) return 0
  const done = request.checklist.filter((c) => c.done).length
  return Math.round((done / request.checklist.length) * 100)
}

export function formatAppointment(timestamp: number | null): string {
  if (timestamp === null) return 'Not scheduled'
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const future = diff < 0
  const abs = Math.abs(diff)

  if (abs < minute) return 'just now'
  if (abs < hour) {
    const m = Math.round(abs / minute)
    return future ? `in ${m} min` : `${m} min ago`
  }
  if (abs < day) {
    const h = Math.round(abs / hour)
    const unit = h === 1 ? 'hour' : 'hours'
    return future ? `in ${h} ${unit}` : `${h} ${unit} ago`
  }
  const d = Math.round(abs / day)
  if (d === 1) return future ? 'tomorrow' : 'yesterday'
  return future ? `in ${d} days` : `${d} days ago`
}
