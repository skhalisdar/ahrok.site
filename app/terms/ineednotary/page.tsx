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
  title: 'iNeedNotary Terms of Use | Ahrok LLC',
  description:
    'Terms of Use for iNeedNotary, the remote notarization and apostille service platform provided by Ahrok LLC.',
}

const sections: PrivacySection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: (
      <P>
        These Terms of Use ("Terms") govern your access to and use of iNeedNotary,
        including its applications, website, communications, remote-notarization
        workflows, apostille services, and related services (the "Service"). iNeedNotary
        is operated by Ahrok LLC ("Ahrok," "we," "us," or "our"). By creating an
        account, booking a service, submitting documents, or using iNeedNotary, you agree
        to these Terms.
      </P>
    ),
  },
  {
    id: 'services',
    title: 'Services',
    content: (
      <P>
        iNeedNotary helps clients arrange and complete eligible remote or electronic
        notarizations and apostille or authentication-related services. Availability
        depends on the document, destination, signer location, notary authority,
        applicable law, government requirements, service-provider availability, and
        other circumstances. We may decline or stop a transaction that cannot lawfully
        or reliably be completed.
      </P>
    ),
  },
  {
    id: 'not-legal-advice',
    title: 'No Legal Advice',
    content: (
      <P>
        Ahrok and iNeedNotary do not provide legal advice and do not select legal forms,
        determine whether a document is legally sufficient, advise you what notarial act
        to request, or guarantee that a notarized or apostilled document will be accepted
        for your intended purpose. You are responsible for obtaining legal advice when
        needed and for confirming the requirements of the receiving agency, court,
        institution, country, or other destination.
      </P>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and Identity Verification',
    content: (
      <P>
        You must provide accurate information and cooperate with identity-verification
        procedures required for the requested service. A notarization may be refused if
        identity cannot be established, the signer is unwilling or unable to proceed,
        the transaction appears unlawful or suspicious, the required technology or
        records are unavailable, or the notary determines that the act cannot properly
        be performed.
      </P>
    ),
  },
  {
    id: 'documents',
    title: 'Documents and Client Responsibilities',
    content: (
      <>
        <P>You are responsible for:</P>
        <BulletList
          items={[
            'Providing complete, accurate, and legible documents and information.',
            'Confirming that you are authorized to sign, submit, or request processing of the document.',
            'Not signing a document in advance when the applicable notarial procedure requires signing in the notary&apos;s presence.',
            'Confirming the required notarial certificate, destination, apostille or authentication requirements, and any filing deadlines.',
            'Keeping your own copies of documents and records you may need later.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'remote-notarization',
    title: 'Remote and Electronic Notarization',
    content: (
      <P>
        Remote or electronic notarization is performed only when authorized by applicable
        law and when required technology, identity verification, real-time audio-visual
        communication, electronic records, and other legal conditions can be satisfied.
        The notary controls whether a notarial act may be performed and may require
        additional information or terminate a session when legally necessary.
      </P>
    ),
  },
  {
    id: 'records',
    title: 'Notarial Records and Recordings',
    content: (
      <P>
        Electronic or remote notarization may require creation and retention of journal
        entries, identity-verification records, and audio-visual recordings for periods
        established by applicable law. By requesting such a service, you acknowledge that
        these records may be created and retained as legally required and may not be
        eligible for deletion on ordinary account-deletion timelines.
      </P>
    ),
  },
  {
    id: 'apostille',
    title: 'Apostille and Authentication Services',
    content: (
      <P>
        Apostille and authentication processing can involve county clerks, secretaries
        of state, federal agencies, consulates, embassies, educational institutions,
        shipping carriers, or other third parties. Government processing times,
        closures, document rejections, destination-country requirements, and carrier
        delays are outside Ahrok&apos;s control. Estimates are not guarantees. Additional
        steps or fees may be required if an authority rejects a document or changes its
        requirements.
      </P>
    ),
  },
  {
    id: 'fees',
    title: 'Fees, Payments, Cancellations, and Refunds',
    content: (
      <P>
        Applicable service fees, government fees, shipping charges, booking fees, and
        other charges are disclosed before or during the transaction as appropriate.
        Payment may be processed by a third-party provider. Fees for legally regulated
        notarial acts are subject to applicable law. Refund eligibility depends on the
        service stage, nonrefundable third-party or government costs already incurred,
        and any cancellation or refund terms shown at purchase. We do not promise a
        refund for services already performed or external fees already paid on your
        behalf, except where required by law.
      </P>
    ),
  },
  {
    id: 'shipping',
    title: 'Shipping and Delivery',
    content: (
      <P>
        When physical documents are shipped, risk of carrier delay, loss, damage, customs
        delay, or incorrect delivery information may affect completion. Tracking or
        expedited service does not guarantee delivery by a particular date. You are
        responsible for providing a complete and accurate shipping address.
      </P>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <P>
        You may not use iNeedNotary for fraud, identity theft, forgery, impersonation,
        money laundering, unlawful transactions, deceptive documents, unauthorized use
        of another person&apos;s information, interference with security controls, or any
        other unlawful or abusive purpose. We may refuse or terminate service when we
        reasonably suspect fraud, coercion, illegality, or misuse.
      </P>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-Party Providers',
    content: (
      <P>
        iNeedNotary may rely on payment processors, cloud infrastructure,
        identity-proofing providers, credential-analysis providers, electronic-signature
        or notarization technology, video services, government agencies, and shipping
        carriers. Their services may be subject to separate terms and privacy policies.
        Ahrok is not responsible for third-party systems or government actions outside
        its reasonable control.
      </P>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy and Sensitive Information',
    content: (
      <P>
        Our handling of account information, uploaded documents, identity-verification
        records, notarial records, and other personal information is described in the{' '}
        <Link href="/privacy/ineednotary" style={{ color: 'var(--ahrok-accent)' }}>
          iNeedNotary Privacy Policy
        </Link>
        . You should submit only information reasonably necessary for the requested
        service.
      </P>
    ),
  },
  {
    id: 'availability',
    title: 'Service Availability',
    content: (
      <P>
        We do not guarantee uninterrupted service, appointment availability, government
        processing, platform uptime, or acceptance by a receiving party. Technology,
        regulatory requirements, staffing, third-party providers, or government systems
        may delay or prevent completion.
      </P>
    ),
  },
  {
    id: 'warranties',
    title: 'Disclaimer of Warranties',
    content: (
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, INEEDNOTARY IS PROVIDED "AS IS" AND "AS
        AVAILABLE." AHROK DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        WE DO NOT WARRANT THAT A NOTARIZED, APOSTILLED, AUTHENTICATED, OR SHIPPED
        DOCUMENT WILL BE ACCEPTED BY A PARTICULAR RECIPIENT OR COMPLETED BY A PARTICULAR
        DEADLINE.
      </P>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: (
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, AHROK AND ITS MEMBERS, OFFICERS,
        EMPLOYEES, CONTRACTORS, AND AFFILIATES WILL NOT BE LIABLE FOR INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST
        PROFITS, LOST OPPORTUNITIES, MISSED DEADLINES, GOVERNMENT OR CONSULAR DELAYS,
        CARRIER DELAYS, OR THIRD-PARTY REJECTION OF A DOCUMENT. TO THE MAXIMUM EXTENT
        PERMITTED BY LAW, AHROK&apos;S TOTAL LIABILITY ARISING FROM A TRANSACTION WILL NOT
        EXCEED THE GREATER OF THE AMOUNT YOU PAID AHROK FOR THAT TRANSACTION OR ONE
        HUNDRED U.S. DOLLARS ($100).
      </P>
    ),
  },
  {
    id: 'law',
    title: 'Governing Law',
    content: (
      <P>
        These Terms are governed by the laws of the State of New York, without regard to
        conflict-of-law principles. Subject to rights that cannot lawfully be waived,
        disputes arising from these Terms or iNeedNotary will be brought in a court of
        competent jurisdiction in New York.
      </P>
    ),
  },
  {
    id: 'changes-contact',
    title: 'Changes and Contact',
    content: (
      <P>
        We may update these Terms as the Service, applicable law, or our practices change.
        Revised Terms will be posted with an updated date. Questions may be submitted
        through the{' '}
        <Link href="/contact" style={{ color: 'var(--ahrok-accent)' }}>
          Ahrok contact page
        </Link>{' '}
        or to{' '}
        <Link href="mailto:hello@ahrok.site" style={{ color: 'var(--ahrok-accent)' }}>
          hello@ahrok.site
        </Link>
        .
      </P>
    ),
  },
]

export default function INeedNotaryTermsPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Terms"
        title="iNeedNotary Terms of Use"
        intro="These Terms govern remote notarization, apostille and authentication services, document handling, payments, and related use of iNeedNotary."
        lastUpdated="August 11, 2026"
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
