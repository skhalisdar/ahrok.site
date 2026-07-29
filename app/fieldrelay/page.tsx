import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { LinkButton } from '@/components/link-button'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'FieldRelay | Construction Operations Without the Information Gaps',
  description:
    'FieldRelay helps general contractors, field crews, office teams, and clients coordinate projects, tasks, photos, documents, decisions, alerts, and work sessions.',
}

const painPoints = [
  {
    title: 'Updates scattered everywhere',
    copy: 'Photos, calls, texts, and job notes live in separate places, making the latest truth difficult to find.',
  },
  {
    title: 'Decisions become bottlenecks',
    copy: 'Approvals and client responses lose context, ownership, and a reliable record of when action happened.',
  },
  {
    title: 'The field and office drift apart',
    copy: 'Teams waste time asking who is on site, what changed, and whether urgent work has been handled.',
  },
]

const features = [
  ['P', 'Projects & tasks', 'Organize active jobs, ownership, priorities, status, progress, and task-linked evidence.'],
  ['C', 'Client coordination', 'Give clients a focused view for updates, documents, decisions, and acknowledgements.'],
  ['E', 'Photos & documents', 'Keep job records tied to the correct project or task instead of scattered across devices.'],
  ['A', 'Actionable alerts', 'Surface overdue decisions, missed check-ins, and other items that need immediate attention.'],
  ['M', 'Project messaging', 'Keep secure project conversations connected to the work they affect.'],
  ['T', 'Work sessions', 'Let field workers check in and out with notes while managers retain operational visibility.'],
]

export default function FieldRelayPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                In active development
              </div>
              <h1 className={styles.title}>
                Keep every job moving from{' '}
                <span className={styles.titleAccent}>field to finish.</span>
              </h1>
              <p className={styles.lead}>
                FieldRelay gives general contractors one operational workspace
                for projects, field activity, client decisions, job records,
                and the issues that cannot afford to disappear in a text thread.
              </p>
              <div className={styles.actions}>
                <LinkButton
                  href="/demos/fieldrelay"
                  variant="primary"
                  size="large"
                >
                  Explore interactive demo
                </LinkButton>
                <LinkButton
                  href="/contact?product=fieldrelay"
                  variant="default"
                  size="large"
                  trailingIcon="arrowRight"
                >
                  Discuss early access
                </LinkButton>
              </div>
              <div className={styles.proof} aria-label="Product characteristics">
                {['Built for construction operations', 'Role-based access', 'Mobile and web'].map(
                  (item) => (
                    <span className={styles.proofItem} key={item}>
                      <span className={styles.proofMark} aria-hidden="true">✓</span>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className={styles.dashboard} aria-label="FieldRelay dashboard preview">
              <div className={styles.dashTop}>
                <div className={styles.brand}>
                  <img src="/brand/fieldrelay-logo.png" alt="FieldRelay" />
                </div>
                <span className={styles.live}>Operations live</span>
              </div>
              <p className={styles.dashGreeting}>Wednesday · Operations overview</p>
              <div className={styles.dashTitle}>Good morning, Shafi</div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>6</div>
                  <div className={styles.statLabel}>Active projects</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>14</div>
                  <div className={styles.statLabel}>Open tasks</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>3</div>
                  <div className={styles.statLabel}>Need attention</div>
                </div>
              </div>
              <div className={styles.projectCard}>
                <div className={styles.projectHead}>
                  <div>
                    <div className={styles.projectName}>Hillside Residential Renovation</div>
                    <div className={styles.projectCode}>FR-1024 · Interior & exterior</div>
                  </div>
                  <strong>68%</strong>
                </div>
                <div className={styles.progress}>
                  <div className={styles.progressFill} />
                </div>
                <div className={styles.taskList}>
                  {[
                    ['Rough electrical inspection', 'Completed', true],
                    ['Client finish approval', 'Due today', false],
                    ['Second-floor framing', 'In progress', false],
                  ].map(([name, meta, done]) => (
                    <div className={styles.task} key={String(name)}>
                      <div className={styles.taskName}>
                        <span
                          className={`${styles.taskDot} ${done ? styles.taskDotDone : ''}`}
                          aria-hidden="true"
                        />
                        {name}
                      </div>
                      <span className={styles.taskMeta}>{meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`}>
        <Container>
          <div className={styles.sectionHeader}>
            <div className={styles.kicker}>The operational gap</div>
            <h2 className={styles.sectionTitle}>
              Construction does not fail from a lack of communication.
              It fails when communication has no system.
            </h2>
          </div>
          <div className={styles.painGrid}>
            {painPoints.map((item, index) => (
              <article className={styles.card} key={item.title}>
                <div className={styles.cardNumber}>0{index + 1}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardCopy}>{item.copy}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeader}>
            <div className={styles.kicker}>One source of operational truth</div>
            <h2 className={styles.sectionTitle}>
              The work, the evidence, and the next action stay connected.
            </h2>
            <p className={styles.sectionCopy}>
              FieldRelay is being shaped around the daily coordination needs of
              small and growing general contractors—not enterprise complexity.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(([icon, title, copy]) => (
              <article className={`${styles.card} ${styles.featureCard}`} key={title}>
                <div className={styles.featureIcon} aria-hidden="true">{icon}</div>
                <div>
                  <h3 className={styles.cardTitle} style={{ marginTop: 0 }}>{title}</h3>
                  <p className={styles.cardCopy}>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`}>
        <Container>
          <div className={styles.roadmap}>
            <div className={styles.sectionHeader}>
              <div className={styles.kicker}>Next on the roadmap</div>
              <h2 className={styles.sectionTitle}>
                Closing the remaining gaps contractors asked us to solve.
              </h2>
              <p className={styles.sectionCopy}>
                These capabilities are planned and are not presented as live
                functionality in the current product.
              </p>
            </div>
            <div className={styles.roadmapList}>
              <article className={styles.roadmapItem}>
                <span className={styles.roadmapBadge}>Planned</span>
                <h3 className={styles.cardTitle}>Schedule and Gantt import</h3>
                <p className={styles.cardCopy}>
                  Bring an existing construction schedule into FieldRelay and
                  connect milestones and dates to accountable work.
                </p>
              </article>
              <article className={styles.roadmapItem}>
                <span className={styles.roadmapBadge}>Planned</span>
                <h3 className={styles.cardTitle}>Email notification delivery</h3>
                <p className={styles.cardCopy}>
                  Send relevant due-date and attention alerts to each person’s
                  inbox in addition to the in-app alert center.
                </p>
              </article>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <div className={styles.cta}>
            <div className={styles.ctaGrid}>
              <div className={styles.ctaCopy}>
                <h2 className={styles.ctaTitle}>
                  See whether FieldRelay fits the way your company actually works.
                </h2>
                <p className={styles.ctaText}>
                  Walk through the interactive product demo or tell Ahrok where
                  your current construction workflow loses time and visibility.
                </p>
              </div>
              <div className={styles.actions} style={{ marginTop: 0 }}>
                <LinkButton
                  href="/demos/fieldrelay"
                  variant="primary"
                  size="large"
                >
                  Try the demo
                </LinkButton>
                <LinkButton
                  href="/contact?product=fieldrelay"
                  variant="default"
                  size="large"
                >
                  Contact Ahrok
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
