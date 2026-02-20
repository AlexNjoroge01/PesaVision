import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from '@react-email/components'

interface SubscriptionConfirmedEmailProps {
  name: string
  plan: string
  nextBillingDate: Date
}

export function SubscriptionConfirmedEmail({
  name,
  plan,
  nextBillingDate,
}: SubscriptionConfirmedEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const planFeatures: Record<string, string[]> = {
    BASIC: [
      'Unlimited statement uploads',
      'Full dashboard access',
      'Downloadable reports',
      'AI chat advisor',
    ],
    PRO: [
      'Everything in Basic',
      'KRA-ready CSV export',
      'WhatsApp bot access',
      'Priority support',
    ],
  }

  const features = planFeatures[plan] || []

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're now on the {plan} plan ✅</Heading>

          <Text style={text}>
            Hi {name},
          </Text>

          <Text style={text}>
            Thank you for upgrading to PesaVision {plan}! Your subscription is now active.
          </Text>

          <Section style={featuresContainer}>
            <Heading as="h2" style={h2}>Your {plan} Features</Heading>
            {features.map((feature, index) => (
              <Text key={index} style={featureText}>
                ✓ {feature}
              </Text>
            ))}
          </Section>

          <Section style={billingContainer}>
            <Text style={billingText}>
              <strong>Next billing date:</strong>{' '}
              {nextBillingDate.toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appName}/dashboard`}>
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Reply to this email or visit our support center.
          </Text>

          <Text style={footer}>
            — The PesaVision Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '700',
  margin: '40px 0',
  padding: '0 48px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const featuresContainer = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  margin: '24px 48px',
  padding: '24px',
}

const featureText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const billingContainer = {
  padding: '0 48px',
}

const billingText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
}

const buttonContainer = {
  padding: '27px 48px',
}

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 48px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 48px',
}

export default SubscriptionConfirmedEmail
