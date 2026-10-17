import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/container"
export const metadata: Metadata = {
  title: "Adab Clock Privacy Policy | Ahrok LLC",
  description: "How Adab Clock handles information: an offline clock and Khutbah reminder without accounts, analytics, or ads.",
}
const sections = [
  {
    "title": "Information collected by the app",
    "body": "Adab Clock does not collect, transmit, sell, or share personal information. It does not require an account and does not include advertising, analytics, or tracking SDKs."
  },
  {
    "title": "On-device operation",
    "body": "The clock reads the device’s local time. The app uses screen dimensions and foreground status to adapt its layout and prevent automatic screen sleep while open. These values are processed on the device and are not sent to Ahrok LLC. The app’s display fonts are bundled locally. Its clock and reminder work without an internet connection."
  },
  {
    "title": "Permissions and device features",
    "body": "Adab Clock does not request access to your camera, microphone, contacts, photos, or location. Screen-awake functionality operates while the app is in use; it does not give the app access to personal content."
  },
  {
    "title": "Retention and deletion",
    "body": "Ahrok LLC does not retain app usage records or personal information collected through Adab Clock because the app does not collect that information. There is no account to delete. You can uninstall the app at any time."
  },
  {
    "title": "Support communications",
    "body": "If you contact us by email, we receive the information you choose to include, such as your email address and message. We use it to respond and resolve the request. Support messages are retained only as long as needed for that purpose and any applicable recordkeeping obligations. You may request deletion by contacting us. Please do not include sensitive information."
  },
  {
    "title": "External services and links",
    "body": "Google Play and other distribution platforms may process download, purchase, diagnostic, or account information under their own privacy policies. If you open our website or email us, the relevant website, hosting, or email provider may process technical information needed to deliver those services. This activity is separate from the app’s offline clock functionality."
  },
  {
    "title": "Children’s privacy",
    "body": "Adab Clock does not knowingly collect personal information from children or other users through the app."
  },
  {
    "title": "Policy changes",
    "body": "We may update this policy to reflect changes to the app or our practices. The current policy will be posted on this page with an updated effective date."
  },
  {
    "title": "Contact",
    "body": "Ahrok LLC Email:  hello@ahrok.site "
  }
]
export default function Page() {
  return (
    <main><Container narrow>
      <article style={{ padding: "64px 0 80px", fontSize: "1rem", lineHeight: 1.7 }}>
        <Link href="/">Ahrok LLC</Link>
        <p style={{ color: "var(--ahrok-accent)", fontWeight: 600, marginTop: 32 }}>ADAB CLOCK · AHROK LLC</p>
        <h1 style={{ fontSize: "clamp(32px,6vw,52px)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>Adab Clock Privacy Policy</h1>
        <p>Effective October 16, 2026. Developer: Ahrok LLC.<br />Android package: com.ahrok.adabclock.</p>
        <p>Adab Clock displays the device’s local time and a reminder to remain silent during Khutbah. This policy explains how Ahrok LLC handles information in connection with the app.</p>
        {sections.map(section => (
          <section key={section.title}>
            <h2 style={{ fontSize: 24, marginTop: 32 }}>{section.title}</h2>
            {section.title === "Contact" ? (
              <p>Ahrok LLC<br />Email: <a href="mailto:hello@ahrok.site?subject=Adab%20Clock%20privacy">hello@ahrok.site</a></p>
            ) : <p>{section.body}</p>}
          </section>
        ))}
      </article>
    </Container></main>
  )
}
