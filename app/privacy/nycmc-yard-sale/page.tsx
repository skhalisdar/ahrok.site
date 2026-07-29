import type { Metadata } from 'next'
import Link from 'next/link'
import { Text } from '@primer/react'
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
    'Privacy policy for NYCMC Yard Sale, an inventory-management app developed by Ahrok LLC.',
}

const PrivacyEmail = () => (
  <Link href="mailto:privacy@ahrok.site" style={{ color: 'var(--ahrok-accent)' }}>
    privacy@ahrok.site
  </Link>
)

const sections: PrivacySection[] = [
  {
    id: 'who-we-are',
    title: 'Who We Are',
    content: <P>NYCMC Yard Sale is an app developed by Ahrok LLC.</P>,
  },
  {
    id: 'information-collected',
    title: 'Information the App May Collect',
    content: (
      <BulletList
        items={[
          'Account information, such as email address and name, when a user creates or uses an account.',
          'Inventory information entered by the user, such as item names, quantities, prices, locations, descriptions, and sales records.',
          'Photos a user chooses to add to inventory items through the device camera or photo library.',
          'Basic technical information necessary to operate, secure, and maintain the app.',
        ]}
      />
    ),
  },
  {
    id: 'how-used',
    title: 'How Information Is Used',
    content: (
      <>
        <P>The information is used to:</P>
        <BulletList
          items={[
            'Provide inventory-management features.',
            'Authenticate users and maintain account access.',
            'Store and display inventory records and item photos.',
            'Maintain app security, reliability, and support.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'storage-providers',
    title: 'Storage and Service Providers',
    content: (
      <P>
        NYCMC Yard Sale uses Supabase as a backend service provider for
        authentication, database storage, and image storage.
      </P>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing',
    content: (
      <P>
        Ahrok LLC does not sell personal information. Information is shared only
        with service providers necessary to operate the app, such as Supabase,
        or when required by law.
      </P>
    ),
  },
  {
    id: 'retention',
    title: 'Data Retention',
    content: (
      <P>
        Information is retained for as long as needed to provide the app,
        maintain records, meet legal obligations, resolve disputes, and enforce
        agreements.
      </P>
    ),
  },
  {
    id: 'account-deletion',
    title: 'Account Deletion',
    content: (
      <P>
        Users can request deletion of their account and associated personal
        information through the account-deletion option available in the app.
        Users may also contact <PrivacyEmail />.
      </P>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    content: (
      <P>
        NYCMC Yard Sale is not directed to children under 13, and Ahrok LLC does
        not knowingly collect personal information from children under 13.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <P>
        Changes to this policy will be posted on this page with an updated
        effective date.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Text weight="semibold">Ahrok LLC</Text>
        <Text>
          <PrivacyEmail />
        </Text>
        <Link
          href="/privacy/nycmc-yard-sale"
          style={{ color: 'var(--fgColor-muted)', fontSize: 14 }}
        >
          https://ahrok.site/privacy/nycmc-yard-sale
        </Link>
      </div>
    ),
  },
]

export default function NycmcYardSalePrivacyPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Privacy Policy"
        title="NYCMC Yard Sale Privacy Policy"
        intro="NYCMC Yard Sale is a mobile inventory-management app. This policy explains what information the app may collect and how it is used."
      />
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections}>
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop:
                'var(--borderWidth-thin) solid var(--borderColor-default)',
            }}
          >
            <P>
              You may contact <PrivacyEmail /> with privacy questions or
              requests.
            </P>
          </div>
        </PrivacyBody>
      </div>
    </main>
  )
}
