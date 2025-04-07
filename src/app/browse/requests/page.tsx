'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import InfiniteScroll from 'react-infinite-scroll-component'
import { supabase } from '@/lib/supabase'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'

const queryClient = new QueryClient()

interface Request {
  id: string
  title: string
  description?: string
  budget: number
  city: string
  locality?: string
  quality_min: number
  delivery_needed?: boolean
  created_at?: string
  user_id: string
}

function BrowseRequestsContent() {
  const router = useRouter()
  const [minBudget, setMinBudget] = useState(0)
  const [maxBudget, setMaxBudget] = useState(50000)
  const [minQuality, setMinQuality] = useState(0)
  const [city, setCity] = useState('')
  const [needsDelivery, setNeedsDelivery] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  const cities = [ /* ...state list...*/ ]

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data } = await supabase.from('requests').select('*')
      return data || []
    },
  })

  const filteredRequests = requests.filter(req =>
    req.budget >= minBudget &&
    req.budget <= maxBudget &&
    req.quality_min >= minQuality &&
    (city ? req.city === city : true) &&
    (!needsDelivery || req.delivery_needed)
  )

  const clearFilters = () => {
    setMinBudget(0)
    setMaxBudget(50000)
    setMinQuality(0)
    setCity('')
    setNeedsDelivery(false)
  }

  const loadMore = () => setVisibleCount(prev => prev + 6)

  const startChat = async (req: Request) => {
    console.log('[startChat] request:', req.id)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('Log in to chat')
        return
      }
      if (req.user_id === user.id) {
        toast.error("You can't chat with yourself")
        return
      }
      const { data: existingChat, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('item_id', req.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', req.user_id)
        .maybeSingle()
      if (fetchError) throw fetchError
      if (existingChat) {
        router.push(`/chat/chatRoom?id=${existingChat.id}`)
        return
      }
      const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert({
          item_id: req.id,
          seller_id: req.user_id,
          buyer_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle()
      if (insertError || !newChat) throw insertError
      toast.success('Chat started')
      router.push(`/chat/chatRoom?id=${newChat.id}`)
    } catch (err) {
      console.error('[startChat] error:', err)
      toast.error('Failed to start chat')
    }
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Filters UI omitted for brevity; keep as before */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <ClipLoader color="#64748b" size={40} />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={visibleCount}
          next={loadMore}
          hasMore={visibleCount < filteredRequests.length}
          loader={<p className="text-center text-sm text-subtext">Loading more requests...</p>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredRequests.slice(0, visibleCount).map(req => (
              <div
                key={req.id}
                className="border rounded-xl p-4 bg-white shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-semibold truncate">
                      {req.title}
                    </span>
                    <button
                      onClick={() => startChat(req)}
                      className="w-24 py-1.5 rounded-xl bg-white border-2 border-slate-400 text-slate-800 font-medium hover:opacity-90"
                    >
                      Chat
                    </button>
                  </div>
                  {req.description && (
                    <div className="text-sm text-text mb-4 max-h-32 overflow-hidden">
                      {req.description}
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-2 flex flex-col gap-2 text-sm text-subtext">
                  <div className="flex justify-between">
                    <span>Budget: ₹{req.budget}</span>
                    <span>
                      City: {req.locality ? `${req.locality}, ` : ''}{req.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(req.quality_min)].map((_, i) => (
                        <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                      ))}
                      <span className="ml-1">Min Quality</span>
                    </div>
                    {req.delivery_needed && (
                      <div className="flex items-center gap-1 text-xs">
                        <Image src="/assets/check.svg" alt="check" width={16} height={16} />
                        Delivery
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}

export default function BrowseRequestsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowseRequestsContent />
    </QueryClientProvider>
  )
}







