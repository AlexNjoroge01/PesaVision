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

interface WelcomeEmailProps {
  name: string
  businessName?: string | null
}

export function WelcomeEmail({ name, businessName }: WelcomeEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to PesaVision! 🎉</Heading>

          <Text style={text}>
            Hi {name},
          </Text>

          <Text style={text}>
            {businessName
              ? `Welcome to PesaVision! We're excited to help ${businessName} grow with AI-powered M-Pesa analytics.`
              : 'Welcome to PesaVision! We\'re excited to help you grow your business with AI-powered M-Pesa analytics.'}
          </Text>

          <Section style={stepsContainer}>
            <Heading as="h2" style={h2}>Quick Start Guide</Heading>

            <Text style={stepText}>
              <strong>1. Upload your M-Pesa statement</strong>
              <br />
              Download your PDF statement from M-Pesa and upload it to get started.
            </Text>

            <Text style={stepText}>
              <strong>2. AI analyzes your transactions</strong>
              <br />
              Our AI categorizes every transaction and identifies patterns in your business.
            </Text>

            <Text style={stepText}>
              <strong>3. Get actionable insights</strong>
              <br />
              View your dashboard to see top customers, expenses, and recommendations.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appName}/statements`}>
              Upload Your First Statement
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You're on the Free plan with 1 statement analysis per month.
            <br />
            Upgrade to Basic or Pro for unlimited statements and more features.
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

const stepsContainer = {
  padding: '24px 48px',
}

const stepText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '16px',
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

export default WelcomeEmail
