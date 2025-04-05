'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Message } from './types'

export default function MessageItem({
  message,
  currentUserId,
}: {
  message: Message
  currentUserId: string
}) {
  const isMe = message.sender_id === currentUserId
  const [sender, setSender] = useState<{ name: string; avatar_url: string } | null>(null)

  useEffect(() => {
    const fetchSender = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', message.sender_id)
        .maybeSingle()
      if (!error && data) setSender(data)
    }
    fetchSender()
  }, [message.sender_id])

  return (
    <div className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-sm flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div className="text-xs text-gray-500 ml-12 mr-12 mb-1">
          {isMe ? 'You' : sender?.name || 'User'}
        </div>
        <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-8 h-8 shrink-0">
            {sender?.avatar_url ? (
              <Image
                src={sender.avatar_url}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300" />
            )}
          </div>
          <div
            className={`px-4 py-2 rounded-xl ${
              isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}




