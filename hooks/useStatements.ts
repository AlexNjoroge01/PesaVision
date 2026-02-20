'use client'

import { useQuery } from '@tanstack/react-query'
import type { Statement, StatementStatus } from '@/types'

interface StatementWithInsight extends Statement {
  insight?: {
    healthScore: number
  } | null
  _count?: {
    transactions: number
  }
}

/**
 * Hook to fetch all statements for the current user
 */
export function useStatements() {
  return useQuery<StatementWithInsight[]>({
    queryKey: ['statements'],
    queryFn: async () => {
      const response = await fetch('/api/statements')
      if (!response.ok) {
        throw new Error('Failed to fetch statements')
      }
      return response.json()
    },
  })
}

/**
 * Hook to fetch a single statement with transactions and insight
 */
export function useStatement(id: string | null) {
  return useQuery<Statement>({
    queryKey: ['statements', id],
    queryFn: async () => {
      if (!id) throw new Error('Statement ID is required')
      const response = await fetch(`/api/statements/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch statement')
      }
      return response.json()
    },
    enabled: !!id,
    // Poll every 3 seconds while processing
    refetchInterval: (query) => {
      const data = query.state.data as Statement | undefined
      if (data?.status === 'PENDING' || data?.status === 'PROCESSING') {
        return 3000
      }
      return false
    },
  })
}

/**
 * Hook to get the insight from a statement
 */
export function useInsight(statementId: string | null) {
  const { data: statement, ...rest } = useStatement(statementId)
  
  return {
    insight: statement?.insight,
    ...rest,
  }
}

/**
 * Hook to check if a statement is still processing
 */
export function useIsProcessing(statementId: string | null) {
  const { data: statement } = useStatement(statementId)
  
  return statement?.status === 'PENDING' || statement?.status === 'PROCESSING'
}
