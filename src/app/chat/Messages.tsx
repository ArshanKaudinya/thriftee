'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Message } from './types'
import MessageItem from './messageItem'
import { ClipLoader } from 'react-spinners'

export default function Messages({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error fetching user:', error)
        } else if (data.user) {
          setUserId(data.user.id)
        }
      } catch (err) {
        console.error('Unexpected error fetching user:', err)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })
        if (error) {
          console.error('Error fetching messages:', error)
        } else if (data) {
          setMessages(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching messages:', err)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('New message payload:', payload)
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  if (!userId || loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <ClipLoader size={35} color="#36d7b7" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-2 py-4 overflow-y-auto max-h-[65vh]">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} currentUserId={userId} />
      ))}
      <div ref={scrollRef} />
    </div>
  )
}




