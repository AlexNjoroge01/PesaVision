import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Upload,
  Brain,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  LineChart,
  MessageCircle,
  Clock,
  Star,
} from 'lucide-react'

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

const features = [
  {
    icon: TrendingUp,
    title: 'Cash Flow Analysis',
    description: 'Track your income and expenses over time with beautiful, interactive charts.',
    color: 'emerald',
  },
  {
    icon: Users,
    title: 'Top Customers',
    description: 'Identify your best customers by revenue and transaction frequency.',
    color: 'blue',
  },
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Get personalized business advice based on your transaction patterns.',
    color: 'violet',
  },
  {
    icon: FileText,
    title: 'KRA-Ready Exports',
    description: 'Generate CSV files formatted for iTax filing (Pro plan).',
    color: 'orange',
  },
  {
    icon: BarChart3,
    title: 'Health Score',
    description: 'Get a business health score based on your cash flow patterns.',
    color: 'pink',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Bot',
    description: 'Send statements via WhatsApp for instant analysis (Pro plan).',
    color: 'cyan',
  },
]

const stats = [
  { value: '100+', label: 'Statements Analyzed' },
  { value: '20+', label: 'Active Businesses' },
  { value: 'KES 100k+', label: 'Transactions Processed' },
  { value: '99.9%', label: 'Uptime' },
]

const testimonials = [
  {
    quote: "PesaVision transformed how I understand my business finances. The AI insights are incredibly accurate!",
    author: "Mary W.",
    role: "Retail Shop Owner",
    rating: 5,
  },
  {
    quote: "Finally, a tool that makes M-Pesa statements make sense. My accountant loves the KRA-ready exports.",
    author: "John K.",
    role: "Freelance Developer",
    rating: 5,
  },
  {
    quote: "The WhatsApp bot is a game-changer. I get instant analysis without opening my laptop.",
    author: "Sarah M.",
    role: "Event Planner",
    rating: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Gradient Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            
            <span className="text-sm font-medium">AI-Powered Financial Analytics</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Transform Your{' '}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              M-Pesa Data
            </span>{' '}
            Into Business Intelligence
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Upload your M-Pesa statement PDF and get instant business insights, 
            cash flow reports, and KRA-ready exports. No accountant needed — just AI-powered clarity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="text-lg px-10 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Link href="/register">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 rounded-full border-2">
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Free plan: 1 statement analysis per month • No credit card required
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y bg-gradient-to-r from-primary/5 via-violet-500/5 to-cyan-500/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get from PDF to insights in under 60 seconds
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Statement',
                description: 'Download your M-Pesa statement PDF and upload it to PesaVision. Takes less than a minute.',
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI Analysis',
                description: 'Our AI categorizes every transaction, identifies patterns, and generates actionable insights.',
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Get Insights',
                description: 'View your dashboard with top customers, expense breakdown, cash flow trends, and recommendations.',
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="relative bg-background/50 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <span className="text-xs font-bold text-primary mb-4 block">{item.step}</span>
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand and grow your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-background border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Kenyan Businesses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of SMEs already using PesaVision
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-b from-background to-muted/20 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. Start free, upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlighted
                    ? 'border-primary shadow-2xl shadow-primary/20 scale-105 bg-gradient-to-b from-background to-primary/5'
                    : 'bg-background/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-violet-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2 pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-3">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <X className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full rounded-full py-6"
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
            <h3 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid gap-6">
              {[
                {
                  q: 'What is a statement analysis?',
                  a: 'A statement analysis processes your M-Pesa PDF statement and uses AI to categorize transactions, identify top customers, analyze expenses, and generate business insights.',
                },
                {
                  q: 'How do I get my M-Pesa statement?',
                  a: 'You can download your M-Pesa statement from the M-Pesa app or by dialing *234#. Select the option to receive your statement via email, then download the PDF to upload to PesaVision.',
                },
                {
                  q: 'Is my data secure?',
                  a: 'Yes! We use industry-standard encryption and secure cloud storage. Your statements are processed securely and only you can access your data.',
                },
                {
                  q: 'Can I cancel my subscription?',
                  a: 'Yes, you can cancel anytime. Your subscription will remain active until the end of the billing period, and you can continue using all features until then.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept payments via Paystack, which supports M-Pesa, cards, and bank transfers. All payments are processed securely.',
                },
              ].map((faq, index) => (
                <div key={index} className="p-6 rounded-xl bg-muted/30 border">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-violet-600 to-cyan-600 p-12 text-center text-white">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to understand your business?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of Kenyan SMEs using PesaVision to make better business decisions.
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-10 py-6 text-lg">
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
