import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PrivacyHero,
  PrivacyBody,
  P,
  BulletList,
  type PrivacySection,
} from '@/components/privacy/privacy-doc'

export const metadata: Metadata = {
  title: 'FieldRelay Privacy Policy | Ahrok LLC',
  description:
    'Privacy policy for FieldRelay, the construction coordination and project-management platform provided by Ahrok LLC.',
}

const PrivacyEmail = () => (
  <Link href="mailto:privacy@ahrok.site" style={{ color: 'var(--ahrok-accent)' }}>
    privacy@ahrok.site
  </Link>
)

const sections: PrivacySection[] = [
  {
    id: 'scope',
    title: 'Scope and Who We Are',
    content: (
      <P>
        FieldRelay is a construction coordination and project-management platform
        provided by Ahrok LLC. This policy explains how FieldRelay handles personal
        information when you use its mobile applications, websites, and related
        services.
      </P>
    ),
  },
  {
    id: 'information-collected',
    title: 'Information We Collect',
    content: (
      <>
        <P>Depending on how FieldRelay is used, we may collect:</P>
        <BulletList
          items={[
            'Account and profile information, such as name, email address, role, company or organization, and authentication information.',
            'Organization and project information, including project names, addresses or locations entered by users, team assignments, clients, tasks, schedules, status updates, decisions, reports, and work-session records.',
            'Content users choose to upload or create, including photos, documents, messages, comments, and project records.',
            'Notification and alert information, such as due dates, approval requests, acknowledgement status, and alert-delivery status.',
            'Subscription and entitlement information, such as product identifier, purchase status, renewal status, and app-store transaction references. FieldRelay does not receive full payment-card numbers from Apple or Google.',
            'Technical and security information reasonably necessary to operate the service, such as device, application, session, error, and security-event information.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'how-used',
    title: 'How We Use Information',
    content: (
      <BulletList
        items={[
          'Provide authentication, organization management, project coordination, tasks, reports, documents, messaging, alerts, and other FieldRelay features.',
          'Apply role-based permissions so users see the organizations, projects, and records they are authorized to access.',
          'Process and verify subscription entitlements and restore purchases.',
          'Operate, troubleshoot, secure, maintain, and improve FieldRelay.',
          'Provide customer support and communicate about the service.',
          'Prevent fraud, abuse, unauthorized access, and other security threats.',
          'Comply with applicable law and enforce our agreements.',
        ]}
      />
    ),
  },
  {
    id: 'organization-data',
    title: 'Organization, Team, and Client Data',
    content: (
      <P>
        FieldRelay is designed for organizations that invite team members, field
        workers, clients, and other project participants. Organization administrators
        control many access decisions. Information you submit may therefore be visible
        to other authorized users in the same organization or project according to
        their assigned role and permissions. Organizations are responsible for
        granting and removing user access appropriately.
      </P>
    ),
  },
  {
    id: 'photos-documents',
    title: 'Photos, Documents, and Project Content',
    content: (
      <P>
        Photos, documents, reports, messages, and other project content are stored so
        authorized project participants can use FieldRelay for coordination and
        recordkeeping. Users should upload only information they are authorized to
        share. FieldRelay should not be treated as the sole archival repository for
        records an organization is independently required to preserve.
      </P>
    ),
  },
  {
    id: 'service-providers',
    title: 'Service Providers and Sharing',
    content: (
      <>
        <P>Ahrok LLC does not sell personal information. We may share information with:</P>
        <BulletList
          items={[
            'Supabase, which provides backend infrastructure including authentication, database, and storage services.',
            'Apple and Google, when their app stores, billing systems, device services, or notification services are used.',
            'RevenueCat, when used to manage subscription entitlements and purchase status.',
            'Other vendors that provide hosting, communications, security, support, or operational services on our behalf.',
            'Government authorities or other parties when disclosure is required by law, necessary to protect rights or safety, or connected with a lawful business transaction.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions and Payments',
    content: (
      <P>
        Purchases made through the Apple App Store or Google Play are processed by the
        applicable store. FieldRelay receives information needed to determine whether
        a subscription is active and which features are available, but does not receive
        your full payment-card number from those stores. Store providers process payment
        information under their own privacy policies.
      </P>
    ),
  },
  {
    id: 'retention-deletion',
    title: 'Retention and Deletion',
    content: (
      <P>
        We retain information for as long as reasonably necessary to provide FieldRelay,
        maintain security and business records, comply with legal obligations, resolve
        disputes, and enforce agreements. Account deletion may remove or de-identify
        personal information associated with the account, subject to information we must
        retain by law or for legitimate security, transactional, or dispute-resolution
        purposes. Organization-owned project records may remain available to the
        organization after an individual user leaves or deletes an account where the
        organization has an independent right to retain those records.
      </P>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <P>
        We use administrative, technical, and organizational safeguards designed to
        protect information against unauthorized access, loss, misuse, or alteration.
        No online service can guarantee absolute security, and users are responsible for
        protecting their credentials and devices.
      </P>
    ),
  },
  {
    id: 'rights',
    title: 'Your Choices and Privacy Requests',
    content: (
      <P>
        You may update certain account information in FieldRelay and may request access,
        correction, or deletion of personal information by contacting <PrivacyEmail />.
        Where required by law, additional privacy rights may apply. Subscription
        cancellation is handled separately through the platform where the subscription
        was purchased.
      </P>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    content: (
      <P>
        FieldRelay is a business and construction-workflow service and is not directed
        to children under 13. Ahrok LLC does not knowingly collect personal information
        from children under 13 through FieldRelay.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <P>
        We may update this policy as FieldRelay, applicable law, or our service providers
        change. The revised policy will be posted on this page with an updated date.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <P>
        FieldRelay is provided by Ahrok LLC. Contact <PrivacyEmail /> with privacy
        questions or requests.
      </P>
    ),
  },
]

export default function FieldRelayPrivacyPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Privacy Policy"
        title="FieldRelay Privacy Policy"
        intro="This policy explains how FieldRelay collects, uses, shares, retains, and protects information used for construction project coordination."
        lastUpdated="August 11, 2026"
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
