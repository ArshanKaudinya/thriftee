'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Messages from '../Messages'
import MessageInput from '../messageInput'
import Image from 'next/image'
import { ClipLoader } from 'react-spinners'

interface OtherUser {
  name: string
  city: string
  avatar_url: string
}

export default function ChatRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ClipLoader color="#64748b" size={50} />
        </div>
      }
    >
      <InnerChatRoom />
    </Suspense>
  )
}

function InnerChatRoom() {
  const searchParams = useSearchParams()
  const chatId = searchParams.get('id')
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!chatId) return
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .maybeSingle()
      if (chatError || !chatData) return
      const otherUserId = chatData.buyer_id === user.id ? chatData.seller_id : chatData.buyer_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, city, avatar_url')
        .eq('id', otherUserId)
        .maybeSingle()
      if (userError || !userData) return
      setOtherUser(userData)
      setLoadingUser(false)
    }
    fetchOtherUser()
  }, [chatId])

  if (!chatId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-subtext">No chat selected.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[92vh] bg-background text-text">
      <div className="sticky top-0 z-10 p-4 shadow-sm bg-white flex items-center gap-3 border-b border-subtext">
        {loadingUser ? (
          <p className="text-sm text-subtext">Loading user info...</p>
        ) : (
          <>
            {otherUser?.avatar_url ? (
              <div className="w-10 h-10 relative">
                <Image
                  src={otherUser.avatar_url}
                  alt="Avatar"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold">{otherUser?.name || 'User'}</span>
              <span className="text-xs text-subtext">{otherUser?.city || 'Unknown City'}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <Messages chatId={chatId} />
      </div>

      <div className="sticky bottom-0 z-10 p-4 border-t border-subtext bg-white shadow-sm">
        <div className="max-w-2xl mx-auto w-full">
          <MessageInput chatId={chatId} />
        </div>
      </div>
    </div>
  )
}








