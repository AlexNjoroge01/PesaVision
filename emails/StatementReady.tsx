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

interface StatementReadyEmailProps {
  statementId: string
  healthScore: number
  aiSummary: string
}

export function StatementReadyEmail({
  statementId,
  healthScore,
  aiSummary,
}: StatementReadyEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const healthColor = healthScore >= 70 ? '#22c55e' : healthScore >= 50 ? '#eab308' : '#ef4444'

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your M-Pesa analysis is ready 📊</Heading>

          <Text style={text}>
            Great news! Your statement has been analyzed and your business insights are ready to view.
          </Text>

          <Section style={scoreContainer}>
            <Text style={scoreLabel}>Health Score</Text>
            <Text style={{ ...scoreValue, color: healthColor }}>
              {healthScore}/100
            </Text>
          </Section>

          <Section style={summaryContainer}>
            <Heading as="h2" style={h2}>AI Summary</Heading>
            <Text style={summaryText}>{aiSummary}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appName}/statements/${statementId}`}>
              View Full Analysis
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            View your complete dashboard to see:
            <br />• Top customers by revenue
            <br />• Expense breakdown by category
            <br />• Cash flow trends
            <br />• Personalized recommendations
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
  margin: '0 0 12px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const scoreContainer = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  margin: '24px 48px',
  padding: '24px',
  textAlign: 'center' as const,
}

const scoreLabel = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const scoreValue = {
  fontSize: '48px',
  fontWeight: '700',
  margin: '0',
}

const summaryContainer = {
  padding: '0 48px',
}

const summaryText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  backgroundColor: '#f6f9fc',
  padding: '16px',
  borderRadius: '8px',
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

export default StatementReadyEmail
