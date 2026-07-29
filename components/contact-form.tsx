'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  FormControl,
  TextInput,
  Textarea,
  Button,
  Stack,
  Flash,
  Heading,
  Text,
  Link,
} from '@primer/react'
import { CheckCircleIcon, PaperAirplaneIcon } from '@primer/octicons-react'
import { sendContactMessage, type ContactState } from '@/app/contact/actions'

const initialState: ContactState = { status: 'idle', message: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="primary"
      size="large"
      disabled={pending}
      leadingVisual={pending ? undefined : PaperAirplaneIcon}
    >
      {pending ? 'Sending…' : 'Send message'}
    </Button>
  )
}

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialState)

  if (state.status === 'success') {
    return (
      <div
        style={{
          border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          borderRadius: 'var(--borderRadius-large)',
          padding: 32,
          backgroundColor: 'var(--bgColor-muted)',
        }}
      >
        <Stack direction="vertical" gap="normal" align="center">
          <CheckCircleIcon size={32} fill="var(--fgColor-success)" />
          <Heading as="h2" variant="small">
            Thanks for reaching out
          </Heading>
          <Text style={{ color: 'var(--fgColor-muted)', textAlign: 'center' }}>
            {state.message}
          </Text>
        </Stack>
      </div>
    )
  }

  return (
    <div
      style={{
        border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        borderRadius: 'var(--borderRadius-large)',
        padding: 32,
        backgroundColor: 'var(--bgColor-default)',
      }}
    >
      <form action={formAction}>
        <Stack direction="vertical" gap="normal">
          {state.status === 'error' && (
            <Flash variant="danger">{state.message}</Flash>
          )}

          <Stack direction="horizontal" gap="normal" wrap="wrap">
            <div style={{ flex: 1, minWidth: 200 }}>
              <FormControl required>
                <FormControl.Label>Name</FormControl.Label>
                <TextInput
                  name="name"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  block
                />
              </FormControl>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FormControl required>
                <FormControl.Label>Email</FormControl.Label>
                <TextInput
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  autoComplete="email"
                  block
                />
              </FormControl>
            </div>
          </Stack>

          <FormControl>
            <FormControl.Label>Company</FormControl.Label>
            <TextInput
              name="company"
              placeholder="Company name"
              autoComplete="organization"
              block
            />
          </FormControl>

          <FormControl required>
            <FormControl.Label>Message</FormControl.Label>
            <Textarea
              name="message"
              placeholder="Tell us about your product idea, partnership, or question."
              rows={5}
              block
              resize="vertical"
            />
          </FormControl>

          {/* Honeypot field — hidden from real users, catches bots. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: 1,
              height: 1,
              overflow: 'hidden',
            }}
          >
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
            Your message goes straight to our inbox at{' '}
            <Link href="mailto:hello@ahrok.site">hello@ahrok.site</Link>.
            We&apos;ll reply to the email address you provide.
          </Text>

          <Stack direction="horizontal" justify="end">
            <SubmitButton />
          </Stack>
        </Stack>
      </form>
    </div>
  )
}
