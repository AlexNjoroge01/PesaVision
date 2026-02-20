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
import { Upload, Plus } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statements</h1>
          <p className="text-muted-foreground">
            Upload and manage your M-Pesa statements
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Statement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload M-Pesa Statement</DialogTitle>
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
