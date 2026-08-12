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
  title: 'NYCMC Yard Sale Privacy Policy | Ahrok LLC',
  description:
    'Privacy policy for NYCMC Yard Sale, an inventory, storefront, ordering, and event-pickup app developed by Ahrok LLC.',
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
        NYCMC Yard Sale is an inventory, storefront, ordering, and event-pickup
        application developed by Ahrok LLC. This policy explains how information is
        handled when staff members manage inventory and when shoppers browse or place
        orders through the public storefront.
      </P>
    ),
  },
  {
    id: 'information-collected',
    title: 'Information We Collect',
    content: (
      <>
        <P>Depending on how you use the app, we may collect:</P>
        <BulletList
          items={[
            'Staff account information, such as name, email address, and authentication information.',
            'Inventory and sales information, such as item names, quantities, prices, descriptions, locations, stock adjustments, sales records, and staff accountability records.',
            'Photos staff members choose to add to inventory items through a device camera or photo library.',
            'Shopper and order information needed to complete a purchase or pickup, such as contact information, items ordered, quantities, order status, payment status, and pickup information.',
            'Payment transaction references and status. Full payment-card details are processed by Stripe and are not stored directly by NYCMC Yard Sale.',
            'Basic technical and security information necessary to operate, protect, and troubleshoot the application.',
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
          'Authenticate staff and provide inventory-management and accountability features.',
          'Display approved items in the public storefront.',
          'Create, process, track, and fulfill customer orders and event-day pickups.',
          'Record stock changes, sales, payment status, and pickup completion.',
          'Operate, secure, troubleshoot, maintain, and improve the app.',
          'Provide support and communicate about orders when necessary.',
          'Prevent fraud, misuse, and unauthorized access and comply with applicable law.',
        ]}
      />
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
            'Supabase, which provides backend infrastructure including authentication, database, and image storage services.',
            'Stripe, which processes customer payments and provides payment-status information needed to complete orders.',
            'Other vendors that provide hosting, security, communications, or support services on our behalf.',
            'Government authorities or other parties when disclosure is required by law or necessary to protect rights or safety.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'payments',
    title: 'Payments',
    content: (
      <P>
        Online payment-card information is submitted to and processed by Stripe under
        Stripe&apos;s own privacy practices. NYCMC Yard Sale receives transaction and
        payment-status information needed to associate a successful payment with the
        corresponding order.
      </P>
    ),
  },
  {
    id: 'retention',
    title: 'Data Retention and Deletion',
    content: (
      <P>
        Information is retained for as long as reasonably necessary to operate the app,
        fulfill orders, maintain inventory and transaction records, protect against
        fraud, meet legal or accounting obligations, resolve disputes, and enforce
        agreements. Staff users may request deletion of their accounts through the app
        where available or by contacting <PrivacyEmail />. Transactional records may be
        retained when required for legitimate business or legal purposes.
      </P>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <P>
        We use reasonable administrative, technical, and organizational safeguards
        designed to protect information. No online service can guarantee absolute
        security, and staff members are responsible for protecting their credentials
        and devices.
      </P>
    ),
  },
  {
    id: 'children',
    title: "Children's Privacy",
    content: (
      <P>
        NYCMC Yard Sale is not directed to children under 13, and Ahrok LLC does not
        knowingly collect personal information from children under 13 through the app.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <P>
        We may update this policy as the app, applicable law, or service providers
        change. The revised policy will be posted on this page with an updated date.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <P>
        NYCMC Yard Sale is developed by Ahrok LLC. Contact <PrivacyEmail /> with privacy
        questions or requests.
      </P>
    ),
  },
]

export default function NycmcYardSalePrivacyPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Privacy Policy"
        title="NYCMC Yard Sale Privacy Policy"
        intro="This policy explains how NYCMC Yard Sale handles staff accounts, inventory records, storefront orders, payments, and pickup information."
        lastUpdated="August 11, 2026"
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
