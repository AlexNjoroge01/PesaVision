'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Loader2, FileDown, Plus, FileText, FileBarChart, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Report, ReportType, Statement } from '@/types'

export default function ReportsPage() {
  const queryClient = useQueryClient()
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedStatementId, setSelectedStatementId] = useState<string>('')
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('MONTHLY_SUMMARY')

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      return response.json()
    },
  })

  // Fetch statements for dropdown
  const { data: statements } = useQuery<Statement[]>({
    queryKey: ['statements'],
    queryFn: async () => {
      const response = await fetch('/api/statements')
      if (!response.ok) throw new Error('Failed to fetch statements')
      return response.json()
    },
  })

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { statementId: string; type: ReportType }) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Report generated successfully!')
      setGenerateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const completedStatements = statements?.filter((s) => s.status === 'DONE') || []

  const handleGenerateReport = () => {
    if (!selectedStatementId) {
      toast.error('Please select a statement')
      return
    }
    generateMutation.mutate({
      statementId: selectedStatementId,
      type: selectedReportType,
    })
  }

  const reportTypeLabels: Record<ReportType, string> = {
    MONTHLY_SUMMARY: 'Monthly Summary (PDF)',
    KRA_EXPORT: 'KRA Export (CSV)',
    CASH_FLOW: 'Cash Flow Report (PDF)',
  }

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and download business reports
          </p>
        </div>
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={completedStatements.length === 0}
              className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Generate Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statement</label>
                <Select value={selectedStatementId} onValueChange={setSelectedStatementId}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder="Select a statement" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedStatements.map((statement) => (
                      <SelectItem key={statement.id} value={statement.id}>
                        {statement.fileName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedReportType} onValueChange={(v) => setSelectedReportType(v as ReportType)}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY_SUMMARY">Monthly Summary</SelectItem>
                    <SelectItem value="CASH_FLOW">Cash Flow Report</SelectItem>
                    <SelectItem value="KRA_EXPORT">KRA Export (Pro Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                onClick={handleGenerateReport}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      {!reports || reports.length === 0 ? (
        <EmptyState type="reports" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="bg-background/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {reportTypeLabels[report.type]}
                </CardTitle>
                {report.type === 'KRA_EXPORT' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Created: {new Date(report.createdAt).toLocaleDateString()}
                </p>
                {report.fileUrl ? (
                  <Button variant="outline" size="sm" className="w-full rounded-full border-2" asChild>
                    <a href={`/api/reports/${report.id}/download`} download>
                      <FileDown className="mr-2 h-4 w-4" />
                      Download {report.type === 'KRA_EXPORT' ? 'CSV' : 'PDF'}
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Processing...</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
