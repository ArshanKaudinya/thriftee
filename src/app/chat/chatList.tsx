'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChatRoom } from './types'
import ChatItem from './chatItem'

export default function ChatList({ userId }: { userId: string }) {
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching chat rooms:', error.message)
        } else if (data) {
          console.log('[chatList] Loaded chats:', data)
          setChats(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching chats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="animate-pulse bg-slate-100 h-16 rounded-xl shadow-sm" />
        ))}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="text-center text-subtext mt-10 text-sm">
        No chats found. Start chatting by visiting an item page and clicking <b>&quot;Chat with seller&quot;</b>.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} currentUserId={userId} />
      ))}
    </div>
  )
}


