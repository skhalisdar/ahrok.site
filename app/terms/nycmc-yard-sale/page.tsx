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
  title: 'NYCMC Yard Sale Terms of Use | Ahrok LLC',
  description:
    'Terms of Use for NYCMC Yard Sale, the inventory, storefront, ordering, and event-pickup app developed by Ahrok LLC.',
}

const sections: PrivacySection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: (
      <P>
        These Terms of Use ("Terms") govern access to and use of NYCMC Yard Sale,
        including staff inventory tools, the public storefront, online ordering, payment
        processing, and event-pickup features (the "Service"). The app is developed by
        Ahrok LLC. By using the Service, you agree to these Terms.
      </P>
    ),
  },
  {
    id: 'service',
    title: 'Service',
    content: (
      <P>
        NYCMC Yard Sale supports inventory management and the sale of approved items for
        pickup. Product availability, quantities, prices, pickup procedures, and event
        details may change. The Service is intended to facilitate transactions and does
        not guarantee that every displayed item will remain available until payment is
        successfully completed.
      </P>
    ),
  },
  {
    id: 'staff-accounts',
    title: 'Staff Accounts and Inventory Records',
    content: (
      <P>
        Authorized staff users are responsible for protecting account credentials,
        entering accurate inventory and sales information, and using the application
        only for authorized organizational purposes. Staff may not manipulate inventory,
        sales, order, or accountability records or access information beyond their
        assigned responsibilities.
      </P>
    ),
  },
  {
    id: 'storefront',
    title: 'Public Storefront and Product Information',
    content: (
      <P>
        We attempt to display product descriptions, photos, quantities, prices, and
        availability accurately, but errors may occur. Items may be used, donated,
        unique, limited in quantity, or sold on an as-available basis. Images and
        descriptions are provided for identification and may not capture every condition
        detail.
      </P>
    ),
  },
  {
    id: 'orders',
    title: 'Orders and Acceptance',
    content: (
      <P>
        Submitting an order does not guarantee acceptance or availability. An order may
        be canceled or adjusted if an item is unavailable, duplicated, incorrectly
        priced, affected by an inventory error, or otherwise cannot be fulfilled. Where
        payment has already been captured for an order we cannot fulfill, the applicable
        amount will be refunded through the payment provider, subject to processing time.
      </P>
    ),
  },
  {
    id: 'payments',
    title: 'Payments and Refunds',
    content: (
      <>
        <P>
          Online payments are processed through Stripe or another disclosed payment
          provider. By submitting payment, you authorize the applicable charge.
        </P>
        <BulletList
          items={[
            'Prices and applicable charges are shown before checkout.',
            'Payment-provider processing times and bank posting times are outside our control.',
            'Refunds, when approved, are returned through the original payment method where reasonably possible.',
            'We may decline or cancel suspicious, duplicate, unauthorized, or technically invalid transactions.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'pickup',
    title: 'Pickup',
    content: (
      <P>
        Customers are responsible for following the pickup instructions associated with
        the order or event. We may require order information or other reasonable proof
        before releasing an item. Unclaimed orders may be handled according to the pickup
        instructions communicated for the event, subject to applicable law and any
        refund terms disclosed at purchase.
      </P>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <P>
        You may not use the Service for fraud, unauthorized payment activity, automated
        abuse, interference with inventory or order systems, impersonation, harassment,
        security circumvention, unlawful resale activity, or any other unlawful or
        abusive purpose.
      </P>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-Party Services',
    content: (
      <P>
        The Service may rely on cloud infrastructure, payment processors, app stores,
        hosting, and other third-party providers. Their services may be subject to
        separate terms and privacy policies. Ahrok is not responsible for third-party
        services outside its reasonable control.
      </P>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy',
    content: (
      <P>
        Our handling of staff account information, inventory data, customer orders, and
        payment-status information is described in the{' '}
        <Link href="/privacy/nycmc-yard-sale" style={{ color: 'var(--ahrok-accent)' }}>
          NYCMC Yard Sale Privacy Policy
        </Link>
        .
      </P>
    ),
  },
  {
    id: 'availability',
    title: 'Service Availability',
    content: (
      <P>
        We do not guarantee uninterrupted access to the application, storefront, payment
        services, or event systems. Maintenance, connectivity, software defects,
        third-party outages, event conditions, or circumstances outside our control may
        affect availability.
      </P>
    ),
  },
  {
    id: 'warranties',
    title: 'Disclaimer of Warranties',
    content: (
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS
        AVAILABLE." AHROK DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        NOTHING IN THESE TERMS LIMITS RIGHTS THAT APPLICABLE CONSUMER LAW DOES NOT PERMIT
        US TO WAIVE.
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
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM
        THE SERVICE. TO THE MAXIMUM EXTENT PERMITTED BY LAW, AHROK&apos;S TOTAL LIABILITY
        RELATING TO A CUSTOMER ORDER WILL NOT EXCEED THE AMOUNT PAID FOR THAT ORDER.
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
        disputes will be brought in a court of competent jurisdiction in New York.
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

export default function NycmcYardSaleTermsPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Terms"
        title="NYCMC Yard Sale Terms of Use"
        intro="These Terms govern staff inventory tools, the public storefront, customer orders, payments, and event pickup."
        lastUpdated="August 11, 2026"
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
