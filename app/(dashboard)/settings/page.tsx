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
import { Loader2, User, CreditCard, Shield, Trash2 } from 'lucide-react'
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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and subscription
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...profileForm.register('name')}
                  placeholder="Your name"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  {...profileForm.register('businessName')}
                  placeholder="Your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...profileForm.register('phone')}
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
            </div>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Billing Section */}
      <Card id="billing">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
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

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">KES 0</p>
                <p className="text-sm text-muted-foreground mb-4">
                  1 statement per month
                </p>
                <Button variant="outline" className="w-full" disabled={session?.user?.plan === 'FREE'}>
                  {session?.user?.plan === 'FREE' ? 'Current' : 'Downgrade'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Basic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">KES 499<span className="text-sm font-normal">/mo</span></p>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlimited statements
                </p>
                <Button
                  className="w-full"
                  variant={session?.user?.plan === 'BASIC' ? 'outline' : 'default'}
                  disabled={session?.user?.plan === 'BASIC' || subscribe.isPending}
                  onClick={() => handleUpgrade('BASIC')}
                >
                  {session?.user?.plan === 'BASIC' ? 'Current' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">KES 1,499<span className="text-sm font-normal">/mo</span></p>
                <p className="text-sm text-muted-foreground mb-4">
                  All features + KRA export
                </p>
                <Button
                  className="w-full"
                  variant={session?.user?.plan === 'PRO' ? 'outline' : 'default'}
                  disabled={session?.user?.plan === 'PRO' || subscribe.isPending}
                  onClick={() => handleUpgrade('PRO')}
                >
                  {session?.user?.plan === 'PRO' ? 'Current' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          ) : (
            <form
              onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={changePasswordMutation.isPending}>
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
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
