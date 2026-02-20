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
import { Loader2, FileDown, Plus, FileText, FileBarChart, FileSpreadsheet } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download business reports
          </p>
        </div>
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={completedStatements.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statement</label>
                <Select value={selectedStatementId} onValueChange={setSelectedStatementId}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                className="w-full"
                onClick={handleGenerateReport}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
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
            <Card key={report.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {reportTypeLabels[report.type]}
                </CardTitle>
                {report.type === 'KRA_EXPORT' ? (
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  Created: {new Date(report.createdAt).toLocaleDateString()}
                </p>
                {report.fileUrl ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
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
