'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PlanBadge } from '@/components/shared/PlanBadge'
import { useSubscribe } from '@/hooks/useSubscription'
import { Loader2, User, CreditCard, Shield, Trash2, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  businessName: z.string().optional(),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const plans = [
  {
    name: 'Free',
    price: 'KES 0',
    period: '',
    description: '1 statement per month',
    features: ['1 statement analysis', 'Basic dashboard', 'AI summary'],
    plan: 'FREE' as const,
  },
  {
    name: 'Basic',
    price: 'KES 499',
    period: '/mo',
    description: 'Unlimited statements',
    features: ['Unlimited statements', 'Full dashboard', 'Downloadable reports', 'AI chat advisor'],
    plan: 'BASIC' as const,
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'KES 1,499',
    period: '/mo',
    description: 'All features + KRA export',
    features: ['Everything in Basic', 'KRA-ready exports', 'WhatsApp bot', 'Priority support'],
    plan: 'PRO' as const,
  },
]

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const queryClient = useQueryClient()
  const subscribe = useSubscribe()

  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      businessName: '',
      phone: '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
      update()
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change password')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      passwordForm.reset()
      setShowPasswordForm(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleUpgrade = (plan: 'BASIC' | 'PRO') => {
    subscribe.mutate({ plan })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and subscription
        </p>
      </div>

      {/* Profile Section */}
      <Card className="bg-background/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            Profile
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  {...profileForm.register('name')}
                  placeholder="Your name"
                  className="h-11 rounded-xl border-2"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="h-11 rounded-xl border-2 bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                <Input
                  id="businessName"
                  {...profileForm.register('businessName')}
                  placeholder="Your business name"
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  {...profileForm.register('phone')}
                  placeholder="+254 7XX XXX XXX"
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Billing Section */}
      <Card id="billing" className="bg-background/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.plan === 'FREE'
                  ? 'Limited to 1 statement per month'
                  : session?.user?.plan === 'BASIC'
                  ? 'Unlimited statements with full dashboard'
                  : 'All features including KRA export and WhatsApp bot'}
              </p>
            </div>
            <PlanBadge plan={session?.user?.plan || 'FREE'} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative ${
                  plan.highlighted
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border'
                } ${session?.user?.plan === plan.plan ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full rounded-full"
                    variant={session?.user?.plan === plan.plan ? 'outline' : 'default'}
                    disabled={session?.user?.plan === plan.plan || subscribe.isPending}
                    onClick={() => plan.plan !== 'FREE' && handleUpgrade(plan.plan as 'BASIC' | 'PRO')}
                  >
                    {session?.user?.plan === plan.plan ? 'Current' : plan.plan === 'FREE' ? 'Downgrade' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="bg-background/80 backdrop-blur border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            Security
          </CardTitle>
          <CardDescription>
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordForm(true)}
              className="rounded-full border-2"
            >
              Change Password
            </Button>
          ) : (
            <form
              onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                  className="rounded-full shadow-lg shadow-primary/25"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    passwordForm.reset()
                  }}
                  className="rounded-full border-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <Trash2 className="h-4 w-4" />
            </div>
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled className="rounded-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
