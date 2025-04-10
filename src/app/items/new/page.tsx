'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { UploadCloud, Star } from 'lucide-react'
import Image from 'next/image'



export default function NewItemPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [locality, setLocality] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [qualityRating, setQualityRating] = useState(0)
  const [originalReceipt, setOriginalReceipt] = useState(false)
  const [deliveryAvailable, setDeliveryAvailable] = useState(false)
  const [error, setError] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      if (fileArray.length > 5) {
        setError('Maximum 5 images allowed')
        return
      }
      setImages(fileArray)
      setPreviewUrls(fileArray.map(file => URL.createObjectURL(file)))
    }
  }
  

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    if (!name || !price || !city || images.length === 0) {
      setError('Please fill all required fields and upload at least 1 image')
      setLoading(false)
      return
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (!user) {
      setError('User not logged in')
      console.error('Auth Error:', authError)
      setLoading(false)
      return
    }

    const itemId = uuidv4()
    const imageUrls: string[] = []

    for (const image of images) {
      const ext = image.name.split('.').pop()
      const path = `${itemId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('items').upload(path, image)
      if (uploadError) {
        setError('Image upload failed')
        console.error('Upload error for image:', image.name, uploadError.message)
        setLoading(false)
        return
      }
      const { data } = supabase.storage.from('items').getPublicUrl(path)
      imageUrls.push(data.publicUrl)
    }

    const itemData = {
      id: itemId,
      name,
      price,
      locality,
      city,
      description,
      images: imageUrls,
      quality_rating: qualityRating,
      has_receipt: originalReceipt,
      has_delivery: deliveryAvailable,
      user_id: user.id,
      is_sold: false,
      is_verified: false,
      created_at: new Date().toISOString()
    }

    const { error: insertError } = await supabase.from('items').insert(itemData)

    if (insertError) {
      setError('Failed to post item')
      setLoading(false)
      return
    }

    setSuccess('✔️ Item posted successfully!')
    setTimeout(() => router.push('/items'), 2000)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[91vh] p-6 bg-background text-text relative">
      {success && (
        <div className="absolute top-6 right-6 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-xl animate-fade-out shadow">
          <div className="flex items-center gap-2">
            <Image src="/assets/check.svg" alt="Check" width={20} height={20} />
            <span>Item posted successfully!</span>
          </div>
        </div>
      )}


      <div className="bg-surface border border-subtext rounded-xl shadow-md p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Post a New Item</h1>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span>Item Name<span className="text-red-500"> *</span></span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
            </label>

            <label className="flex flex-col">
              <span>Price (₹)<span className="text-red-500"> *</span></span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
            </label>

            <label className="flex flex-col">
              <span>Locality</span>
              <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
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
          </div>

          <label className="flex flex-col">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2 rounded-xl border border-subtext bg-background text-text" />
          </label>

          <label className="relative cursor-pointer bg-slate-100 text-sm font-medium px-4 py-2 rounded-xl border border-subtext hover:bg-slate-200 transition">
            <div className="flex items-center gap-2">
              <UploadCloud size={16} /> Upload Images (max. 5) [{images.length} selected]
            </div>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </label>
          {previewUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {previewUrls.map((url, idx) => (
                  <Image
                    key={idx}
                    src={url}
                    alt={`Preview ${idx}`}
                    width={70}
                    height={70}
                    className="rounded-lg object-cover border border-subtext aspect-square"
                  />
                ))}
              </div>
            )}
          <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setQualityRating(star)}>
                <Star size={20} className={qualityRating >= star ? 'text-yellow-500' : 'text-subtext'} />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={originalReceipt} onChange={() => setOriginalReceipt(!originalReceipt)} /> Original Receipt Available
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={deliveryAvailable} onChange={() => setDeliveryAvailable(!deliveryAvailable)} /> Delivery Available
            </label>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="bg-slate-400 text-slate-800 py-2 rounded-xl font-medium">
            {loading ? 'Posting...' : 'Post Item'}
          </button>

          {error && <p className="text-error mt-2 text-sm text-center">{error}</p>}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/items/request')}
            className="text-sm text-accent underline hover:opacity-80 transition"
          >
            Want to post a request instead?
          </button>
        </div>
      </div>
    </div>
  )
}


