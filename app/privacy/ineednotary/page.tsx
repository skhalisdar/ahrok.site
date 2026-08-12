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
  title: 'iNeedNotary Privacy Policy | Ahrok LLC',
  description:
    'Privacy policy for iNeedNotary, the remote notarization and apostille service platform provided by Ahrok LLC.',
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
        iNeedNotary is a platform and service operated by Ahrok LLC for arranging
        remote online notarization and apostille-related services. This policy explains
        how personal information is handled when you use the iNeedNotary application,
        website, communications, and related services.
      </P>
    ),
  },
  {
    id: 'information-collected',
    title: 'Information We Collect',
    content: (
      <>
        <P>Depending on the service you request, we may collect:</P>
        <BulletList
          items={[
            'Account and contact information, such as name, email address, telephone number, mailing address, and authentication information.',
            'Appointment and transaction information, including requested service, scheduled time, order status, fees, shipping information, and communications with us.',
            'Documents and information you choose to upload for notarization or apostille processing.',
            'Identity-verification information required to complete a lawful remote notarization, which may include government-issued identification details, credential-analysis results, identity-proofing results, and related verification records.',
            'Audio-visual session records and notarial journal information when required for an electronic or remote notarial act.',
            'Payment and transaction information. Full payment-card details are generally processed by a payment provider rather than stored directly by iNeedNotary.',
            'Technical and security information reasonably necessary to operate, protect, and troubleshoot the service.',
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
          'Create and manage accounts, appointments, notarization sessions, apostille orders, document workflows, payments, and shipping.',
          'Verify identity and satisfy legal, regulatory, recordkeeping, and notarial requirements.',
          'Prepare, complete, deliver, and maintain records of requested services.',
          'Communicate about appointments, missing information, order status, support, and service updates.',
          'Operate, secure, troubleshoot, maintain, and improve iNeedNotary.',
          'Prevent fraud, abuse, unauthorized access, and misuse.',
          'Comply with applicable law, lawful requests, professional obligations, and record-retention requirements.',
        ]}
      />
    ),
  },
  {
    id: 'notarial-records',
    title: 'Notarial Records and Recordkeeping',
    content: (
      <P>
        Remote and electronic notarization can require the notary to create and retain
        specific records, including journal entries, identity-verification information,
        and audio-visual recordings. These records may be retained for the period
        required by applicable notary law even if you later delete your consumer
        account. Legal recordkeeping obligations take precedence over an ordinary
        account-deletion request where the law requires retention.
      </P>
    ),
  },
  {
    id: 'documents',
    title: 'Documents and Sensitive Information',
    content: (
      <P>
        Documents submitted for notarization or apostille processing may contain highly
        sensitive personal, financial, legal, family, educational, or business
        information. Please submit only information necessary for the requested service
        and only documents you are authorized to provide. We use submitted documents to
        perform the requested service, maintain required records, provide support, and
        meet legal obligations.
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
            'Payment processors used to complete authorized payments.',
            'Identity-proofing, credential-analysis, electronic-signature, remote-notarization, video, communications, or document-processing providers when needed to perform the requested service.',
            'Shipping carriers, government offices, secretaries of state, county clerks, authentication authorities, consulates, or other agencies when necessary to complete an apostille or authentication order.',
            'Professional advisors, security providers, or support vendors acting on our behalf.',
            'Government authorities or other parties when disclosure is required by law or necessary to protect rights, safety, or the integrity of the service.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Retention and Deletion',
    content: (
      <P>
        We retain personal information for as long as reasonably necessary to provide
        the service, complete transactions, maintain security and business records,
        satisfy notarial and other legal recordkeeping obligations, resolve disputes,
        and enforce agreements. We will honor valid deletion requests to the extent
        permitted by law, but certain notarial, financial, transactional, fraud-
        prevention, or legal records may need to be retained after account deletion.
      </P>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <P>
        We use administrative, technical, and organizational safeguards designed to
        protect personal information and uploaded documents. Because no online system
        can guarantee absolute security, users should also protect their account
        credentials, devices, and copies of sensitive documents.
      </P>
    ),
  },
  {
    id: 'rights',
    title: 'Your Choices and Privacy Requests',
    content: (
      <P>
        You may request access to, correction of, or deletion of personal information
        by contacting <PrivacyEmail />. We may need to verify your identity before
        completing a request. Some records cannot be deleted when retention is required
        by law or necessary to establish, exercise, or defend legal rights.
      </P>
    ),
  },
  {
    id: 'children',
    title: "Children's Privacy",
    content: (
      <P>
        iNeedNotary is not directed to children under 13. If a minor is involved in a
        transaction, a parent, guardian, or other legally authorized person may be
        required to participate depending on the document and applicable law.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <P>
        We may update this policy as iNeedNotary, applicable law, or our service
        providers change. The revised policy will be posted on this page with an
        updated date.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <P>
        iNeedNotary is operated by Ahrok LLC. Contact <PrivacyEmail /> with privacy
        questions or requests.
      </P>
    ),
  },
]

export default function INeedNotaryPrivacyPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Privacy Policy"
        title="iNeedNotary Privacy Policy"
        intro="This policy explains how iNeedNotary handles account information, documents, identity-verification records, notarial records, apostille orders, payments, and related service data."
        lastUpdated="August 11, 2026"
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
