import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register font (optional - uses default Helvetica if not registered)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4nYjVZg.ttf' },
  ],
})

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column' as const,
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    padding: 8,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right' as const,
  },
  healthScore: {
    alignItems: 'center' as const,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 15,
  },
  healthScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  healthScoreLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  summaryText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  listItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  listItemName: {
    fontSize: 10,
    color: '#1e293b',
    flex: 2,
  },
  listItemValue: {
    fontSize: 10,
    color: '#64748b',
    flex: 1,
    textAlign: 'right' as const,
  },
  listItemValueGreen: {
    fontSize: 10,
    color: '#16a34a',
    flex: 1,
    textAlign: 'right' as const,
  },
  listItemValueRed: {
    fontSize: 10,
    color: '#dc2626',
    flex: 1,
    textAlign: 'right' as const,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  statCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    marginBottom: 8,
    marginRight: '2%',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statValueGreen: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  statValueRed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  recommendationItem: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#1e40af',
  },
})

interface ReportData {
  statementId: string
  fileName: string
  periodStart: string | Date | null
  periodEnd: string | Date | null
  totalIn: number
  totalOut: number
  netFlow: number
  healthScore?: number
  aiSummary?: string
  topCustomers?: Array<{ name: string; amount: number; count: number }>
  topExpenses?: Array<{ category: string; amount: number; percentage: number }>
  recommendations?: string[]
  monthlySummary?: Array<{ month: string; income: number; expenses: number }>
}

interface Transaction {
  date: Date | string
  description: string
  amount: number
  isIncoming: boolean
  category: string
  counterparty?: string
  reference?: string
  balance?: number
}

// Monthly Summary PDF Document
export function MonthlySummaryPDF({ data }: { data: ReportData }) {
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE')}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Financial Summary</Text>
          <Text style={styles.subtitle}>
            Statement: {data.fileName} | Period: {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
          </Text>
        </View>

        {/* Health Score */}
        {data.healthScore !== undefined && (
          <View style={styles.healthScore}>
            <Text style={styles.healthScoreValue}>{data.healthScore}/100</Text>
            <Text style={styles.healthScoreLabel}>Business Health Score</Text>
          </View>
        )}

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>{formatCurrency(data.totalIn)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Expenses</Text>
              <Text style={styles.statValue}>{formatCurrency(data.totalOut)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Net Cash Flow</Text>
              <Text style={data.netFlow >= 0 ? styles.statValueGreen : styles.statValueRed}>
                {formatCurrency(data.netFlow)}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Summary */}
        {data.aiSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Analysis</Text>
            <Text style={styles.summaryText}>{data.aiSummary}</Text>
          </View>
        )}

        {/* Top Customers */}
        {data.topCustomers && data.topCustomers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Customers</Text>
            {data.topCustomers.slice(0, 5).map((customer, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemName}>{customer.name}</Text>
                <Text style={styles.listItemValue}>{formatCurrency(customer.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Expenses */}
        {data.topExpenses && data.topExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Expense Categories</Text>
            {data.topExpenses.slice(0, 5).map((expense, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemName}>{expense.category}</Text>
                <Text style={styles.listItemValue}>
                  {formatCurrency(expense.amount)} ({expense.percentage.toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {data.recommendations.slice(0, 5).map((rec, index) => (
              <Text key={index} style={styles.recommendationItem}>
                {rec}
              </Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by PesaVision</Text>
          <Text style={styles.footerText}>
            Report Date: {new Date().toLocaleDateString('en-KE')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Cash Flow Report PDF Document
export function CashFlowPDF({ data }: { data: ReportData & { transactions: Transaction[] } }) {
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE')}`
  }

  const formatShortDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cash Flow Report</Text>
          <Text style={styles.subtitle}>
            Statement: {data.fileName} | Period: {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
          </Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Inflows</Text>
              <Text style={styles.statValueGreen}>{formatCurrency(data.totalIn)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Outflows</Text>
              <Text style={styles.statValueRed}>{formatCurrency(data.totalOut)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Net Cash Flow</Text>
              <Text style={data.netFlow >= 0 ? styles.statValueGreen : styles.statValueRed}>
                {formatCurrency(data.netFlow)}
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Summary */}
        {data.monthlySummary && data.monthlySummary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
            {data.monthlySummary.map((month, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemName}>{month.month}</Text>
                <Text style={styles.listItemValueGreen}>
                  +{formatCurrency(month.income)}
                </Text>
                <Text style={styles.listItemValueRed}>
                  -{formatCurrency(month.expenses)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        {data.transactions && data.transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions (Last 20)</Text>
            {data.transactions.slice(0, 20).map((tx, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemName}>
                  {formatShortDate(tx.date)} - {tx.description}
                </Text>
                <Text style={tx.isIncoming ? styles.listItemValueGreen : styles.listItemValueRed}>
                  {tx.isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by PesaVision</Text>
          <Text style={styles.footerText}>
            Report Date: {new Date().toLocaleDateString('en-KE')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
