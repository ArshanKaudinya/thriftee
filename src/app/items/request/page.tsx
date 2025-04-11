'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import Image from 'next/image'

export default function RequestPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [city, setCity] = useState('')
  const [locality, setLocality] = useState('')
  const [minQuality, setMinQuality] = useState(0)
  const [needsDelivery, setNeedsDelivery] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    if (!title || !budget || !city) {
      setError('Please fill all required fields')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('User not logged in')
      setLoading(false)
      return
    }

    const request = {
      title,
      description,
      budget: Number(budget),
      city,
      locality,
      quality_min: minQuality,
      delivery_needed: needsDelivery,
      user_id: user.id,
      created_at: new Date().toISOString()
    }

    const { error: insertError } = await supabase.from('requests').insert(request)
    if (insertError) {
      setError('Failed to submit request')
      setLoading(false)
      return
    }

    setSuccess('Request submitted successfully!')
    setTitle('')
    setDescription('')
    setBudget('')
    setCity('')
    setLocality('')
    setMinQuality(0)
    setNeedsDelivery(false)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[91vh] p-6 bg-background text-text relative">
      <div className="bg-surface border border-subtext rounded-xl shadow-md px-8 py-6 w-xl max-w-5xl">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Post a Request</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span>Title<span className="text-red-500"> *</span></span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
          </label>

          <label className="flex flex-col">
            <span>Budget (₹)<span className="text-red-500"> *</span></span>
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
          </label>

          <label className="flex flex-col md:col-span-2">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
          </label>

          <label className="flex flex-col">
            <span>City<span className="text-red-500"> *</span></span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text font-medium">
              <option value="">Select City</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span>Locality</span>
            <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
          </label>

          <div className="flex flex-col">
            <span>Minimum Quality</span>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={20} onClick={() => setMinQuality(star)} className={`cursor-pointer ${star <= minQuality ? 'fill-yellow-500 text-yellow-500' : 'text-subtext'}`} />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={needsDelivery} onChange={() => setNeedsDelivery(!needsDelivery)} /> Delivery Needed
          </label>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="mt-6 w-full bg-slate-400 text-slate-800 py-2 rounded-xl font-medium hover:opacity-90">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>

        {error && <p className="text-error mt-3 text-sm text-center">{error}</p>}
        {success && (
          <div className="absolute top-6 right-6 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-xl animate-fade-out shadow z-50">
            <div className="flex items-center gap-2">
              <Image src="/assets/check.svg" alt="Check" width={20} height={20} />
              <span>{success}</span>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button onClick={() => router.push('/items/new')} className="text-sm text-accent underline hover:opacity-80 transition">
            Want to post an item instead?
          </button>
        </div>
      </div>
    </div>
  )
}




