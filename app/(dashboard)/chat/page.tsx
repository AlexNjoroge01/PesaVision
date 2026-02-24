'use client'

import { useState, useRef, useEffect, useCallback, FormEvent, ChangeEvent } from 'react'
import { useStatements } from '@/hooks/useStatements'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Send, Bot, User, MessageSquare, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '@/components/shared/EmptyState'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  "What are my best customers?",
  "How can I improve my cash flow?",
  "What are my biggest expenses?",
  "Give me business recommendations",
]

export default function ChatPage() {
  const { data: statements } = useStatements()
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          statementId: selectedStatementId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, assistantMessage])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: assistantContent } : m
          )
        )
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const completedStatements = statements?.filter((s) => s.status === 'DONE') || []

  if (completedStatements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
          <p className="text-muted-foreground mt-1">
            Chat with an AI advisor about your business
          </p>
        </div>
        <EmptyState type="chat" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about your business data
          </p>
        </div>
        <Select
          value={selectedStatementId || ''}
          onValueChange={setSelectedStatementId}
        >
          <SelectTrigger className="w-[250px] rounded-xl border-2">
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

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0 bg-background/80 backdrop-blur-xl border-0 shadow-2xl shadow-primary/10">
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-6"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mb-6">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-muted-foreground mb-8 text-center max-w-md">
                  Ask questions about your business data and get AI-powered insights
                </p>
                <div className="grid gap-3 md:grid-cols-2 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 rounded-xl border-2 hover:bg-muted/50 transition-all"
                      onClick={() => sendMessage(prompt)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2 shrink-0 text-primary" />
                      <span className="text-sm">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role !== 'user' && (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-2xl px-5 py-3 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'bg-muted/80 backdrop-blur'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-muted/80 backdrop-blur rounded-2xl px-5 py-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-background/50 backdrop-blur">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your business..."
                className="min-h-[48px] max-h-32 resize-none rounded-xl border-2 focus:border-primary transition-colors"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
