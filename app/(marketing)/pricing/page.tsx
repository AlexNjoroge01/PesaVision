import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, X } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 'KES 0',
    period: 'per month',
    description: 'Perfect for trying out PesaVision',
    features: [
      { text: '1 statement analysis per month', included: true },
      { text: 'Basic dashboard view', included: true },
      { text: 'Transaction categorization', included: true },
      { text: 'AI summary', included: true },
      { text: 'Unlimited statements', included: false },
      { text: 'Downloadable reports', included: false },
      { text: 'KRA-ready exports', included: false },
      { text: 'WhatsApp bot', included: false },
      { text: 'AI chat advisor', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Basic',
    price: 'KES 499',
    period: 'per month',
    description: 'For growing businesses that need more',
    features: [
      { text: 'Unlimited statement uploads', included: true },
      { text: 'Full dashboard access', included: true },
      { text: 'Transaction categorization', included: true },
      { text: 'AI summary & recommendations', included: true },
      { text: 'Downloadable reports', included: true },
      { text: 'AI chat advisor', included: true },
      { text: 'KRA-ready exports', included: false },
      { text: 'WhatsApp bot', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start with Basic',
    ctaLink: '/register?plan=basic',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'KES 1,499',
    period: 'per month',
    description: 'For businesses that want it all',
    features: [
      { text: 'Everything in Basic', included: true },
      { text: 'KRA-ready CSV exports', included: true },
      { text: 'WhatsApp bot for quick analysis', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Monthly summary emails', included: true },
      { text: 'Custom report templates', included: true },
      { text: 'API access (coming soon)', included: true },
      { text: 'Team sharing (coming soon)', included: true },
      { text: 'White-label reports (coming soon)', included: true },
    ],
    cta: 'Start with Pro',
    ctaLink: '/register?plan=pro',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? 'border-primary shadow-lg scale-105'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <Link href={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">
                What is a statement analysis?
              </h3>
              <p className="text-muted-foreground">
                A statement analysis processes your M-Pesa PDF statement and uses AI
                to categorize transactions, identify top customers, analyze expenses,
                and generate business insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                How do I get my M-Pesa statement?
              </h3>
              <p className="text-muted-foreground">
                You can download your M-Pesa statement from the M-Pesa app or by
                dialing *234#. Select the option to receive your statement via email,
                then download the PDF to upload to PesaVision.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Is my data secure?
              </h3>
              <p className="text-muted-foreground">
                Yes! We use industry-standard encryption and secure cloud storage.
                Your statements are processed securely and only you can access your data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can cancel anytime. Your subscription will remain active
                until the end of the billing period, and you can continue using
                all features until then.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept payments via Paystack, which supports M-Pesa, cards,
                and bank transfers. All payments are processed securely.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Start with our free plan and upgrade when you need more.
          </p>
          <Button asChild size="lg">
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
