import ChatMessage from './ChatMessage'
import React, { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'

const Chat = () => {
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('messages')
    return saved
      ? JSON.parse(saved).map((m: Message) => ({
          ...m,
          date: new Date(m.date),
        }))
      : []
  })
  const [loading, setLoading] = useState<boolean>(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      sender: 'user',
      date: new Date(),
      message: message,
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setMessage('')

    setLoading(true)
    try {
      const response = await fetch('/api/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content:
                'Ti si asistent za nekretnine. Odgovaraj samo na pitanja vezana za kupovinu, prodaju i iznajmljivanje nekretnina.',
            },
            ...updatedMessages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.message,
            })),
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const botMessage: Message = {
        sender: 'assistant',
        date: new Date(),
        message: data.choices[0].message.content,
      }
      setMessages([...updatedMessages, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        sender: 'assistant',
        date: new Date(),
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Try again.',
      }

      setMessages([...updatedMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className='container flex flex-col h-[600px] rounded-lg border border-gray-300'>
        <div className='p-4 border-b border-gray-300 font-semibold text-lg'>
          Real Estate Bot
        </div>
        <div className='flex-1 flex flex-col overflow-y-auto p-4 space-y-4 '>
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          <div ref={bottomRef}></div>
        </div>
        {loading && (
          <p className='self-start max-w-xs bg-gray-200 text-gray-500 rounded-lg p-3 italic'>
            Bot kuca...
          </p>
        )}
        <div className='flex gap-2 p-3 border-t border-gray-300'>
          <input
            type='text'
            placeholder='Postavite pitanje...'
            className='flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500'
            value={message}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className='bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2'
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}

export default Chat
