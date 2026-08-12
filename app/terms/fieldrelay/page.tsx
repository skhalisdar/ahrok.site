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
  title: 'FieldRelay Terms of Use | Ahrok LLC',
  description:
    'Terms of Use for FieldRelay, the construction coordination and project-management platform provided by Ahrok LLC.',
}

const sections: PrivacySection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: (
      <P>
        These Terms of Use ("Terms") govern your access to and use of FieldRelay,
        including its mobile applications, websites, software, features, and related
        services (the "Service"). FieldRelay is provided by Ahrok LLC ("Ahrok," "we,"
        "us," or "our"). By creating an account, purchasing a subscription, or using
        FieldRelay, you agree to these Terms. If you use FieldRelay for a company or
        organization, you represent that you are authorized to bind that organization.
      </P>
    ),
  },
  {
    id: 'service',
    title: 'FieldRelay Service',
    content: (
      <P>
        FieldRelay is software designed to help construction businesses and project
        participants coordinate projects, teams, tasks, field activity, documents,
        photos, communications, client interactions, schedules, decisions, reports,
        alerts, and related operational information. Features may vary by account,
        platform, subscription, and release version.
      </P>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and Eligibility',
    content: (
      <P>
        You must be legally capable of entering into a binding agreement to use the
        Service. You are responsible for accurate account information, maintaining the
        confidentiality of credentials, and all activity under your account. Notify us
        promptly if you suspect unauthorized access. You may not share or use credentials
        to bypass applicable role, seat, organization, or subscription restrictions.
      </P>
    ),
  },
  {
    id: 'organizations',
    title: 'Organizations, Roles, and Access',
    content: (
      <P>
        FieldRelay may permit administrators to invite team members, field workers,
        clients, contractors, or other participants and assign project access or roles.
        The organization is responsible for deciding who should have access, maintaining
        appropriate permissions, and removing access when it is no longer required.
        Users may access only organizations, projects, and information they are
        authorized to use.
      </P>
    ),
  },
  {
    id: 'subscription',
    title: 'FieldRelay Plus Subscription',
    content: (
      <P>
        Certain features may require a paid FieldRelay Plus subscription. The price,
        billing period, included features, and applicable taxes are displayed before
        purchase. Unless otherwise stated at purchase, a subscription automatically
        renews at the end of each billing period until canceled. FieldRelay currently may
        offer monthly subscription billing; available plans can change prospectively.
      </P>
    ),
  },
  {
    id: 'billing',
    title: 'Billing, Renewal, and Cancellation',
    content: (
      <>
        <P>
          If you purchase an auto-renewing subscription, your applicable app-store or
          payment account will be charged at the price shown at purchase and again at
          each renewal unless you cancel before renewal.
        </P>
        <BulletList
          items={[
            'Subscriptions purchased through Apple are managed through the Apple account used for the purchase.',
            'Subscriptions purchased through Google Play are managed through the Google Play account used for the purchase.',
            'Cancellation stops future renewal but ordinarily does not refund a billing period already purchased, except where required by law or platform policy.',
            'Deleting a FieldRelay account does not automatically cancel a store subscription unless the applicable platform confirms otherwise.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'customer-content',
    title: 'Customer Content and Project Data',
    content: (
      <P>
        You retain your rights in project information, messages, reports, task data,
        schedules, photos, documents, client information, and other content submitted by
        you or your authorized users ("Customer Content"). You grant Ahrok a limited
        license to host, process, transmit, reproduce, back up, and otherwise use Customer
        Content as reasonably necessary to operate, secure, maintain, support, and improve
        the Service and comply with law. You represent that you have the rights and
        permissions necessary to submit Customer Content.
      </P>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <P>
        You may not use FieldRelay to violate law; infringe intellectual property,
        privacy, or other rights; harass or harm others; distribute malware; interfere
        with the Service; probe or circumvent security controls; gain unauthorized
        access; scrape data except through authorized functionality; impersonate another
        person; or use the Service in a fraudulent, deceptive, or abusive manner.
      </P>
    ),
  },
  {
    id: 'construction-disclaimer',
    title: 'Construction and Jobsite Disclaimer',
    content: (
      <P>
        FieldRelay is a coordination and information-management tool. It does not provide
        architectural, engineering, legal, accounting, safety, code-compliance,
        inspection, estimating, scheduling, or professional construction-management
        advice. It does not replace qualified professionals, contractual notice
        procedures, inspections, safety programs, permits, building codes, regulations,
        or an organization&apos;s independent judgment. Users remain responsible for all
        construction, safety, contractual, financial, and operational decisions.
      </P>
    ),
  },
  {
    id: 'alerts',
    title: 'Notifications, Alerts, and Scheduling Information',
    content: (
      <P>
        FieldRelay may provide reminders, alerts, due dates, schedules, notifications,
        and related information for convenience. Delivery may be delayed, interrupted,
        inaccurate, or unavailable because of device settings, connectivity, third-party
        services, user configuration, or other factors. Do not rely on FieldRelay as the
        sole means of meeting a legal, contractual, safety-critical, or time-sensitive
        obligation.
      </P>
    ),
  },
  {
    id: 'records',
    title: 'Records and Backups',
    content: (
      <P>
        FieldRelay may assist with project recordkeeping, but customers remain responsible
        for maintaining any independent records, backups, notices, or archives required
        by contract, law, professional practice, insurance, or internal policy. We do not
        guarantee that any particular FieldRelay record will satisfy a legal or contractual
        recordkeeping requirement.
      </P>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-Party Services',
    content: (
      <P>
        FieldRelay may depend on app stores, cloud infrastructure, authentication,
        subscription management, notification services, and other third-party providers.
        Your use of a third-party service may also be subject to that provider&apos;s terms.
        Ahrok is not responsible for third-party services outside its reasonable control.
      </P>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    content: (
      <P>
        FieldRelay, its software, interface, design, branding, documentation, and related
        technology are owned by Ahrok or its licensors and protected by applicable law.
        Subject to these Terms, Ahrok grants you a limited, non-exclusive,
        non-transferable, revocable right to use FieldRelay for its intended purposes
        while you are authorized to access the Service.
      </P>
    ),
  },
  {
    id: 'availability',
    title: 'Service Availability and Changes',
    content: (
      <P>
        We work to maintain a reliable Service but do not guarantee uninterrupted or
        error-free availability. Features may be added, modified, suspended, or removed
        as FieldRelay evolves. Maintenance, security events, network failures, software
        defects, third-party outages, or circumstances outside our control may affect the
        Service.
      </P>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension and Termination',
    content: (
      <P>
        We may suspend or terminate access when reasonably necessary to protect the
        Service or users, investigate suspected abuse or security risk, comply with law,
        address nonpayment, or enforce these Terms. You may stop using FieldRelay at any
        time. Subscription cancellation and account deletion are separate actions unless
        expressly stated otherwise.
      </P>
    ),
  },
  {
    id: 'warranties',
    title: 'Disclaimer of Warranties',
    content: (
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, FIELDRELAY IS PROVIDED "AS IS" AND "AS
        AVAILABLE." AHROK DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR
        THAT INFORMATION IN THE SERVICE WILL ALWAYS BE COMPLETE OR ACCURATE.
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
        PROFITS, LOST REVENUE, LOST DATA, BUSINESS INTERRUPTION, PROJECT DELAYS,
        CONSTRUCTION COST OVERRUNS, OR LOST BUSINESS OPPORTUNITY ARISING FROM FIELDRELAY.
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, AHROK&apos;S TOTAL LIABILITY ARISING OUT OF
        OR RELATING TO FIELDRELAY WILL NOT EXCEED THE GREATER OF THE AMOUNT PAID FOR
        FIELDRELAY DURING THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR
        ONE HUNDRED U.S. DOLLARS ($100).
      </P>
    ),
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    content: (
      <P>
        To the extent permitted by law, a business or organization using FieldRelay
        agrees to defend, indemnify, and hold harmless Ahrok and its members, officers,
        employees, contractors, and affiliates from third-party claims and reasonable
        costs arising from Customer Content, misuse of the Service, violation of these
        Terms, or violation of another person&apos;s rights, except to the extent caused
        solely by Ahrok&apos;s unlawful conduct where indemnification is prohibited by law.
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
        disputes arising from these Terms or FieldRelay will be brought in a court of
        competent jurisdiction in New York.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    content: (
      <P>
        We may update these Terms as FieldRelay, applicable law, or our business practices
        change. Revised Terms will be posted with an updated date. Where required by law,
        we will provide additional notice or request consent.
      </P>
    ),
  },
  {
    id: 'privacy-contact',
    title: 'Privacy and Contact',
    content: (
      <P>
        Our handling of personal information is described in the{' '}
        <Link href="/privacy/fieldrelay" style={{ color: 'var(--ahrok-accent)' }}>
          FieldRelay Privacy Policy
        </Link>
        . Questions about these Terms may be submitted through the{' '}
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

export default function FieldRelayTermsPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Terms"
        title="FieldRelay Terms of Use"
        intro="These Terms govern access to and use of FieldRelay, including FieldRelay Plus subscriptions and construction project coordination features."
        lastUpdated="August 11, 2026"
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
