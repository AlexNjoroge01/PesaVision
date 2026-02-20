'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, Category } from '@/types'

interface TransactionsTableProps {
  transactions: Transaction[]
  title?: string
  showPagination?: boolean
  limit?: number
  className?: string
}

const categoryColors: Record<Category, string> = {
  SALES: 'bg-green-100 text-green-800',
  SUPPLIER_PAYMENT: 'bg-blue-100 text-blue-800',
  UTILITY: 'bg-yellow-100 text-yellow-800',
  SALARY: 'bg-purple-100 text-purple-800',
  WITHDRAWAL: 'bg-pink-100 text-pink-800',
  TRANSFER: 'bg-cyan-100 text-cyan-800',
  AIRTIME: 'bg-orange-100 text-orange-800',
  UNCATEGORIZED: 'bg-gray-100 text-gray-800',
}

const ITEMS_PER_PAGE = 10

export function TransactionsTable({
  transactions,
  title = 'Transactions',
  showPagination = true,
  limit,
  className,
}: TransactionsTableProps) {
  const [page, setPage] = useState(1)

  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions

  const totalPages = Math.ceil(displayTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = showPagination
    ? displayTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    : displayTransactions

  if (!transactions || transactions.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {transactions.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {transactions.length} transactions
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-sm">
                    {new Date(transaction.date).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm font-medium truncate">
                        {transaction.counterparty || transaction.description?.slice(0, 30) || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {transaction.reference || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        categoryColors[transaction.category]
                      )}
                    >
                      {transaction.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        'flex items-center justify-end gap-1',
                        transaction.isIncoming ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.isIncoming ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span className="font-medium">
                        KES {transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {transaction.balance
                      ? `KES ${transaction.balance.toLocaleString()}`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
