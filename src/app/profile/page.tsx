"use client"

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, UploadCloud, UserCircle, CheckCircle2, Trash2 } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'items' | 'requests'>('settings')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [tempAvatar, setTempAvatar] = useState<File | null>(null)

  const [myItems, setMyItems] = useState<Item[]>([])
  const [visibleItems, setVisibleItems] = useState(6)
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [visibleRequests, setVisibleRequests] = useState(6)

  const [loading, setLoading] = useState(true)
  const router = useRouter()

  interface Item {
    id: string
    name: string
    price: number
    city: string
    locality?: string
    description: string
    quality_rating: number
    has_receipt: boolean
    has_delivery: boolean
    is_verified: boolean
    is_sold: boolean
    user_id: string
    created_at: string
    images: string[]
  }

  interface Request {
    id: string
    title: string
    description: string
    budget: number
    city: string
    locality?: string
    quality_min: number
    delivery_needed: boolean
    user_id: string
    created_at: string
  }

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      if (error || !currentUser) return router.push('/auth')
      setUser(currentUser)

      const { data: profileData, error: profileError } = await supabase.from('users').select('name, city, avatar_url').eq('id', currentUser.id).maybeSingle()
      if (profileError) toast.error('Failed to fetch profile data')
      if (profileData) {
        console.log('[DEBUG] Name from DB:', profileData.name)
        console.log('[DEBUG] City from DB:', profileData.city)
        console.log('[DEBUG] Avatar URL from DB:', profileData.avatar_url)
        setName(profileData.name || '')
        setCity(profileData.city || '')
        setAvatarUrl(profileData.avatar_url || '')
      }

      const { data: itemsData } = await supabase.from('items').select('*').eq('user_id', currentUser.id)
      setMyItems(itemsData || [])

      const { data: requestsData } = await supabase.from('requests').select('*').eq('user_id', currentUser.id)
      setMyRequests(requestsData || [])

      setLoading(false)
    }
    fetchUserAndData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleUpdate = async () => {
    if (!user) {
      toast.error('User is not logged in')
      return
    }
  
    let finalAvatarUrl = avatarUrl
  
    if (tempAvatar) {
      const fileExt = tempAvatar.name.split('.').pop()
      const path = `${user.id}/avatar.${fileExt}`
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(path, tempAvatar, { upsert: true })
  
      if (uploadError) {
        toast.error('Avatar upload failed')
        console.error('uploadError', uploadError)
        return
      }
  
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(path)
  
      finalAvatarUrl = urlData.publicUrl
      setAvatarUrl(finalAvatarUrl)
      setTempAvatar(null)
    }
  
    const { error } = await supabase
      .from('users')
      .update({ name, city, avatar_url: finalAvatarUrl })
      .eq('id', user.id)
  
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated successfully!')
    }
  }
  
  

  const markAsSold = async (id: string) => {
    await supabase.from('items').update({ is_sold: true }).eq('id', id)
    setMyItems((prev) => prev.map(item => item.id === id ? { ...item, is_sold: true } : item))
    toast.success('Marked as sold')
  }

  const removeItem = async (id: string) => {
    await supabase.from('items').delete().eq('id', id)
    setMyItems(prev => prev.filter(item => item.id !== id))
    toast.success('Item removed')
  }

  const removeRequest = async (id: string) => {
    await supabase.from('requests').delete().eq('id', id)
    setMyRequests(prev => prev.filter(req => req.id !== id))
    toast.success('Request removed')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-background text-text p-6 flex gap-6">
      <div className="w-1/5 sticky top-6 h-fit border-r border-subtext pr-6 flex flex-col justify-between py-4">
        <div className="flex flex-col gap-3 pl-4">
          <button className={`text-left ${activeTab === 'settings' ? 'font-bold text-primary' : 'text-text'}`} onClick={() => setActiveTab('settings')}>Settings</button>
          <button className={`text-left ${activeTab === 'items' ? 'font-bold text-primary' : 'text-text'}`} onClick={() => setActiveTab('items')}>My Items</button>
          <button className={`text-left ${activeTab === 'requests' ? 'font-bold text-primary' : 'text-text'}`} onClick={() => setActiveTab('requests')}>My Requests</button>
        </div>
        <button onClick={handleLogout} className="text-error flex gap-2 items-center mt-6 pl-4">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="w-4/5">
        {activeTab === 'settings' && (
          <div className="bg-surface border border-subtext p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="flex flex-col items-center gap-4">
              {avatarUrl ? <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="rounded-full border object-cover" /> : <UserCircle size={96} className="text-subtext" />}
              <label className="relative cursor-pointer bg-slate-100 text-sm font-medium px-4 py-2 rounded-xl border border-subtext">
                <div className="flex items-center gap-2">
                  <UploadCloud size={16} /> Upload Avatar
                </div>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setTempAvatar(file)
                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </label>
              <input type="text" value={name} onChange={(e) => {
                setName(e.target.value)
              }} placeholder="Full Name" className="w-full max-w-sm px-4 py-2 rounded-xl border text-center" />
              <input type="text" value={city} onChange={(e) => {
                setCity(e.target.value)
              }} placeholder="City" className="w-full max-w-sm px-4 py-2 rounded-xl border text-center" />
              <button onClick={handleUpdate} className="bg-slate-400 text-slate-800 rounded-xl px-6 py-2 hover:opacity-90 transition">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <InfiniteScroll
            dataLength={visibleItems}
            next={() => setVisibleItems(prev => prev + 6)}
            hasMore={visibleItems < myItems.length}
            loader={<p className="text-center text-sm text-subtext py-4">Loading more items...</p>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myItems.slice(0, visibleItems).map((item) => (
                <div key={item.id} className="border p-4 rounded-xl bg-white shadow flex flex-col gap-2">
                  <div className="text-lg font-semibold">{item.name}</div>
                  <div className="text-sm">₹{item.price}</div>
                  <div className="text-sm">{item.city}</div>
                  <div className="flex gap-2 mt-2">
                    {!item.is_sold && <button onClick={() => markAsSold(item.id)} className="text-sm px-3 py-1 bg-green-200 text-green-800 rounded-xl flex items-center gap-1"><CheckCircle2 size={14} /> Mark as Sold</button>}
                    <button onClick={() => removeItem(item.id)} className="text-sm px-3 py-1 bg-red-200 text-red-800 rounded-xl flex items-center gap-1"><Trash2 size={14} /> Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}

        {activeTab === 'requests' && (
          <InfiniteScroll
            dataLength={visibleRequests}
            next={() => setVisibleRequests(prev => prev + 6)}
            hasMore={visibleRequests < myRequests.length}
            loader={<p className="text-center text-sm text-subtext py-4">Loading more requests...</p>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRequests.slice(0, visibleRequests).map((req) => (
                <div key={req.id} className="border p-4 rounded-xl bg-white shadow flex flex-col gap-2">
                  <div className="text-lg font-semibold">{req.title}</div>
                  <div className="text-sm">Budget: ₹{req.budget}</div>
                  <div className="text-sm">{req.city}</div>
                  <div className="flex justify-end mt-2">
                    <button onClick={() => removeRequest(req.id)} className="text-sm px-3 py-1 bg-red-200 text-red-800 rounded-xl flex items-center gap-1"><Trash2 size={14} /> Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  )
}


