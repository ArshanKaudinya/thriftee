'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    console.log('Form values:', {
      title,
      description,
      budget,
      city,
      locality,
      minQuality,
      needsDelivery
    })

    if (!title || !budget || !city) {
      setError('Please fill all required fields')
      console.warn('Missing required fields')
      setLoading(false)
      return
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError.message)
    }

    if (!user) {
      setError('User not logged in')
      console.warn('User not found in auth session')
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

    console.log('Prepared request payload:', request)

    const { error: insertError } = await supabase.from('requests').insert(request)

    if (insertError) {
      console.error('Supabase insert error:', insertError.message)
      setError('Failed to submit request')
      setLoading(false)
      return
    }

    console.log('Request submitted successfully!')
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
    <div className="flex items-center justify-center min-h-screen p-6 bg-background text-text">
      <div className="bg-surface border border-subtext rounded-xl shadow-md p-8 max-w-lg w-full relative">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Post a Request</h1>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span>
              Title<span className="text-red-500"> *</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-2 rounded-xl border border-subtext bg-background text-text"
            />
          </label>

          <label className="flex flex-col">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-2 rounded-xl border border-subtext bg-background text-text"
            />
          </label>

          <label className="flex flex-col">
            <span>
              Budget (₹)
              <span className="text-red-500"> *</span>
            </span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="px-4 py-2 rounded-xl border border-subtext bg-background text-text"
            />
          </label>

          <label className="flex flex-col">
            <span>
              City<span className="text-red-500"> *</span>
            </span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-2 rounded-xl border border-subtext bg-background text-text"
            >
              <option value="">Select City</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span>Locality</span>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="px-4 py-2 rounded-xl border border-subtext bg-background text-text"
            />
          </label>

          <div className="flex flex-col">
            <span>Minimum Quality</span>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  onClick={() => setMinQuality(star)}
                  className={`cursor-pointer ${
                    star <= minQuality ? 'fill-yellow-500 text-yellow-500' : 'text-subtext'
                  }`}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needsDelivery}
              onChange={() => setNeedsDelivery(!needsDelivery)}
            />
            Delivery Needed
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-slate-400 text-slate-800 py-2 rounded-xl font-medium hover:opacity-90"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>

          {error && <p className="text-error mt-2 text-sm text-center">{error}</p>}
        </div>

        {success && (
        <div className="fixed top-12 right-1 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-xl animate-fade-out shadow z-50">
            <div className="flex items-center gap-2">
            <Image src="/assets/check.svg" alt="Check" width={20} height={20} />
            <span>{success}</span>
            </div>
        </div>
        )}

      </div>
    </div>
  )
}



