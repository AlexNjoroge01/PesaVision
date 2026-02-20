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

interface MonthlySummaryEmailProps {
  name: string
  month: string
  totalIn: number
  totalOut: number
  netFlow: number
  topCustomer: string
  healthScore: number
}

export function MonthlySummaryEmail({
  name,
  month,
  totalIn,
  totalOut,
  netFlow,
  topCustomer,
  healthScore,
}: MonthlySummaryEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const healthColor = healthScore >= 70 ? '#22c55e' : healthScore >= 50 ? '#eab308' : '#ef4444'

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📈 Your {month} Business Summary</Heading>

          <Text style={text}>
            Hi {name},
          </Text>

          <Text style={text}>
            Here's a summary of your business performance for {month}:
          </Text>

          <Section style={statsContainer}>
            <Section style={statRow}>
              <Section style={statItem}>
                <Text style={statLabel}>Revenue</Text>
                <Text style={statValueGreen}>KES {totalIn.toLocaleString()}</Text>
              </Section>
              <Section style={statItem}>
                <Text style={statLabel}>Expenses</Text>
                <Text style={statValueRed}>KES {totalOut.toLocaleString()}</Text>
              </Section>
            </Section>
            <Section style={statRow}>
              <Section style={statItem}>
                <Text style={statLabel}>Net Flow</Text>
                <Text style={netFlow >= 0 ? statValueBlue : statValueRed}>
                  KES {netFlow.toLocaleString()}
                </Text>
              </Section>
              <Section style={statItem}>
                <Text style={statLabel}>Health Score</Text>
                <Text style={{ ...statValue, color: healthColor }}>{healthScore}/100</Text>
              </Section>
            </Section>
          </Section>

          <Section style={highlightContainer}>
            <Text style={highlightLabel}>Top Customer</Text>
            <Text style={highlightValue}>{topCustomer}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appName}/dashboard`}>
              View Full Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Keep tracking your M-Pesa transactions to get more insights!
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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const statsContainer = {
  margin: '24px 48px',
}

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px',
}

const statItem = {
  flex: '1',
  textAlign: 'center' as const,
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 4px',
}

const statLabel = {
  color: '#666',
  fontSize: '12px',
  margin: '0 0 8px',
}

const statValue = {
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
}

const statValueGreen = {
  ...statValue,
  color: '#22c55e',
}

const statValueRed = {
  ...statValue,
  color: '#ef4444',
}

const statValueBlue = {
  ...statValue,
  color: '#3b82f6',
}

const highlightContainer = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  margin: '24px 48px',
  padding: '20px',
  textAlign: 'center' as const,
}

const highlightLabel = {
  color: '#666',
  fontSize: '12px',
  margin: '0 0 8px',
}

const highlightValue = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
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

export default MonthlySummaryEmail
