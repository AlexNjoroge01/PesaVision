'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Plan, Subscription } from '@/types'

interface SubscriptionData {
  subscription: Subscription | null
  plan: Plan
}

/**
 * Hook to fetch the current user's subscription
 */
export function useSubscription() {
  return useQuery<SubscriptionData>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await fetch('/api/billing/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }
      return response.json()
    },
  })
}

interface SubscribeParams {
  plan: 'BASIC' | 'PRO'
}

interface SubscribeResponse {
  authorizationUrl: string
  reference: string
}

/**
 * Hook to subscribe to a plan
 */
export function useSubscribe() {
  const queryClient = useQueryClient()

  return useMutation<SubscribeResponse, Error, SubscribeParams>({
    mutationFn: async (params) => {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initialize subscription')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Redirect to Paystack authorization URL
      window.location.href = data.authorizationUrl
    },
    onSettled: () => {
      // Refresh subscription data
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })
}
