'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, UserCircle, UploadCloud } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [tempAvatar, setTempAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('Auth error:', userError.message)
        setError('Auth error: ' + userError.message)
        setLoading(false)
        return
      }

      if (!currentUser) {
        router.push('/auth')
        return
      }

      setUser(currentUser)

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (profileError || !profileData) {
        console.error('Profile fetch error:', profileError?.message)
        setError('Failed to fetch profile: ' + (profileError?.message || 'No profile found'))
        setLoading(false)
        return
      }

      setName(profileData.name || '')
      setCity(profileData.city || '')
      setAvatarUrl(profileData.avatar_url || '')
      setLoading(false)
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleUpdate = async () => {
    setError('')
    let finalAvatarUrl = avatarUrl

    if (tempAvatar && user?.id) {
      const fileExt = tempAvatar.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, tempAvatar, { upsert: true })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError.message)
        setError('Failed to upload avatar')
        return
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      finalAvatarUrl = data.publicUrl
      setAvatarUrl(finalAvatarUrl)
    }

    const updates = {
      name: name.trim(),
      city: city.trim(),
      avatar_url: finalAvatarUrl || null
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError.message)
      setError('Failed to update profile: ' + updateError.message)
    } else {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-text relative">
      {showSuccess && (
        <div className="absolute top-10 z-50 bg-green-100 text-green-700 px-5 py-3 rounded-xl flex items-center gap-2 shadow-xl opacity-100 animate-fade-out duration-300 transition-all">
          <Image src="/assets/check.svg" alt="Success" width={20} height={20} />
          <span>Profile updated!</span>
        </div>
      )}

      <div className="bg-surface border border-subtext rounded-xl shadow-md p-8 max-w-lg w-full relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Your Profile</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-error hover:underline">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-subtext" />
          ) : (
            <UserCircle size={96} className="text-subtext" />
          )}
          <label className="relative cursor-pointer bg-slate-100 text-sm font-medium px-4 py-2 rounded-xl border border-subtext hover:bg-slate-200 transition">
            <div className="flex items-center gap-2">
              <UploadCloud size={16} /> Upload Avatar
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setTempAvatar(file)
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-subtext rounded-xl bg-background text-text placeholder-subtext"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border border-subtext rounded-xl bg-background text-text placeholder-subtext"
          />
          <button
            onClick={handleUpdate}
            className="w-full py-2 rounded-xl font-medium bg-slate-400 text-blue-900 hover:opacity-90"
          >
            Save Changes
          </button>
        </div>

        {error && <p className="text-sm mt-4 text-center text-error">{error}</p>}
      </div>
    </div>
  )
}
