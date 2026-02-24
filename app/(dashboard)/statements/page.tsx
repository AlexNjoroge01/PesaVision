'use client'

import { useState } from 'react'
import { StatementList } from '@/components/statements/StatementList'
import { UploadZone } from '@/components/statements/UploadZone'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Plus, ArrowRight, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StatementsPage() {
  const router = useRouter()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const handleUploadComplete = (statementId: string) => {
    setUploadDialogOpen(false)
    router.push(`/statements/${statementId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statements</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your M-Pesa statements
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Upload Statement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Upload M-Pesa Statement</DialogTitle>
            </DialogHeader>
            <UploadZone onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statement List */}
      <StatementList />
    </div>
  )
}
