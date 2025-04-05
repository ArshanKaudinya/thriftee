'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function MessageInput({ chatId }: { chatId: string }) {
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user) {
          toast.error('Unable to fetch user')
          return
        }
        setUserId(data.user.id)
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    getUser()
  }, [])

  const sendMessage = async () => {
    if (!text.trim() || !userId) return

    try {
      const { error } = await supabase.from('messages').insert([
        {
          chat_id: chatId,
          sender_id: userId,
          content: text,
        }
      ])

      if (error) {
        toast.error('Failed to send message')
      } else {
        setText('')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Unexpected error sending message')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <input
        className="flex-grow px-4 py-2 border rounded-xl"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={sendMessage} className="bg-slate-400 px-4 py-2 rounded-xl text-white">
        Send
      </button>
    </div>
  )
}


